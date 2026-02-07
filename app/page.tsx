import { list } from "@vercel/blob";
import { getBlobToken } from "@/app/lib/blob";
import ModelCard from "./ModelCard";
import UploadForm from "./UploadForm";

async function listUsdzFromBlob(folder: string): Promise<string[]> {
  const prefix = `${folder}/`;
  const token = getBlobToken();
  // #region agent log
  const payload = {
    location: "app/page.tsx:listUsdzFromBlob",
    message: "before list()",
    data: { folder, tokenDefined: token != null, tokenLength: token?.length ?? 0 },
    timestamp: Date.now(),
    sessionId: "debug-session",
    hypothesisId: "H4",
  };
  fetch("http://127.0.0.1:7247/ingest/3472bf24-0680-40cd-92fd-96d67b4de365", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      require("fs").appendFileSync(
        process.cwd() + "/.cursor/debug.log",
        JSON.stringify(payload) + "\n"
      );
    } catch (_) {}
  }
  // #endregion
  const result = await list({ prefix, token });

  return result.blobs
    .filter((blob) => blob.pathname.toLowerCase().endsWith(".usdz"))
    .map((blob) => blob.pathname)
    .sort();
}

export const revalidate = 60;

export default async function Home() {
  let error: string | null = null;
  const privateFiles: string[] = [];
  const publicFiles: string[] = [];

  try {
    const [privateList, publicList] = await Promise.all([
      listUsdzFromBlob("private"),
      listUsdzFromBlob("public"),
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
          Upload .usdz files to private or public folders. Public models get a shareable link. Open on iOS Safari to view in AR.
        </p>
      </header>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <UploadForm />

      <section className="folder-section">
        <h2 className="folder-title">Private</h2>
        <p className="folder-desc">View in AR only; no share link.</p>
        {privateFiles.length === 0 ? (
          <p className="empty">No .usdz files yet. Upload one above.</p>
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
          <p className="empty">No .usdz files yet. Upload one above.</p>
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
