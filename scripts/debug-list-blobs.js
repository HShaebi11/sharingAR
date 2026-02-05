const { list } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

async function main() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error("Missing BLOB_READ_WRITE_TOKEN");
        return;
    }

    console.log("Listing all blobs...");
    const { blobs } = await list({ limit: 100 });

    if (blobs.length === 0) {
        console.log("No blobs found.");
    } else {
        blobs.forEach(b => console.log(b.pathname));
    }
}

main().catch(console.error);
