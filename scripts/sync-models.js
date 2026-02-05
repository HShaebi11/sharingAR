const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Load env from .env.local if present
require('dotenv').config({ path: '.env.local' });

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_BUCKET_NAME || !R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error("Missing R2 credentials. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME in .env.local");
    process.exit(1);
}

const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

const MODELS_DIR = path.resolve(__dirname, '../models');

async function uploadFile(filePath, key) {
    const fileContent = fs.readFileSync(filePath);
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: fileContent,
        ContentType: 'model/vnd.usdz+zip'
    });

    try {
        await r2Client.send(command);
        console.log(`Uploaded: ${key}`);
    } catch (err) {
        console.error(`Failed to upload ${key}:`, err);
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
            const key = `${subDir}/${file}`;
            // In a real sync we'd check existence or hash, but here we just upload (blind overwrite)
            await uploadFile(path.join(folderPath, file), key);
        }
    }
}

async function main() {
    console.log(`Syncing models to R2 bucket: ${R2_BUCKET_NAME}...`);
    await syncFolder('public');
    await syncFolder('private');
    console.log("Sync complete.");
}

main();
