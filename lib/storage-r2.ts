import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Initialize S3 Client for Cloudflare R2
export const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || "",
        secretAccessKey: R2_SECRET_ACCESS_KEY || "",
    },
});

export type ModelItem = {
    name: string;
    path: string;
};

/**
 * List models from R2 bucket under a specific prefix (e.g., 'public/' or 'private/')
 */
export async function listModelsR2(prefix: "public" | "private"): Promise<string[]> {
    if (!R2_BUCKET_NAME || !R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
        console.warn("R2 credentials missing. Returning empty list.");
        return [];
    }

    // Ensure prefix ends with /
    const folder = prefix.endsWith("/") ? prefix : `${prefix}/`;

    try {
        const command = new ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            Prefix: folder,
        });

        const response = await r2Client.send(command);
        const contents = response.Contents || [];

        return contents
            .map((item) => item.Key || "")
            .filter((key) => key.toLowerCase().endsWith(".usdz") && key !== folder) // Filter out the folder itself if returned
            .sort();
    } catch (error) {
        console.error("Error listing R2 objects:", error);
        throw new Error("Failed to list models from R2");
    }
}

/**
 * Get object stream from R2
 */
export async function getModelStreamR2(key: string) {
    if (!R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not defined");

    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });

    try {
        const response = await r2Client.send(command);
        return {
            stream: response.Body,
            contentType: response.ContentType,
            contentLength: response.ContentLength,
        };
    } catch (error) {
        console.error("Error getting R2 object:", error);
        throw error;
    }
}
