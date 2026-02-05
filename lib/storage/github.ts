import type { StorageProvider } from "./types";

const GITHUB_API = "https://api.github.com";

type GitHubContentItem = {
  name: string;
  type: string;
  path: string;
};

function getConfig() {
  const repo = process.env.GITHUB_REPO ?? "hamzashaebi/sharingAR";
  const path = process.env.GITHUB_PATH ?? "models";
  const branch = process.env.GITHUB_BRANCH ?? "main";
  return { repo, path, branch };
}

export function createGitHubStorage(): StorageProvider {
  return {
    async listFiles(folder: "private" | "public") {
      const { repo, path } = getConfig();
      const token = process.env.GITHUB_TOKEN;
      const url = `${GITHUB_API}/repos/${repo}/contents/${path}/${folder}`;
      const res = await fetch(url, {
        next: { revalidate: 60 },
        headers: token
          ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }
          : { Accept: "application/vnd.github.v3+json" },
      });

      if (!res.ok) {
        if (res.status === 404) return [];
        if (res.status === 403) {
          throw new Error("Access denied. If the repo is private, add GITHUB_TOKEN in Vercel.");
        }
        throw new Error(`GitHub API error: ${res.status}`);
      }

      const data = (await res.json()) as GitHubContentItem[];
      if (!Array.isArray(data)) return [];

      return data
        .filter((item) => item.type === "file" && item.name.toLowerCase().endsWith(".usdz"))
        .map((item) => `${folder}/${item.name}`)
        .sort();
    },

    async getFile(path: string) {
      const { repo, path: repoPath, branch } = getConfig();
      const [owner, repoName] = repo.split("/");
      if (!owner || !repoName) {
        throw new Error("Invalid GITHUB_REPO (use owner/repo)");
      }
      const fullPath = `${repoPath}/${path}`;
      const encodedPath = fullPath.split("/").map(encodeURIComponent).join("/");
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${encodedPath}`;
      const token = process.env.GITHUB_TOKEN;
      const res = await fetch(rawUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res;
    },
  };
}
