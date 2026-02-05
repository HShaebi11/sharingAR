import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    const folder = searchParams.get("folder") || "private"; // default to private

    if (!filename || !request.body) {
        return NextResponse.json({ error: "Filename and body required" }, { status: 400 });
    }

    // Enforce .usdz extension
    if (!filename.toLowerCase().endsWith(".usdz")) {
        return NextResponse.json({ error: "Only .usdz files are allowed" }, { status: 400 });
    }

    // Validate folder
    if (folder !== "public" && folder !== "private") {
        return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    const pathname = `models/${folder}/${filename}`;

    try {
        const blob = await put(pathname, request.body, {
            access: "public",
        });

        return NextResponse.json(blob);
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
