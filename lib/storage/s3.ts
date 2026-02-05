import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import type { StorageProvider } from "./types";

const USDZ_MIME = "model/vnd.usdz+zip";

function getConfig() {
  const bucket = process.env.S3_BUCKET;
  const prefix = process.env.S3_PREFIX ?? "models";
  const region = process.env.S3_REGION ?? "auto";
  const endpoint = process.env.S3_ENDPOINT; // e.g. https://<account>.r2.cloudflarestorage.com
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  return { bucket, prefix, region, endpoint, accessKeyId, secretAccessKey };
}

export function createS3Storage(): StorageProvider {
  const { bucket, prefix, region, endpoint, accessKeyId, secretAccessKey } =
    getConfig();

  if (!bucket) {
    throw new Error("S3_BUCKET is required when using storage provider 's3'");
  }

  const client = new S3Client({
    region,
    ...(endpoint && {
      endpoint,
      forcePathStyle: true, // required for Cloudflare R2 and other S3-compatible custom endpoints
    }),
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });

  return {
    async listFiles(folder: "private" | "public") {
      const listPrefix = prefix ? `${prefix.replace(/\/$/, "")}/${folder}/` : `${folder}/`;
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: listPrefix,
      });
      const result = await client.send(command);
      const contents = result.Contents ?? [];
      return contents
        .filter(
          (obj) =>
            obj.Key &&
            !obj.Key.endsWith("/") &&
            obj.Key.toLowerCase().endsWith(".usdz")
        )
        .map((obj) => `${folder}/${obj.Key!.split("/").pop()!}`)
        .sort();
    },

    async getFile(path: string) {
      const key = prefix ? `${prefix.replace(/\/$/, "")}/${path}` : path;
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      try {
        const response = await client.send(command);
        const body = response.Body;
        if (!body) {
          return new Response(null, { status: 404 });
        }
        const headers = new Headers({
          "Content-Type": USDZ_MIME,
          "Cache-Control": "public, max-age=3600",
        });
        if (response.ContentLength != null) {
          headers.set("Content-Length", String(response.ContentLength));
        }
        return new Response(body as unknown as ReadableStream, {
          status: 200,
          headers,
        });
      } catch (err: unknown) {
        const code = err && typeof err === "object" && "name" in err ? (err as { name?: string }).name : "";
        if (code === "NoSuchKey") {
          return new Response(null, { status: 404 });
        }
        throw err;
      }
    },
  };
}
