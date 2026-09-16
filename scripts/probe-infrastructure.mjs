import { parseServerEnvironment } from "../packages/config/src/environment/server.ts";
import { createDatabaseConnection } from "../packages/database/src/server.ts";
import {
  INFRASTRUCTURE_QUEUE_NAME,
  createQueue,
  createQueueEvents,
  createQueueWorker,
} from "../packages/infrastructure/src/queue.ts";
import {
  closeRedisConnection,
  createRedisConnection,
  pingRedis,
} from "../packages/infrastructure/src/redis.ts";

const environment = parseServerEnvironment(process.env);
const database = createDatabaseConnection({
  maxConnections: environment.DATABASE_MAX_CONNECTIONS,
  url: environment.DATABASE_URL,
});
const requestRedis = createRedisConnection({ purpose: "request", url: environment.REDIS_URL });
const queueRedis = createRedisConnection({ purpose: "worker", url: environment.REDIS_URL });
const workerRedis = createRedisConnection({ purpose: "worker", url: environment.REDIS_URL });
const eventsRedis = createRedisConnection({ purpose: "worker", url: environment.REDIS_URL });
const queueOptions = {
  prefix: environment.QUEUE_PREFIX,
  queueName: INFRASTRUCTURE_QUEUE_NAME,
};
const queue = createQueue({ ...queueOptions, connection: queueRedis });
const queueEvents = createQueueEvents({ ...queueOptions, connection: eventsRedis });
const worker = createQueueWorker({
  ...queueOptions,
  connection: workerRedis,
  processor: async (job) => {
    if (job.name !== "ping") throw new Error("Unexpected infrastructure probe job.");
    return { ok: true };
  },
});

try {
  await Promise.all([database.ping(), pingRedis(requestRedis), worker.waitUntilReady()]);
  await queueEvents.waitUntilReady();
  const job = await queue.add(
    "ping",
    { requestedAt: new Date().toISOString() },
    {
      jobId: `probe-${Date.now()}`,
    },
  );
  const result = await job.waitUntilFinished(queueEvents, 15_000);
  if (result?.ok !== true) throw new Error("BullMQ probe returned an unexpected result.");
  await Promise.all([queue.clean(0, 100, "completed"), queue.clean(0, 100, "failed")]);
  console.log("Infrastructure probe passed for PostgreSQL, Redis, and BullMQ.");
} finally {
  await Promise.allSettled([queue.close(), queueEvents.close(), worker.close(), database.close()]);
  await Promise.all([
    closeRedisConnection(requestRedis),
    closeRedisConnection(queueRedis),
    closeRedisConnection(workerRedis),
    closeRedisConnection(eventsRedis),
  ]);
}
