import { notFound } from "next/navigation";
import ModelView from "../../ModelView";

type Props = { params: Promise<{ path: string[] }> };

function encodePath(filename: string): string {
  return filename.split("/").map(encodeURIComponent).join("/");
}

export async function generateMetadata({ params }: Props) {
  const { path: pathSegments } = await params;
  const filename = pathSegments?.join("/");
  if (!filename || !filename.toLowerCase().endsWith(".usdz")) {
    return { title: "Not found – Sharing AR" };
  }
  const displayName = filename.replace(/\.usdz$/i, "");
  return {
    title: `View ${displayName} in AR – Sharing AR`,
    description: `View ${displayName} in augmented reality with Apple AR Quick Look.`,
  };
}

export default async function ModelPage({ params }: Props) {
  const { path: pathSegments } = await params;
  const filename = pathSegments?.join("/");
  if (!filename || !filename.toLowerCase().endsWith(".usdz")) {
    notFound();
  }
  const proxyUrl = `/api/ar/${encodePath(filename)}`;
  const displayName = filename.replace(/\.usdz$/i, "");

  return (
    <main className="main model-page">
      <header className="header">
        <h1 className="title">{displayName}</h1>
        <p className="subtitle">Open on iOS Safari to view in AR.</p>
      </header>
      <ModelView name={filename} proxyUrl={proxyUrl} />
    </main>
  );
}
