import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

function getCloudStorageConfig(): {
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint?: string;
  pathPrefix: string;
} | null {
  const bucket = process.env.CLOUD_STORAGE_BUCKET;
  const accessKeyId = process.env.CLOUD_STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUD_STORAGE_SECRET_ACCESS_KEY;
  if (!bucket || !accessKeyId || !secretAccessKey) return null;
  return {
    bucket,
    accessKeyId,
    secretAccessKey,
    region: process.env.CLOUD_STORAGE_REGION ?? "auto",
    endpoint: process.env.CLOUD_STORAGE_ENDPOINT,
    pathPrefix: process.env.CLOUD_STORAGE_PATH ?? "models",
  };
}

export function isCloudStorageConfigured(): boolean {
  return getCloudStorageConfig() !== null;
}

function getS3Client(): S3Client {
  const config = getCloudStorageConfig();
  if (!config) throw new Error("Cloud storage not configured");
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    ...(config.endpoint && { forcePathStyle: true }),
  });
}

/**
 * List .usdz file paths under a folder (e.g. "private" or "public").
 * Returns paths like "private/name.usdz" or "public/name.usdz".
 */
export async function listUsdzFromCloudStorage(
  subpath: "private" | "public"
): Promise<string[]> {
  const config = getCloudStorageConfig();
  if (!config) return [];
  const prefix = config.pathPrefix.replace(/\/$/, "") + "/" + subpath + "/";
  const client = getS3Client();
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const command = new ListObjectsV2Command({
      Bucket: config.bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });
    const result = await client.send(command);
    const contents = result.Contents ?? [];
    for (const obj of contents) {
      if (obj.Key && obj.Key.toLowerCase().endsWith(".usdz")) {
        // Return path relative to pathPrefix, e.g. "private/name.usdz"
        const relative = obj.Key.slice(config.pathPrefix.length).replace(/^\//, "");
        keys.push(relative);
      }
    }
    continuationToken = result.NextContinuationToken;
  } while (continuationToken);
  return keys.sort();
}

/**
 * Get an object from cloud storage by path (e.g. "private/name.usdz").
 * Returns the body stream and optional content length.
 */
export async function getObjectFromCloudStorage(filename: string): Promise<{
  body: ReadableStream;
  contentLength?: number;
}> {
  const config = getCloudStorageConfig();
  if (!config) throw new Error("Cloud storage not configured");
  const key = config.pathPrefix.replace(/\/$/, "") + "/" + filename.replace(/^\//, "");
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });
  const response = await client.send(command);
  if (!response.Body) throw new Error("Empty response from cloud storage");
  return {
    body: response.Body as ReadableStream,
    contentLength: response.ContentLength,
  };
}
