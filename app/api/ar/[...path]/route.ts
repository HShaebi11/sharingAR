import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { getBlobToken } from "@/app/lib/blob";
import { isValidBlobPathname } from "@/app/lib/blob-paths";

const USDZ_MIME = "model/vnd.usdz+zip";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const pathname = pathSegments?.join("/");
  if (!pathname || !isValidBlobPathname(pathname)) {
    return NextResponse.json(
      { error: "Invalid or missing .usdz path" },
      { status: 400 }
    );
  }

  try {
    // Find the blob by its pathname (prefix matches this path only)
    const result = await list({
      prefix: pathname,
      token: getBlobToken(),
    });

    const blob = result.blobs.find((b) => b.pathname === pathname);

    if (!blob) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Fetch the file from Vercel Blob CDN
    const res = await fetch(blob.url);

    if (!res.ok) {
      return new NextResponse(`Upstream error: ${res.status}`, {
        status: res.status,
      });
    }

    const contentLength = res.headers.get("content-length");

    const headers = new Headers({
      "Content-Type": USDZ_MIME,
      "Cache-Control": "public, max-age=3600",
    });
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(res.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Proxy fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch model" },
      { status: 502 }
    );
  }
}
