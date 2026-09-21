import assert from "node:assert/strict";
import test from "node:test";

import { getTableColumns, getTableName } from "drizzle-orm";

import { couples, events, guests, themeAssignments, weddings } from "../src/schema/index.ts";

test("core wedding tables use stable names and primary identifiers", () => {
  assert.deepEqual([weddings, couples, events, guests, themeAssignments].map(getTableName), [
    "weddings",
    "couples",
    "events",
    "guests",
    "theme_assignments",
  ]);

  assert.equal(getTableColumns(weddings).id.primary, true);
  assert.equal(getTableColumns(couples).weddingId.primary, true);
  assert.equal(getTableColumns(events).id.primary, true);
  assert.equal(getTableColumns(guests).id.primary, true);
  assert.equal(getTableColumns(themeAssignments).weddingId.primary, true);
});

test("guest schema stores invitation state without a raw access token", () => {
  const columns = Object.keys(getTableColumns(guests));

  assert.ok(columns.includes("invitationStatus"));
  assert.equal(
    columns.some((column) => column.toLowerCase().includes("token")),
    false,
  );
});
