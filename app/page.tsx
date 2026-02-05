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
  // #region agent log
  fetch("http://127.0.0.1:7247/ingest/3472bf24-0680-40cd-92fd-96d67b4de365", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "app/page.tsx:listUsdzFiles",
      message: "GitHub list request",
      data: {
        repo,
        path,
        url,
        hasToken: !!token,
        repoFromEnv: !!process.env.GITHUB_REPO,
        pathFromEnv: !!process.env.GITHUB_PATH,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion
  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: token
      ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }
      : { Accept: "application/vnd.github.v3+json" },
  });

  if (!res.ok) {
    const bodyText = await res.text();
    // #region agent log
    fetch("http://127.0.0.1:7247/ingest/3472bf24-0680-40cd-92fd-96d67b4de365", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "app/page.tsx:listUsdzFiles",
        message: "GitHub API error response",
        data: {
          status: res.status,
          statusText: res.statusText,
          bodySnippet: bodyText.slice(0, 500),
          repo,
          path,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "B,C,E",
      }),
    }).catch(() => {});
    // #endregion
    if (res.status === 404) {
      throw new Error(
        `Repository or path not found (GitHub 404). Tried: ${repo}, ${path}. ` +
          "Set GITHUB_REPO in Vercel to your repo (e.g. your-username/sharingAR). " +
          "If the repo is private, add GITHUB_TOKEN. Ensure the models/ folder exists and is pushed, then redeploy."
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

  const files = data
    .filter((item) => item.type === "file" && item.name.toLowerCase().endsWith(".usdz"))
    .map((item) => item.name)
    .sort();
  // #region agent log
  fetch("http://127.0.0.1:7247/ingest/3472bf24-0680-40cd-92fd-96d67b4de365", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "app/page.tsx:listUsdzFiles",
      message: "GitHub list success",
      data: { repo, path, fileCount: files.length, fileNames: files },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "success",
    }),
  }).catch(() => {});
  // #endregion
  return files;
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
