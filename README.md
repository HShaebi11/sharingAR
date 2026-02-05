# Sharing AR

A web tool to share `.usdz` models with **View in AR** (Apple AR Quick Look). Drop `.usdz` files into the `models/` folder, push to GitHub, and they appear on the site. Open on iOS Safari to view in AR.

## How it works

1. Add `.usdz` files to the `models/` folder in this repo.
2. Push to GitHub.
3. Open the deployed site; the app lists all `.usdz` files from that folder via the GitHub API.
4. On iOS Safari, tap **View in AR** to open Apple AR Quick Look. On other devices, use **Download .usdz**.

The app uses a small proxy so USDZ files are served with the correct MIME type (`model/vnd.usdz+zip`) required by Safari for AR Quick Look. GitHub’s raw URLs don’t send that header, so the proxy fetches from GitHub and re-serves the file with the right `Content-Type`.

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy env example and adjust if needed:

   ```bash
   cp .env.example .env.local
   ```

   Options:

   - `GITHUB_REPO` – `owner/repo` (default: this repo)
   - `GITHUB_PATH` – path inside the repo where `.usdz` files live (default: `models`)
   - `GITHUB_BRANCH` – branch for raw file URLs (default: `main`)
   - `GITHUB_TOKEN` – optional; use for higher GitHub API rate limits

3. Run locally:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy

Deploy to [Vercel](https://vercel.com) (or any host that supports Next.js API routes):

1. Connect this repo to Vercel.
2. Set env vars: `GITHUB_REPO`, `GITHUB_PATH`, `GITHUB_BRANCH` (and optionally `GITHUB_TOKEN`).
3. Deploy. New `.usdz` files pushed to GitHub show up on the next load (listing uses the GitHub API).

## Requirements

- **View in AR**: Safari on iOS (or SFSafariViewController). Other browsers get a download link.
- **USDZ**: Use Apple’s [AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/) format.
