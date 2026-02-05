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
        // Determine the full prefix to list. 
        // If the folder structure is 'view-byhamza-xyz/models/...', we need to list that.
        // If 'prefix' passed is just 'models/public', we prepend the root.

        // Check if we already have the root or not.
        const root = "viewStroage/models/";
        // If prefix passed is just "public", we make it "viewStroage/public"
        const searchPrefix = prefix.startsWith(root) ? prefix : `${root}${prefix}`;

        const { blobs } = await list({
            prefix: searchPrefix.endsWith("/") ? searchPrefix : `${searchPrefix}/`,
            limit: 100,
        });

        return blobs
            .filter((blob) => blob.pathname.toLowerCase().endsWith(".usdz"))
            .map((blob) => ({
                name: blob.pathname, // This will be full path 'viewStroage/public/...'
                url: blob.url,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error listing blobs:", error);
        return [];
    }
}
