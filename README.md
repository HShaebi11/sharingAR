# Sharing AR

A web tool to share `.usdz` models with **View in AR** (Apple AR Quick Look). Upload `.usdz` files to **private** or **public** folders via the web UI, and they appear on the site. Open on iOS Safari to view in AR.

## How it works

1. Open the deployed site and use the **Upload Model** form to add `.usdz` files.
2. Choose **Private** or **Public** before uploading.
3. Models appear immediately in the Private or Public section.
4. On iOS Safari, tap **View in AR** to open Apple AR Quick Look. On other devices, use **Download .usdz**.

### Private and public folders

- **Private** – View in AR and download only; no Copy link or Share.
- **Public** – Each model has a Copy link that produces a shareable URL (with `?share=<id>`). Recipients see only the model and View in AR.

The app uses a small proxy so USDZ files are served with the correct MIME type (`model/vnd.usdz+zip`) required by Safari for AR Quick Look.

### Storage

Models are stored in [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob) — a globally distributed file store backed by Vercel's CDN. No GitHub API or git workflow is required.

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy env example and set your Vercel Blob token:

   ```bash
   cp .env.example .env.local
   ```

   Options:

   - `BLOB_READ_WRITE_TOKEN` – Vercel Blob read/write token (required). Create one via **Vercel Dashboard → Storage → Blob**.

3. Run locally:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy

Deploy to [Vercel](https://vercel.com).

### 1. Connect this repo to Vercel

- Go to [vercel.com](https://vercel.com) and sign in.
- Click **Add New…** then **Project**.
- Import the **sharingAR** repo.

### 2. Add Blob storage

- In the Vercel project dashboard, go to **Storage** → **Create Database** → choose **Blob**.
- This automatically adds the `BLOB_READ_WRITE_TOKEN` environment variable to your project.

### 3. Deploy

- Click **Deploy** (first time) or **Redeploy** (after changes).
- Wait for the build to finish. Vercel will show a **Production** URL.
- Open that URL and use the upload form to add `.usdz` files.

### Optional: custom domain

In the project: **Settings → Domains** → add your domain and follow Vercel's DNS instructions.

## Requirements

- **View in AR**: Safari on iOS (or SFSafariViewController). Other browsers get a download link.
- **USDZ**: Use Apple's [AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/) format.
