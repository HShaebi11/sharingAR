import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getBlobToken } from "@/app/lib/blob";

const USDZ_MIME = "model/vnd.usdz+zip";
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".usdz")) {
      return NextResponse.json(
        { error: "Only .usdz files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 100 MB)" },
        { status: 400 }
      );
    }

    const targetFolder = folder === "public" ? "public" : "private";
    const pathname = `${targetFolder}/${file.name}`;

    const blob = await put(pathname, file, {
      access: "public",
      contentType: USDZ_MIME,
      addRandomSuffix: false,
      token: getBlobToken(),
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
