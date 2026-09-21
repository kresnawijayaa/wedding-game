import assert from "node:assert/strict";

import { sampleWeddingSeed } from "@wedding-quest/config";
import { parseServerEnvironment } from "@wedding-quest/config/environment/server";

import { createDatabaseConnection } from "../src/server.ts";

const environment = parseServerEnvironment(process.env);
const connection = createDatabaseConnection({ maxConnections: 1, url: environment.DATABASE_URL });

try {
  const [wedding] = await connection.client`
    select id, slug, status from weddings where id = ${sampleWeddingSeed.wedding.id}
  `;
  const [counts] = await connection.client`
    select
      (select count(*)::int from couples where wedding_id = ${sampleWeddingSeed.wedding.id}) as couples,
      (select count(*)::int from events where wedding_id = ${sampleWeddingSeed.wedding.id}) as events,
      (select count(*)::int from guests where wedding_id = ${sampleWeddingSeed.wedding.id}) as guests,
      (select count(*)::int from theme_assignments where wedding_id = ${sampleWeddingSeed.wedding.id}) as themes
  `;

  assert.deepEqual(wedding, {
    id: sampleWeddingSeed.wedding.id,
    slug: sampleWeddingSeed.wedding.slug,
    status: sampleWeddingSeed.wedding.status,
  });
  assert.deepEqual(counts, {
    couples: 1,
    events: sampleWeddingSeed.events.length,
    guests: sampleWeddingSeed.guests.length,
    themes: 1,
  });
  console.log("Sample wedding persistence verified.");
} finally {
  await connection.close();
}
