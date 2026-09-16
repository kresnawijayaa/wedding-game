import Redis from "ioredis";

export type RedisPurpose = "request" | "worker";

export interface RedisConnectionOptions {
  purpose: RedisPurpose;
  url: string;
}

export function createRedisConnection(options: RedisConnectionOptions): Redis {
  return new Redis(options.url, {
    enableOfflineQueue: options.purpose === "worker",
    lazyConnect: true,
    maxRetriesPerRequest: options.purpose === "worker" ? null : 1,
  });
}

export async function closeRedisConnection(connection: Redis): Promise<void> {
  if (connection.status === "end") return;
  connection.disconnect(false);
}

export async function pingRedis(connection: Redis): Promise<void> {
  if (connection.status === "wait") await connection.connect();
  const response = await connection.ping();
  if (response !== "PONG") throw new Error("Redis health check returned an unexpected response.");
}
