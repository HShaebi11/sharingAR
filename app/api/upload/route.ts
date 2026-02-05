import { NextRequest, NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com";

function getConfig() {
  const repo = process.env.GITHUB_REPO ?? "hamzashaebi/sharingAR";
  const path = process.env.GITHUB_PATH ?? "models";
  const branch = process.env.GITHUB_BRANCH ?? "main";
  return { repo, path, branch };
}

export async function POST(request: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Upload is disabled: GITHUB_TOKEN is not set. Add a token with contents: write." },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  const folder = formData.get("folder") as string | null;

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    );
  }

  const name = (file.name || "").trim().toLowerCase();
  if (!name.endsWith(".usdz")) {
    return NextResponse.json(
      { error: "Only .usdz files are allowed" },
      { status: 400 }
    );
  }

  const targetFolder = folder === "private" || folder === "public" ? folder : "public";

  const { repo, path: repoPath, branch } = getConfig();
  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) {
    return NextResponse.json(
      { error: "Invalid GITHUB_REPO configuration" },
      { status: 500 }
    );
  }

  const filePath = `${repoPath}/${targetFolder}/${file.name}`;
  const content = Buffer.from(await file.arrayBuffer()).toString("base64");

  try {
    const getRes = await fetch(
      `${GITHUB_API}/repos/${repo}/contents/${filePath.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    let sha: string | undefined;
    if (getRes.ok) {
      const existing = (await getRes.json()) as { sha?: string };
      sha = existing.sha;
    }

    const body = {
      message: sha ? `Update ${file.name}` : `Add ${file.name}`,
      content,
      branch,
      ...(sha ? { sha } : {}),
    };

    const putRes = await fetch(
      `${GITHUB_API}/repos/${repo}/contents/${filePath.split("/").map(encodeURIComponent).join("/")}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!putRes.ok) {
      const err = (await putRes.json()) as { message?: string };
      const msg = err?.message ?? `GitHub API error: ${putRes.status}`;
      return NextResponse.json(
        { error: msg },
        { status: putRes.status >= 500 ? 502 : 400 }
      );
    }

    const result = (await putRes.json()) as { content?: { path?: string } };
    return NextResponse.json({
      ok: true,
      path: result.content?.path ?? `${targetFolder}/${file.name}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload to GitHub" },
      { status: 502 }
    );
  }
}
