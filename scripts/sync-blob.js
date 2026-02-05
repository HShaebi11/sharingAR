const fs = require('fs');
const path = require('path');
const { put, list } = require('@vercel/blob');

// Load env from .env.local if present
require('dotenv').config({ path: '.env.local' });

if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Missing BLOB_READ_WRITE_TOKEN. Please set it in .env.local");
    process.exit(1);
}

const MODELS_DIR = path.resolve(__dirname, '../models');

async function uploadFile(filePath, pathname) {
    const fileContent = fs.readFileSync(filePath);

    try {
        const blob = await put(pathname, fileContent, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            addRandomSuffix: false // We want predictable paths
        });
        console.log(`Uploaded: ${blob.url}`);
    } catch (err) {
        console.error(`Failed to upload ${pathname}:`, err);
    }
}

async function syncFolder(subDir) {
    const folderPath = path.join(MODELS_DIR, subDir);
    if (!fs.existsSync(folderPath)) {
        console.log(`Folder not found: ${folderPath}`);
        return;
    }

    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        if (file.toLowerCase().endsWith('.usdz')) {
            const pathname = `viewStroage/models/${subDir}/${file}`;
            console.log(`Syncing ${pathname}...`);
            await uploadFile(path.join(folderPath, file), pathname);
        }
    }
}

async function main() {
    console.log('Syncing models to Vercel Blob...');
    await syncFolder('public');
    await syncFolder('private');
    console.log("Sync complete.");
}

main();
