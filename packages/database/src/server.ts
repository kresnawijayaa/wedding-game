import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

export const DATABASE_PACKAGE_BOUNDARY = "server-only" as const;

export interface DatabaseOptions {
  maxConnections: number;
  url: string;
}

export interface DatabaseConnection {
  client: Sql;
  close: () => Promise<void>;
  db: PostgresJsDatabase;
  ping: () => Promise<void>;
}

export function createDatabaseConnection(options: DatabaseOptions): DatabaseConnection {
  const client = postgres(options.url, {
    connect_timeout: 5,
    idle_timeout: 20,
    max: options.maxConnections,
    max_lifetime: 60 * 30,
  });
  const db = drizzle(client);

  return {
    client,
    db,
    async close() {
      await client.end({ timeout: 5 });
    },
    async ping() {
      await client`select 1 as ok`;
    },
  };
}
