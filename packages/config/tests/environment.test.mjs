import assert from "node:assert/strict";
import test from "node:test";

import { parsePublicEnvironment } from "../src/environment/public.ts";
import { parseServerEnvironment } from "../src/environment/server.ts";

test("public environment uses safe local defaults", () => {
  assert.deepEqual(parsePublicEnvironment({}), {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_PHOTOBOOTH_ENABLED: false,
    NEXT_PUBLIC_REALTIME_ENABLED: false,
    NEXT_PUBLIC_SENTRY_DSN: undefined,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: "local",
    NEXT_PUBLIC_SENTRY_RELEASE: undefined,
  });
});

test("public environment returns only explicitly allowlisted values", () => {
  const parsed = parsePublicEnvironment({
    GUEST_TOKEN_SIGNING_SECRET: "must-never-be-returned",
    NEXT_PUBLIC_APP_URL: "https://example.test",
    NEXT_PUBLIC_REALTIME_ENABLED: "true",
  });

  assert.deepEqual(parsed, {
    NEXT_PUBLIC_APP_URL: "https://example.test",
    NEXT_PUBLIC_PHOTOBOOTH_ENABLED: false,
    NEXT_PUBLIC_REALTIME_ENABLED: true,
    NEXT_PUBLIC_SENTRY_DSN: undefined,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: "local",
    NEXT_PUBLIC_SENTRY_RELEASE: undefined,
  });
  assert.equal("GUEST_TOKEN_SIGNING_SECRET" in parsed, false);
});

test("invalid public flags fail fast", () => {
  assert.throws(
    () => parsePublicEnvironment({ NEXT_PUBLIC_REALTIME_ENABLED: "yes" }),
    /NEXT_PUBLIC_REALTIME_ENABLED/,
  );
});

test("local server environment does not require production secrets", () => {
  const parsed = parseServerEnvironment({});

  assert.equal(parsed.APP_ENV, "local");
  assert.equal(parsed.DATABASE_MAX_CONNECTIONS, 10);
  assert.match(parsed.DATABASE_URL, /^postgresql:/);
  assert.equal(parsed.GUEST_TOKEN_SIGNING_SECRET, undefined);
  assert.equal(parsed.OBJECT_STORAGE_FORCE_PATH_STYLE, true);
  assert.equal(parsed.REDIS_URL, "redis://localhost:56379");
});

test("staging and production require HTTPS and a signing secret", () => {
  assert.throws(
    () => parseServerEnvironment({ APP_ENV: "production" }),
    /NEXT_PUBLIC_APP_URL.*GUEST_TOKEN_SIGNING_SECRET/,
  );
  assert.throws(
    () =>
      parseServerEnvironment({
        APP_ENV: "staging",
        GUEST_TOKEN_SIGNING_SECRET: "a".repeat(32),
        NEXT_PUBLIC_APP_URL: "http://example.test",
      }),
    /must use HTTPS/,
  );
});

test("remote environments require matching Sentry environment and release", () => {
  assert.throws(
    () =>
      parseServerEnvironment({
        APP_ENV: "production",
        NEXT_PUBLIC_SENTRY_DSN: "https://public@example.ingest.sentry.io/1",
        NEXT_PUBLIC_SENTRY_ENVIRONMENT: "staging",
      }),
    /NEXT_PUBLIC_SENTRY_ENVIRONMENT.*NEXT_PUBLIC_SENTRY_RELEASE/,
  );
});

test("Sentry source-map credentials must be configured as one set", () => {
  assert.throws(
    () => parseServerEnvironment({ SENTRY_AUTH_TOKEN: "build-token" }),
    /SENTRY_ORG.*SENTRY_PROJECT/,
  );
});

test("validation errors do not include rejected secret values", () => {
  const rejectedSecret = "DO_NOT_INCLUDE_THIS_SECRET";

  assert.throws(
    () =>
      parseServerEnvironment({
        APP_ENV: "production",
        GUEST_TOKEN_SIGNING_SECRET: rejectedSecret,
        NEXT_PUBLIC_APP_URL: "https://example.test",
      }),
    (error) => error instanceof Error && !error.message.includes(rejectedSecret),
  );
});

test("a complete production environment is accepted", () => {
  const parsed = parseServerEnvironment({
    APP_ENV: "production",
    DATABASE_URL: "postgresql://service:secret@database.example/wedding",
    GUEST_TOKEN_SIGNING_SECRET: "a".repeat(32),
    NEXT_PUBLIC_APP_URL: "https://wedding.example",
    NEXT_PUBLIC_PHOTOBOOTH_ENABLED: "true",
    NEXT_PUBLIC_SENTRY_DSN: "https://public@example.ingest.sentry.io/1",
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: "production",
    NEXT_PUBLIC_SENTRY_RELEASE: "wedding-quest@2026.09.16.1",
    OBJECT_STORAGE_ACCESS_KEY_ID: "production-key",
    OBJECT_STORAGE_BUCKET: "wedding-production",
    OBJECT_STORAGE_ENDPOINT: "https://account.r2.cloudflarestorage.com",
    OBJECT_STORAGE_SECRET_ACCESS_KEY: "production-secret",
    REDIS_URL: "rediss://redis.example:6380",
  });

  assert.equal(parsed.APP_ENV, "production");
  assert.equal(parsed.NEXT_PUBLIC_PHOTOBOOTH_ENABLED, true);
  assert.equal(parsed.NEXT_PUBLIC_REALTIME_ENABLED, false);
  assert.equal(parsed.NEXT_PUBLIC_SENTRY_ENVIRONMENT, "production");
  assert.equal(parsed.NEXT_PUBLIC_SENTRY_RELEASE, "wedding-quest@2026.09.16.1");
  assert.equal(parsed.OBJECT_STORAGE_FORCE_PATH_STYLE, false);
});

test("infrastructure URLs and connection limits are validated", () => {
  assert.throws(
    () =>
      parseServerEnvironment({
        DATABASE_MAX_CONNECTIONS: "0",
        DATABASE_URL: "https://database.example",
        REDIS_URL: "https://redis.example",
      }),
    /DATABASE_MAX_CONNECTIONS.*DATABASE_URL.*REDIS_URL/,
  );
});
