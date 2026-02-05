/**
 * Storage provider interface for listing and fetching .usdz files.
 * Implementations: GitHub (repo contents + raw), S3-compatible (AWS S3, R2, MinIO).
 */
export type FolderKind = "private" | "public";

export interface StorageProvider {
  /** List .usdz file paths under a folder (e.g. "private/foo.usdz", "public/bar.usdz"). */
  listFiles(folder: FolderKind): Promise<string[]>;

  /** Fetch file by path; returns a Response with body stream and correct Content-Type. */
  getFile(path: string): Promise<Response>;
}
