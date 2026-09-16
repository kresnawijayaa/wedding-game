import { parseServerEnvironment } from "@wedding-quest/config/environment/server";
import {
  INFRASTRUCTURE_QUEUE_NAME,
  createQueueWorker,
} from "@wedding-quest/infrastructure/server/queue";
import {
  closeRedisConnection,
  createRedisConnection,
} from "@wedding-quest/infrastructure/server/redis";

const environment = parseServerEnvironment(process.env);
const connection = createRedisConnection({ purpose: "worker", url: environment.REDIS_URL });
const worker = createQueueWorker<
  { requestedAt: string },
  { ok: true; processedAt: string },
  "ping"
>({
  connection,
  prefix: environment.QUEUE_PREFIX,
  processor: async (job) => {
    if (job.name !== "ping") throw new Error("Unsupported infrastructure job.");
    return { ok: true, processedAt: new Date().toISOString() };
  },
  queueName: INFRASTRUCTURE_QUEUE_NAME,
});

console.log("Worker started.", { queue: INFRASTRUCTURE_QUEUE_NAME });

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("Worker stopping.", { signal });
  await worker.close();
  await closeRedisConnection(connection);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void shutdown(signal).then(() => process.exit(0));
  });
}

worker.on("error", (error) => {
  console.error("Worker connection error.", { name: error.name });
});
