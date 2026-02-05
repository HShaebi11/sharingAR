import type { StorageProvider } from "./types";
import { createGitHubStorage } from "./github";
import { createS3Storage } from "./s3";

export type { StorageProvider, FolderKind } from "./types";

const provider = (process.env.STORAGE_PROVIDER ?? "github").toLowerCase();

export function getStorage(): StorageProvider {
  if (provider === "s3") {
    return createS3Storage();
  }
  return createGitHubStorage();
}
