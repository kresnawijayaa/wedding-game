import assert from "node:assert/strict";
import test from "node:test";

import { assertSafeStorageKey, createObjectStorageAdapter } from "../src/object-storage.ts";
import { defaultJobOptions } from "../src/queue.ts";
import { closeRedisConnection, createRedisConnection } from "../src/redis.ts";

test("request Redis connections fail quickly and remain lazy", async () => {
  const connection = createRedisConnection({
    purpose: "request",
    url: "redis://127.0.0.1:56379",
  });

  assert.equal(connection.status, "wait");
  assert.equal(connection.options.maxRetriesPerRequest, 1);
  await closeRedisConnection(connection);
});

test("worker Redis connections use BullMQ-compatible retry behavior", async () => {
  const connection = createRedisConnection({
    purpose: "worker",
    url: "redis://127.0.0.1:56379",
  });

  assert.equal(connection.options.maxRetriesPerRequest, null);
  await closeRedisConnection(connection);
});

test("queue jobs have bounded retries and retention", () => {
  assert.equal(defaultJobOptions.attempts, 3);
  assert.deepEqual(defaultJobOptions.backoff, { delay: 1_000, type: "exponential" });
  assert.deepEqual(defaultJobOptions.removeOnComplete, { count: 100 });
  assert.deepEqual(defaultJobOptions.removeOnFail, { count: 500 });
});

test("object storage rejects unsafe keys", () => {
  for (const key of ["", "/root.jpg", "../guest.jpg", "gallery//guest.jpg", "a\\b.jpg"]) {
    assert.throws(() => assertSafeStorageKey(key), /normalized relative path/);
  }
  assert.doesNotThrow(() => assertSafeStorageKey("weddings/sample/gallery/photo.webp"));
});

test("object storage adapter scopes commands to one bucket", async () => {
  const commands = [];
  const storage = createObjectStorageAdapter(
    {
      async send(command) {
        commands.push(command);
        return {};
      },
    },
    "wedding-assets",
  );

  await storage.putObject({
    body: new Uint8Array([1, 2, 3]),
    contentType: "image/webp",
    key: "weddings/sample/photo.webp",
  });
  await storage.deleteObject("weddings/sample/photo.webp");

  assert.equal(commands.length, 2);
  assert.equal(commands[0].input.Bucket, "wedding-assets");
  assert.equal(commands[0].input.Key, "weddings/sample/photo.webp");
  assert.equal(commands[1].input.Bucket, "wedding-assets");
});
