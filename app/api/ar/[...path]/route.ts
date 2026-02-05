import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";

const USDZ_MIME = "model/vnd.usdz+zip";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const filename = pathSegments?.join("/");
  if (!filename || !filename.toLowerCase().endsWith(".usdz")) {
    return NextResponse.json(
      { error: "Invalid or missing .usdz path" },
      { status: 400 }
    );
  }

  try {
    const storage = getStorage();
    const res = await storage.getFile(filename);

    if (!res.ok) {
      if (res.status === 404) {
        return new NextResponse("Not found", { status: 404 });
      }
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
