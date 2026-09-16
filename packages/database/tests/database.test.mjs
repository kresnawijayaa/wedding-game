import assert from "node:assert/strict";
import test from "node:test";

import { createDatabaseConnection } from "../src/server.ts";

test("database connection is lazy and exposes an explicit lifecycle", async () => {
  const connection = createDatabaseConnection({
    maxConnections: 2,
    url: "postgresql://user:password@127.0.0.1:5432/database",
  });

  assert.equal(typeof connection.db, "object");
  assert.equal(typeof connection.ping, "function");
  await connection.close();
});
