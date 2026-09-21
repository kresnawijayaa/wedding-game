import { sampleWeddingSeed } from "@wedding-quest/config";
import { parseServerEnvironment } from "@wedding-quest/config/environment/server";

import { persistWeddingSeed } from "../src/seed.ts";
import { createDatabaseConnection } from "../src/server.ts";

const environment = parseServerEnvironment(process.env);
const connection = createDatabaseConnection({ maxConnections: 1, url: environment.DATABASE_URL });

try {
  await persistWeddingSeed(connection.db, sampleWeddingSeed);
  console.log(`Sample wedding persisted: ${sampleWeddingSeed.wedding.slug}.`);
} finally {
  await connection.close();
}
