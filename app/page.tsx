import ModelCard from "./ModelCard";

import { listModelsR2 } from "@/lib/storage-r2";

// ... (keep GITHUB config functions if we want to fallback, but for now we replace for R2)

export default async function Home() {
  // const { repo } = getGitHubConfig();
  // const repoUrl = `https://github.com/${repo}`;
  const repoUrl = "#"; // TODO: Update to R2 dashboard or repo link if relevant

  let error: string | null = null;
  const privateFiles: string[] = [];
  const publicFiles: string[] = [];

  try {
    const [privateList, publicList] = await Promise.all([
      listModelsR2("private"),
      listModelsR2("public"),
    ]);
    privateFiles.push(...privateList);
    publicFiles.push(...publicList);
  } catch (e) {
    console.error(e);
    // If R2 credentials aren't set, we might show a clearer error or fallback
    // For now, generic error:
    error = e instanceof Error ? e.message : "Failed to load models (check R2 config)";
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
            No .usdz files yet. Upload .usdz files to <code>private/</code> in your R2 bucket.
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
            No .usdz files yet. Upload .usdz files to <code>public/</code> in your R2 bucket.
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
