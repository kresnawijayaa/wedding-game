import assert from "node:assert/strict";
import test from "node:test";

import { defineWeddingSeed, sampleWeddingSeed, weddingSeedSchema } from "../src/wedding-seed.ts";

test("sample wedding seed is valid and deterministic", () => {
  assert.deepEqual(weddingSeedSchema.parse(sampleWeddingSeed), sampleWeddingSeed);
  assert.equal(sampleWeddingSeed.wedding.slug, "ayu-rama");
  assert.equal(sampleWeddingSeed.events.length, 2);
  assert.equal(sampleWeddingSeed.guests.length, 1);
});

test("all sample records reference the same wedding", () => {
  const weddingId = sampleWeddingSeed.wedding.id;

  assert.equal(sampleWeddingSeed.couple.weddingId, weddingId);
  assert.equal(sampleWeddingSeed.themeAssignment.weddingId, weddingId);
  assert.ok(sampleWeddingSeed.events.every((event) => event.weddingId === weddingId));
  assert.ok(sampleWeddingSeed.guests.every((guest) => guest.weddingId === weddingId));
});

test("seed schema rejects cross-wedding records", () => {
  const invalidSeed = structuredClone(sampleWeddingSeed);
  invalidSeed.guests[0].weddingId = "018f3df0-6e80-7b13-9a31-58dd337dd099";

  assert.throws(() => defineWeddingSeed(invalidSeed), /sample wedding/);
});

test("sample seed contains no reusable raw guest token", () => {
  assert.equal(JSON.stringify(sampleWeddingSeed).includes("token"), false);
});
