/**
 * Blob token from env. Trims whitespace and strips surrounding quotes
 * so Vercel (and other) env vars pasted with quotes work correctly.
 */
export function getBlobToken(): string | undefined {
  const raw = process.env.BLOB_READ_WRITE_TOKEN;
  if (raw == null || raw === "") {
    // #region agent log
    fetch("http://127.0.0.1:7247/ingest/3472bf24-0680-40cd-92fd-96d67b4de365", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "app/lib/blob.ts:getBlobToken",
        message: "getBlobToken no raw",
        data: { rawPresent: false, rawLength: 0 },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H3",
      }),
    }).catch(() => {});
    // #endregion
    return undefined;
  }
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  // Remove surrounding single or double quotes (e.g. from Vercel dashboard paste)
  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1).trim()
      : trimmed;
  const out = unquoted === "" ? undefined : unquoted;
  // #region agent log
  const firstCode = trimmed.length > 0 ? trimmed.charCodeAt(0) : 0;
  const lastCode = trimmed.length > 0 ? trimmed.charCodeAt(trimmed.length - 1) : 0;
  fetch("http://127.0.0.1:7247/ingest/3472bf24-0680-40cd-92fd-96d67b4de365", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "app/lib/blob.ts:getBlobToken",
      message: "getBlobToken out",
      data: {
        rawLength: raw.length,
        trimmedLength: trimmed.length,
        firstCharCode: firstCode,
        lastCharCode: lastCode,
        finalLength: out?.length ?? 0,
        prefixMatch: typeof out === "string" && out.startsWith("vercel_blob_"),
        hasNewline: raw.includes("\n"),
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "H1-H5",
    }),
  }).catch(() => {});
  // #endregion
  return out;
}
