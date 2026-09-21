import { createDatabaseConnection } from "@wedding-quest/database/server";
import {
  closeRedisConnection,
  createRedisConnection,
  pingRedis,
} from "@wedding-quest/infrastructure/server/redis";

import { serverEnvironment } from "../../../environment/server";
import { runReadinessChecks } from "../../../health/readiness";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const database = createDatabaseConnection({
    maxConnections: 1,
    url: serverEnvironment.DATABASE_URL,
  });
  const redis = createRedisConnection({ purpose: "request", url: serverEnvironment.REDIS_URL });

  try {
    const result = await runReadinessChecks({
      database: () => database.ping(),
      redis: () => pingRedis(redis),
    });

    return Response.json(result, {
      headers: { "Cache-Control": "no-store" },
      status: result.status === "ready" ? 200 : 503,
    });
  } finally {
    await Promise.allSettled([database.close(), closeRedisConnection(redis)]);
  }
}
