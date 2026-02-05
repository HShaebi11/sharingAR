import {
  getObjectFromCloudStorage,
  isCloudStorageConfigured,
} from "@/lib/cloud-storage";
import { NextRequest, NextResponse } from "next/server";

const USDZ_MIME = "model/vnd.usdz+zip";

function getGitHubConfig() {
  const repo = process.env.GITHUB_REPO ?? "hamzashaebi/sharingAR";
  const path = process.env.GITHUB_PATH ?? "models";
  const branch = process.env.GITHUB_BRANCH ?? "main";
  return { repo, path, branch };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const filename = pathSegments?.join("/");
  if (!filename || !filename.toLowerCase().endsWith(".usdz")) {
    return NextResponse.json(
      { error: "Invalid or missing .usdz path" },
      { status: 400 }
    );
  }

  if (isCloudStorageConfigured()) {
    try {
      const { body, contentLength } = await getObjectFromCloudStorage(filename);
      const headers = new Headers({
        "Content-Type": USDZ_MIME,
        "Cache-Control": "public, max-age=3600",
      });
      if (contentLength != null) headers.set("Content-Length", String(contentLength));
      return new NextResponse(body, { status: 200, headers });
    } catch (err) {
      console.error("Cloud storage fetch error:", err);
      return new NextResponse("Not found", { status: 404 });
    }
  }

  const { repo, path: repoPath, branch } = getGitHubConfig();
  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) {
    return NextResponse.json(
      { error: "Invalid GITHUB_REPO (use owner/repo)" },
      { status: 500 }
    );
  }

  const fullPath = `${repoPath}/${filename}`;
  const encodedPath = fullPath.split("/").map(encodeURIComponent).join("/");
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${encodedPath}`;

  try {
    const token = process.env.GITHUB_TOKEN;
    const res = await fetch(rawUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!res.ok) {
      if (res.status === 404) {
        return new NextResponse("Not found", { status: 404 });
      }
      return new NextResponse(`Upstream error: ${res.status}`, {
        status: res.status,
      });
    }

    const contentLength = res.headers.get("content-length");

    const headers = new Headers({
      "Content-Type": USDZ_MIME,
      "Cache-Control": "public, max-age=3600",
    });
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(res.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Proxy fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch model" },
      { status: 502 }
    );
  }
}
