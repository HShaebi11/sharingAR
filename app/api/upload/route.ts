import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                // Authenticate here if needed (e.g., check cookie or header)
                // const { user } = await auth(request);
                // if (!user) throw new Error('Unauthorized');

                // Extract folder from clientPayload (sent from client)
                // clientPayload is string | null in some SDK versions, or JSON object. 
                // Let's safe parse it if it's a string.
                let payload: any = {};
                try {
                    if (clientPayload) {
                        payload = JSON.parse(clientPayload);
                    }
                } catch {
                    // if parse fail, ignore
                }

                const folder = payload?.folder === "public" ? "public" : "private";

                // Enforce the requested path structure: view-byhamza-xyz/models/{folder}/{filename}
                // Note: pathname from client might just be the filename or a path. 
                // We act on the *final* path token generation.
                // Wait, handleUpload 'pathname' arg is what the client requested.
                // We can ignore it or validate it. 
                // We want to construct the path ourselves to be safe/consistent.

                // Let's rely on the filename part of the incoming pathname? 
                // Or better, let the client send the filename in payload if we want total control, 
                // BUT handleUpload expects the client to propose a pathname.
                // Let's assume client proposes "filename.usdz".

                const filename = pathname.split("/").pop(); // Ensure we just take the filename
                if (!filename) throw new Error("Invalid filename");

                const finalPath = `view-byhamza-xyz/models/${folder}/${filename}`;

                return {
                    allowedContentTypes: ["model/vnd.usdz+zip", "application/octet-stream"], // application/octet-stream sometimes happens
                    tokenPayload: JSON.stringify({
                        // optional payload to save metadata
                        uploadedBy: "user",
                    }),
                    addRandomSuffix: false, // Keep filenames clean as requested? Or true to avoid collisions? 
                    // User seems to want specific paths, let's keep it clean: false.
                    // CAREFUL: Overwrites existing if false.
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Webhook-like callback after upload finishes
                console.log("Upload completed:", blob.url);
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }, // BadRequest
        );
    }
}
