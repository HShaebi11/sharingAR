import { list } from "@vercel/blob";

export type ModelItem = {
    name: string;
    url: string;
};

/**
 * List .usdz models from Vercel Blob under a specific prefix.
 * 
 * @param prefix 'models/public' or 'models/private'
 */
export async function listModelsBlob(prefix: string): Promise<ModelItem[]> {
    try {
        const { blobs } = await list({
            prefix: prefix + "/", // Ensure generated prefix has trailing slash
            limit: 100,
        });

        return blobs
            .filter((blob) => blob.pathname.toLowerCase().endsWith(".usdz"))
            .map((blob) => ({
                name: blob.pathname, // Full pathname, e.g. "models/public/foo.usdz"
                url: blob.url,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error listing blobs:", error);
        return [];
    }
}
