import assert from "node:assert/strict";
import test from "node:test";

import { GET as getHealth } from "../app/api/health/route.ts";
import { runReadinessChecks } from "../health/readiness.ts";

test("liveness response is healthy, minimal, and not cacheable", async () => {
  const response = getHealth();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("readiness succeeds only when all dependencies respond", async () => {
  const result = await runReadinessChecks({
    database: async () => undefined,
    redis: async () => undefined,
  });

  assert.deepEqual(result, {
    checks: { database: "ok", redis: "ok" },
    status: "ready",
  });
});

test("readiness reports safe dependency states without leaking errors", async () => {
  const result = await runReadinessChecks({
    database: async () => {
      throw new Error("postgresql://user:secret@private-host/database");
    },
    redis: async () => undefined,
  });

  assert.deepEqual(result, {
    checks: { database: "error", redis: "ok" },
    status: "unavailable",
  });
  assert.equal(JSON.stringify(result).includes("secret"), false);
});

test("readiness bounds stalled dependency checks", async () => {
  const result = await runReadinessChecks(
    {
      database: () => new Promise(() => undefined),
      redis: async () => undefined,
    },
    5,
  );

  assert.equal(result.status, "unavailable");
  assert.equal(result.checks.database, "error");
});
