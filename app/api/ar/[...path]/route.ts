import { NextRequest, NextResponse } from "next/server";
import { listModelsBlob } from "@/lib/storage-blob";

// We need to look up the Blob URL based on the pathname. 
// Vercel Blob URLs are unique strings, we can't construct them just from the filename.
// So we use listModelsBlob again or a specialized head() lookup if we had one.
// Since list is fast and cached, we can filter.

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const filename = pathSegments?.join("/"); // e.g., "models/public/foo.usdz" or just "public/foo.usdz" if that's what we pass

  if (!filename || !filename.toLowerCase().endsWith(".usdz")) {
    return NextResponse.json(
      { error: "Invalid path" },
      { status: 400 }
    );
  }

  // The client passes the Full Pathname in the URL now, e.g. /api/ar/models/public/foo.usdz
  // But wait, the previous code split on '/' and encoded components.
  // Let's assume the client sends the path as segments that reconstruct to the blob pathname.

  try {
    // 1. Find the blob URL. 
    // Optimization: Depending on scale, listing all might be slow. 
    // But for this use case (personal folio), it's fine.
    // We search in the parent "folder" of the requested file.

    // Extract prefix
    const lastSlash = filename.lastIndexOf("/");
    const prefix = lastSlash > -1 ? filename.substring(0, lastSlash) : "";

    // List blobs in that prefix
    const blobs = await listModelsBlob(prefix);
    const blob = blobs.find(b => b.name === filename);

    if (!blob) {
      return new NextResponse("Not found", { status: 404 });
    }

    // 2. Fetch the blob content
    const res = await fetch(blob.url);
    if (!res.ok) {
      return new NextResponse(`Upstream error: ${res.status}`, { status: res.status });
    }

    // 3. Proxy it
    const headers = new Headers(res.headers);
    // Ensure correct content type for AR
    headers.set("Content-Type", "model/vnd.usdz+zip");

    return new NextResponse(res.body, {
      status: 200,
      headers
    });

  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch model" },
      { status: 502 }
    );
  }
}
