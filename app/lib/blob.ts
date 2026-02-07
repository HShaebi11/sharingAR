/** Vercel Blob tokens must start with this prefix. */
const BLOB_TOKEN_PREFIX = "vercel_blob_rw_";

/**
 * Blob token from env. Trims whitespace, strips surrounding quotes, and removes
 * newlines/control chars so the value matches the pattern Vercel expects (avoids
 * "The string did not match the expected pattern" from the Blob API).
 */
export function getBlobToken(): string | undefined {
  const raw = process.env.BLOB_READ_WRITE_TOKEN;
  if (raw == null || raw === "") {
    // #region agent log
    const payload = {
      location: "app/lib/blob.ts:getBlobToken",
      message: "getBlobToken no raw",
      data: { rawPresent: false, rawLength: 0 },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "H3",
    };
    fetch("http://127.0.0.1:7247/ingest/3472bf24-0680-40cd-92fd-96d67b4de365", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
    if (typeof process !== "undefined" && process.versions?.node) {
      try {
        require("fs").appendFileSync(
          process.cwd() + "/.cursor/debug.log",
          JSON.stringify(payload) + "\n"
        );
      } catch (_) {}
    }
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
  if (unquoted === "") return undefined;
  // Strip all whitespace and control chars so the token matches Vercel's expected pattern
  const sanitized = unquoted.replace(/\s+/g, "").replace(/[\x00-\x1f\x7f]/g, "");
  if (sanitized === "" || !sanitized.startsWith(BLOB_TOKEN_PREFIX)) return undefined;
  // Reject placeholder from .env.example
  if (sanitized.endsWith("...")) return undefined;
  const out = sanitized;
  // #region agent log
  const firstCode = trimmed.length > 0 ? trimmed.charCodeAt(0) : 0;
  const lastCode = trimmed.length > 0 ? trimmed.charCodeAt(trimmed.length - 1) : 0;
  const payload = {
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
  };
  fetch("http://127.0.0.1:7247/ingest/3472bf24-0680-40cd-92fd-96d67b4de365", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      require("fs").appendFileSync(
        process.cwd() + "/.cursor/debug.log",
        JSON.stringify(payload) + "\n"
      );
    } catch (_) {}
  }
  // #endregion
  return out;
}
