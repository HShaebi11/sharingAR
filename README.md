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

Deploy to [Vercel](https://vercel.com) (or any host that supports Next.js API routes).

**[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhamzashaebi%2FsharingAR)** — one-click: connects this repo, then follow steps 2–3 below.

### 1. Connect this repo to Vercel

- Go to [vercel.com](https://vercel.com) and sign in (use “Continue with GitHub” if you want the repo linked to your GitHub account).
- Click **Add New…** then **Project**.
- Under “Import Git Repository”, find **sharingAR** (or paste `hamzashaebi/sharingAR` / your fork’s full name). If it’s missing, click **Adjust GitHub App Permissions** and grant Vercel access to the repo, then refresh.
- Select the **sharingAR** repo and click **Import** (do not change Framework Preset or Root Directory unless you use a monorepo).

### 2. Set environment variables

Before or right after the first deploy:

- In the project import screen, expand **Environment Variables**.
- Add these (for Production, and optionally Preview/Development if you want the same config everywhere):

| Name | Value | Notes |
|------|--------|-------|
| `GITHUB_REPO` | `hamzashaebi/sharingAR` | Use `owner/repo` for your fork if different. |
| `GITHUB_PATH` | `models` | Path inside the repo where .usdz files live. |
| `GITHUB_BRANCH` | `main` | Branch used for raw file URLs. |
| `GITHUB_TOKEN` | *(optional)* | Only if you need higher GitHub API rate limits; create a fine-grained or classic token with `contents: read`. |

If you add or change env vars after the first deploy, trigger a new deploy (step 3) so they take effect.

### 3. Deploy

- Click **Deploy** (first time) or **Redeploy** (after changing env vars) from the project dashboard.
- Wait for the build to finish. Vercel will show a **Production** URL (e.g. `https://sharing-ar-xxx.vercel.app`).
- Open that URL: you should see the Sharing AR listing page. With no .usdz in `models/` you’ll see “No .usdz files in the models folder yet.” Add .usdz files to `models/`, push to GitHub; the list updates on the next page load (listing uses the GitHub API).

### Optional: custom domain

In the project: **Settings → Domains** → add your domain and follow Vercel’s DNS instructions.

## Requirements

- **View in AR**: Safari on iOS (or SFSafariViewController). Other browsers get a download link.
- **USDZ**: Use Apple’s [AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/) format.
