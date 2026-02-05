import ModelCard from "./ModelCard";
import { getStorage } from "@/lib/storage";

const FOLDERS = ["private", "public"] as const;

function getRepoUrl(): string {
  const repo = process.env.GITHUB_REPO ?? "hamzashaebi/sharingAR";
  return `https://github.com/${repo}`;
}

export default async function Home() {
  const repoUrl = getRepoUrl();
  let error: string | null = null;
  const privateFiles: string[] = [];
  const publicFiles: string[] = [];

  try {
    const storage = getStorage();
    const [privateList, publicList] = await Promise.all([
      storage.listFiles("private"),
      storage.listFiles("public"),
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
          Put .usdz files in <code>models/private</code> or{" "}
          <code>models/public</code> (public = shareable link). Open on iOS Safari
          to view in AR.
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
            No .usdz files yet.{" "}
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
              Create <code>models/private</code>
            </a>{" "}
            in your repo and add .usdz files.
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
            No .usdz files yet.{" "}
            <a href={repoUrl} target="_blank" rel="noopener noreferrer">
              Create <code>models/public</code>
            </a>{" "}
            in your repo and add .usdz files.
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
