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

                // Enforce the requested path structure: viewStroage/models/{folder}/{filename}
                const filename = pathname.split("/").pop();
                if (!filename) throw new Error("Invalid filename");

                const expectedPath = `viewStroage/models/${folder}/${filename}`;

                if (pathname !== expectedPath) {
                    throw new Error(`Invalid path. Expected: ${expectedPath}, Got: ${pathname}`);
                }

                return {
                    allowedContentTypes: ["model/vnd.usdz+zip", "application/octet-stream"],
                    tokenPayload: JSON.stringify({
                        uploadedBy: "user",
                    }),
                    addRandomSuffix: false, // Keep exact path
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
