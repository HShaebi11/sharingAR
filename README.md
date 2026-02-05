# Sharing AR

A web tool to share `.usdz` models with **View in AR** (Apple AR Quick Look). Put `.usdz` files in **private** or **public** folders under `models/`, push to GitHub, and they appear on the site. Open on iOS Safari to view in AR.

## How it works

1. Create two folders in the repo: `models/private` and `models/public`.
2. Add `.usdz` files to either folder (private = view only, no share link; public = shareable link).
3. Push to GitHub.
4. Open the deployed site; the app lists Private and Public sections via the GitHub API.
5. On iOS Safari, tap **View in AR** to open Apple AR Quick Look. On other devices, use **Download .usdz**.

### Private and public folders

- **Private** – Models in `models/private/` appear in the Private section. View in AR and download only; no Copy link or Share.
- **Public** – Models in `models/public/` appear in the Public section. Each has a Copy link that produces a shareable URL (with `?share=<id>`). Recipients see only the model and View in AR.

To create the folders: in your repo add a file at `models/private/.gitkeep` and `models/public/.gitkeep`, or add a `.usdz` file directly to `models/private/` or `models/public/`.

The app uses a small proxy so USDZ files are served with the correct MIME type (`model/vnd.usdz+zip`) required by Safari for AR Quick Look. GitHub’s raw URLs don’t send that header, so the proxy fetches from GitHub and re-serves the file with the right `Content-Type`.

### Cloud storage (S3-compatible)

On the **`feature/cloud-storage`** branch you can use **S3-compatible** storage (AWS S3, Cloudflare R2, MinIO) instead of GitHub. Set `STORAGE_PROVIDER=s3` and configure your bucket.

#### Cloudflare R2 (S3 API)

1. **Create an R2 bucket** in the [Cloudflare dashboard](https://dash.cloudflare.com) → R2 → Create bucket.
2. **Create S3 API credentials**: R2 → **Manage R2 API Tokens** → Create API token. Grant **Object Read & Write** for your bucket (or all buckets). Copy the **Access Key ID** and **Secret Access Key**.
3. **Account ID**: In the R2 dashboard, your **Account ID** is in the right-hand sidebar. The S3 API endpoint is `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
4. **Bucket layout**: Put `.usdz` files under `<S3_PREFIX>/private/` and `<S3_PREFIX>/public/`. For example with `S3_PREFIX=view-byhamza-xyz/models`:
   - `view-byhamza-xyz/models/private/` → Private section (view only, no share link)
   - `view-byhamza-xyz/models/public/` → Public section (shareable link)  
   Default prefix is `models` if `S3_PREFIX` is not set.

Add to `.env.local`:

| Variable | Value |
|----------|--------|
| `STORAGE_PROVIDER` | `s3` |
| `S3_BUCKET` | Your R2 bucket name |
| `S3_ACCESS_KEY_ID` | From “Manage R2 API Tokens” |
| `S3_SECRET_ACCESS_KEY` | From “Manage R2 API Tokens” |
| `S3_REGION` | `auto` |
| `S3_ENDPOINT` | `https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com` |
| `S3_PREFIX` | e.g. `view-byhamza-xyz/models` or `models` (optional; default: `models`) |

On Vercel, add the same variables in **Project → Settings → Environment Variables**.

#### Using Cloudflare CLI (Wrangler) to connect to your R2 bucket

1. **Install Wrangler** (Cloudflare CLI):

   ```bash
   npm install -g wrangler
   # or use without installing: npx wrangler
   ```

2. **Log in to Cloudflare** (opens browser):

   ```bash
   wrangler login
   ```

3. **List your R2 buckets**:

   ```bash
   wrangler r2 bucket list
   ```

4. **Work with a specific bucket** (replace `YOUR_BUCKET_NAME` with your bucket name from `.env.local`):

   ```bash
   # List objects in the bucket
   wrangler r2 object list YOUR_BUCKET_NAME

   # List objects under your S3_PREFIX (e.g. view-byhamza-xyz/models)
   wrangler r2 object list YOUR_BUCKET_NAME --prefix "view-byhamza-xyz/models/"

   # Upload a file
   wrangler r2 object put YOUR_BUCKET_NAME/view-byhamza-xyz/models/public/my-model.usdz --file=./my-model.usdz

   # Download a file
   wrangler r2 object get YOUR_BUCKET_NAME/view-byhamza-xyz/models/public/my-model.usdz --file=./downloaded.usdz
   ```

   Use the same bucket name as `S3_BUCKET` in `.env.local` and the same path prefix as `S3_PREFIX` (e.g. `view-byhamza-xyz/models`) for paths.

5. **Create a bucket** (if you don’t have one yet):

   ```bash
   wrangler r2 bucket create YOUR_BUCKET_NAME
   ```

After creating the bucket, set `S3_BUCKET=YOUR_BUCKET_NAME` in `.env.local` and create R2 API credentials in the dashboard (R2 → Manage R2 API Tokens) for the app’s S3 client.

#### Other S3-compatible (AWS S3, MinIO)

| Env var | Description |
|--------|-------------|
| `S3_BUCKET` | Bucket name (required when using S3). |
| `S3_PREFIX` | Key prefix for .usdz files (default: `models`). Put files under `<prefix>/private/` and `<prefix>/public/` (e.g. `view-byhamza-xyz/models`). |
| `S3_REGION` | AWS region (e.g. `us-east-1` for AWS; `auto` for R2). |
| `S3_ENDPOINT` | Custom endpoint (R2: `https://<account>.r2.cloudflarestorage.com`; omit for AWS S3). |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | Credentials (required for R2; use IAM/instance role for AWS when possible). |

Listing and file serving use the same Private/Public behaviour; only the backend (GitHub vs S3) changes.

## Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Copy env example and adjust if needed:

   ```bash
   cp .env.example .env.local
   ```

   Options (GitHub, default):

   - `GITHUB_REPO` – `owner/repo` (default: this repo)
   - `GITHUB_PATH` – path inside the repo where `.usdz` files live (default: `models`)
   - `GITHUB_BRANCH` – branch for raw file URLs (default: `main`)
   - `GITHUB_TOKEN` – optional; use for higher GitHub API rate limits

   For S3-compatible storage (see **Cloud storage** above), set `STORAGE_PROVIDER=s3` and the `S3_*` variables from `.env.example`.

3. Run locally:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

### Auto-commit models

After dropping new `.usdz` files into `models/private/` or `models/public/`, you can commit and push them in one step:

```bash
npm run commit-models
```

This stages `models/`, commits with message "Add/update .usdz models", and pushes. Only paths under `models/` are staged.

To auto-commit whenever `models/` changes, run the watcher in a terminal and leave it running:

```bash
npm run watch-models
```

Changes in `models/` (add or edit `.usdz`) are debounced (2 seconds); then the same commit-and-push logic runs. Press Ctrl+C to stop.

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

When using the **cloud-storage** branch with S3, also set: `STORAGE_PROVIDER=s3`, `S3_BUCKET`, and optionally `S3_PREFIX`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.

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
