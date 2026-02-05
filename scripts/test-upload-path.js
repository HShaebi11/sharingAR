const { put, list, del } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

async function main() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error("Missing BLOB_READ_WRITE_TOKEN");
        return;
    }

    const path = "view-byhamza-xyz/models/private/test-script-upload.usdz";
    console.log(`Attempting to upload to: ${path}`);

    try {
        // 1. Upload
        const blob = await put(path, "test content", { access: 'public' });
        console.log("Upload success:", blob.url);

        // 2. List to verify
        console.log("Listing to verify...");
        const { blobs } = await list({ prefix: "view-byhamza-xyz/", limit: 10 });
        const found = blobs.find(b => b.pathname === path);

        if (found) {
            console.log("✅ File found in listing:", found.pathname);
        } else {
            console.error("❌ File NOT found in listing after upload.");
            blobs.forEach(b => console.log(" -", b.pathname));
        }

        // 3. Clean up
        if (found) {
            console.log("Cleaning up...");
            await del(found.url);
            console.log("Deleted test file.");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

main().catch(console.error);
