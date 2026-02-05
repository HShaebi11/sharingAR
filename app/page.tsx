import ModelCard from "./ModelCard";

const GITHUB_API = "https://api.github.com";

function getConfig() {
  const repo = process.env.GITHUB_REPO ?? "hamzashaebi/sharingAR";
  const path = process.env.GITHUB_PATH ?? "models";
  const branch = process.env.GITHUB_BRANCH ?? "main";
  return { repo, path, branch };
}

type GitHubContentItem = {
  name: string;
  type: string;
  path: string;
};

async function listUsdzFiles(): Promise<string[]> {
  const { repo, path } = getConfig();
  const token = process.env.GITHUB_TOKEN;
  const url = `${GITHUB_API}/repos/${repo}/contents/${path}`;
  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: token
      ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }
      : { Accept: "application/vnd.github.v3+json" },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        `Repository or path not found. Check GITHUB_REPO and GITHUB_PATH in Vercel, then redeploy. Tried: ${repo}, ${path}`
      );
    }
    if (res.status === 403) {
      throw new Error(
        "Access denied. If the repo is private, add GITHUB_TOKEN in Vercel."
      );
    }
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data = (await res.json()) as GitHubContentItem[];
  if (!Array.isArray(data)) return [];

  return data
    .filter((item) => item.type === "file" && item.name.toLowerCase().endsWith(".usdz"))
    .map((item) => item.name)
    .sort();
}

export default async function Home() {
  let files: string[] = [];
  let error: string | null = null;

  try {
    files = await listUsdzFiles();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load models";
  }

  return (
    <main className="main">
      <header className="header">
        <h1 className="title">Sharing AR</h1>
        <p className="subtitle">
          Drop .usdz files into the <code>models/</code> folder, push to GitHub;
          they appear here. Open on iOS Safari to view in AR.
        </p>
      </header>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      {files.length === 0 && !error && (
        <p className="empty">No .usdz files in the models folder yet.</p>
      )}

      <ul className="grid">
        {files.map((filename) => (
          <li key={filename}>
            <ModelCard
              name={filename}
              proxyUrl={`/api/ar/${filename.split("/").map(encodeURIComponent).join("/")}`}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
