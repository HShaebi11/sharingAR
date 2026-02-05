import { NextResponse } from "next/server";
import { spawnSync } from "child_process";
import path from "path";

export async function POST() {
  const scriptPath = path.join(process.cwd(), "scripts", "commit-models.js");
  const result = spawnSync("node", [scriptPath], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  if (result.status === 0) {
    return NextResponse.json({
      ok: true,
      message: result.stdout?.trim() || "Committed and pushed.",
    });
  }

  const errorMessage =
    result.stderr?.trim() || result.stdout?.trim() || "Commit failed.";
  return NextResponse.json(
    { ok: false, error: errorMessage },
    { status: 400 }
  );
}
