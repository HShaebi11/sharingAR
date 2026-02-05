import ModelCard from "./ModelCard";

const GITHUB_API = "https://api.github.com";

function getGitHubConfig() {
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

async function listUsdzFromGitHub(subpath: string): Promise<string[]> {
  const { repo, path } = getGitHubConfig();
  const token = process.env.GITHUB_TOKEN;
  const url = `${GITHUB_API}/repos/${repo}/contents/${path}/${subpath}`;
  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: token
      ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }
      : { Accept: "application/vnd.github.v3+json" },
  });

  if (!res.ok) {
    if (res.status === 404) return [];
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
    .map((item) => `${subpath}/${item.name}`)
    .sort();
}

export default async function Home() {
  const { repo } = getGitHubConfig();
  const repoUrl = `https://github.com/${repo}`;
  let error: string | null = null;
  const privateFiles: string[] = [];
  const publicFiles: string[] = [];

  try {
    const [privateList, publicList] = await Promise.all([
      listUsdzFromGitHub("private"),
      listUsdzFromGitHub("public"),
    ]);
    privateFiles.push(...privateList);
    publicFiles.push(...publicList);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load models";
  }

  return (
    <main className="main">
      <header className="header">
        <h1 className="title">Sharing AR</h1>
        <p className="subtitle">
          Put .usdz files in models/private or models/public (public = shareable link). Open on iOS Safari to view in AR.
        </p>
      </header>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <section className="folder-section">
        <h2 className="folder-title">Private</h2>
        <p className="folder-desc">View in AR only; no share link.</p>
        {privateFiles.length === 0 ? (
          <p className="empty">
            No .usdz files yet. <a href={repoUrl} target="_blank" rel="noopener noreferrer">Create <code>models/private</code></a> in your repo and add .usdz files.
          </p>
        ) : (
          <ul className="grid">
            {privateFiles.map((filename) => (
              <li key={filename}>
                <ModelCard
                  name={filename}
                  proxyUrl={`/api/ar/${filename.split("/").map(encodeURIComponent).join("/")}`}
                  showCopyLink={false}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="folder-section">
        <h2 className="folder-title">Public</h2>
        <p className="folder-desc">Shareable link with Copy link.</p>
        {publicFiles.length === 0 ? (
          <p className="empty">
            No .usdz files yet. <a href={repoUrl} target="_blank" rel="noopener noreferrer">Create <code>models/public</code></a> in your repo and add .usdz files.
          </p>
        ) : (
          <ul className="grid">
            {publicFiles.map((filename) => (
              <li key={filename}>
                <ModelCard
                  name={filename}
                  proxyUrl={`/api/ar/${filename.split("/").map(encodeURIComponent).join("/")}`}
                  showCopyLink={true}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
