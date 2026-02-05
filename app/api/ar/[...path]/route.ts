import { NextRequest, NextResponse } from "next/server";
import { getModelStreamR2 } from "@/lib/storage-r2";

const USDZ_MIME = "model/vnd.usdz+zip";

// Define a type for the response body that matches what Next.js expects along with Stream/NodeJS.ReadableStream
// NextResponse can take a ReadableStream.
// We'll trust the types from the SDK and Next.js are compatible enough or cast if needed.

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
    const { stream, contentType, contentLength } = await getModelStreamR2(filename);

    const headers = new Headers({
      "Content-Type": contentType || USDZ_MIME,
      "Cache-Control": "public, max-age=3600",
    });
    if (contentLength) headers.set("Content-Length", contentLength.toString());

    // Cast the stream to any because AWS SDK streams (IncomingMessage/Readable) 
    // and Web Streams (ReadableStream) can have type mismatches in some envs, 
    // but Next.js handles Node streams fine.
    return new NextResponse(stream as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    if (err.name === "NoSuchKey") {
      return new NextResponse("Not found", { status: 404 });
    }
    console.error("Proxy fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch model" },
      { status: 502 }
    );
  }
}
