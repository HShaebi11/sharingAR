import ModelCard from "./ModelCard";
import { listModelsBlob, ModelItem } from "@/lib/storage-blob";
import UploadComponent from "./components/UploadComponent";

export default async function Home() {
  const repoUrl = "#";

  let error: string | null = null;
  const privateFiles: ModelItem[] = [];
  const publicFiles: ModelItem[] = [];

  try {
    const [privateList, publicList] = await Promise.all([
      listModelsBlob("private"), // lists viewStroage/private
      listModelsBlob("public"),  // lists viewStroage/public
    ]);
    privateFiles.push(...privateList);
    publicFiles.push(...publicList);
  } catch (e) {
    console.error(e);
    error = e instanceof Error ? e.message : "Failed to load models";
  }

  return (
    <main className="main">
      <header className="header">
        <div>
          <h1 className="title">Sharing AR</h1>
          <p className="subtitle">
            Put .usdz files in models/private or models/public (public = shareable link). Open on iOS Safari to view in AR.
          </p>
        </div>
        <UploadComponent />
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
            No .usdz files yet. Upload .usdz files to <code>viewStroage/models/private/</code> in your Vercel Blob store.
          </p>
        ) : (
          <ul className="grid">
            {privateFiles.map((item) => (
              <li key={item.name}>
                <ModelCard
                  name={item.name.split("/").pop() || item.name}
                  proxyUrl={`/api/ar/${item.name}`} // Pass the full pathname (which includes models/private/...)
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
            No .usdz files yet. Upload .usdz files to <code>viewStroage/models/public/</code> in your Vercel Blob store.
          </p>
        ) : (
          <ul className="grid">
            {publicFiles.map((item) => (
              <li key={item.name}>
                <ModelCard
                  name={item.name.split("/").pop() || item.name}
                  proxyUrl={`/api/ar/${item.name}`}
                  showCopyLink={true}
                />
              </li>
            ))}
          </ul>
        )
        }
      </section >
    </main >
  );
}
