import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://wedding_quest:wedding_quest_local@localhost:55432/wedding_quest",
  },
  migrations: {
    prefix: "timestamp",
  },
  out: "./migrations",
  schema: "./src/schema/**/*.ts",
  strict: true,
  verbose: true,
});
