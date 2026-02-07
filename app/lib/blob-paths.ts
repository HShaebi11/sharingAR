/**
 * Single source of truth for Vercel Blob paths in this app.
 * All .usdz files live under private/ or public/.
 */

export const BLOB_FOLDER_PRIVATE = "private";
export const BLOB_FOLDER_PUBLIC = "public";

export type BlobFolder = typeof BLOB_FOLDER_PRIVATE | typeof BLOB_FOLDER_PUBLIC;

export const BLOB_FOLDERS: BlobFolder[] = [BLOB_FOLDER_PRIVATE, BLOB_FOLDER_PUBLIC];

/** Prefix for list() to get all blobs in a folder (e.g. "private/" or "public/"). */
export function getListPrefix(folder: BlobFolder): string {
  return `${folder}/`;
}

/**
 * Build blob pathname for upload/list. Sanitizes filename (no path traversal, no slashes).
 * Returns e.g. "private/MyModel.usdz" or "public/MyModel.usdz".
 */
export function getBlobPath(folder: BlobFolder, filename: string): string {
  const safe = sanitizeFilename(filename);
  return `${folder}/${safe}`;
}

/**
 * Sanitize a file name for use in blob path: no path segments, no control chars.
 * Keeps only the base name and ensures .usdz extension.
 */
function sanitizeFilename(name: string): string {
  const base = name.replace(/^.*[/\\]/, "").trim();
  const lower = base.toLowerCase();
  const hasUsdz = lower.endsWith(".usdz");
  const withoutExt = hasUsdz ? base.slice(0, -5) : base;
  const safe = withoutExt.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200) || "model";
  return `${safe}.usdz`;
}

/**
 * Check that a pathname is a valid app blob path: "private/xxx.usdz" or "public/xxx.usdz".
 */
export function isValidBlobPathname(pathname: string): boolean {
  if (!pathname || !pathname.toLowerCase().endsWith(".usdz")) return false;
  const parts = pathname.split("/");
  if (parts.length !== 2) return false;
  const [folder, file] = parts;
  return (
    (folder === BLOB_FOLDER_PRIVATE || folder === BLOB_FOLDER_PUBLIC) &&
    file.length > 0 &&
    !file.includes("..")
  );
}
