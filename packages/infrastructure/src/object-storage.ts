import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  type DeleteObjectCommandOutput,
  type PutObjectCommandOutput,
} from "@aws-sdk/client-s3";

type StorageCommand = DeleteObjectCommand | PutObjectCommand;

export interface ObjectStorageCommandSender {
  send(command: StorageCommand): Promise<DeleteObjectCommandOutput | PutObjectCommandOutput>;
}

export interface ObjectStorageConfig {
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  forcePathStyle: boolean;
  region: string;
  secretAccessKey: string;
}

export interface PutObjectInput {
  body: Uint8Array;
  cacheControl?: string;
  contentType: string;
  key: string;
}

export interface ObjectStorage {
  deleteObject(key: string): Promise<void>;
  putObject(input: PutObjectInput): Promise<void>;
}

export function assertSafeStorageKey(key: string): void {
  const segments = key.split("/");
  if (
    key.length === 0 ||
    key.startsWith("/") ||
    key.includes("\\") ||
    segments.some((segment) => segment.length === 0 || segment === "." || segment === "..")
  ) {
    throw new Error("Object-storage key must be a non-empty normalized relative path.");
  }
}

export function createObjectStorageAdapter(
  sender: ObjectStorageCommandSender,
  bucket: string,
): ObjectStorage {
  return {
    async deleteObject(key) {
      assertSafeStorageKey(key);
      await sender.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
    async putObject(input) {
      assertSafeStorageKey(input.key);
      await sender.send(
        new PutObjectCommand({
          Body: input.body,
          Bucket: bucket,
          CacheControl: input.cacheControl,
          ContentType: input.contentType,
          Key: input.key,
        }),
      );
    },
  };
}

export function createS3ObjectStorage(config: ObjectStorageConfig): ObjectStorage {
  const client = new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    region: config.region,
  });

  return createObjectStorageAdapter(
    {
      send: (command) => client.send(command),
    },
    config.bucket,
  );
}
