import { z } from "zod";

import { createEnvironmentError, type RawEnvironment } from "./public.ts";

const remoteEnvironment = new Set(["staging", "production"]);
const signingSecretMinimumLength = 32;
const requiredRemoteInfrastructureKeys = [
  "DATABASE_URL",
  "REDIS_URL",
  "OBJECT_STORAGE_ENDPOINT",
  "OBJECT_STORAGE_BUCKET",
  "OBJECT_STORAGE_ACCESS_KEY_ID",
  "OBJECT_STORAGE_SECRET_ACCESS_KEY",
] as const;

const databaseUrlSchema = z
  .string()
  .url()
  .refine((value) => /^postgres(?:ql)?:\/\//.test(value), {
    message: "must use the postgres or postgresql protocol",
  });

const redisUrlSchema = z
  .string()
  .url()
  .refine((value) => /^rediss?:\/\//.test(value), {
    message: "must use the redis or rediss protocol",
  });

const serverEnvironmentSchema = z
  .object({
    APP_ENV: z.enum(["local", "test", "staging", "production"]).default("local"),
    DATABASE_MAX_CONNECTIONS: z.coerce.number().int().min(1).max(20).default(10),
    DATABASE_URL: databaseUrlSchema.optional(),
    GUEST_TOKEN_SIGNING_SECRET: z.string().min(signingSecretMinimumLength).optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_PHOTOBOOTH_ENABLED: z.enum(["true", "false"]).default("false"),
    NEXT_PUBLIC_REALTIME_ENABLED: z.enum(["true", "false"]).default("false"),
    OBJECT_STORAGE_ACCESS_KEY_ID: z.string().min(1).optional(),
    OBJECT_STORAGE_BUCKET: z.string().min(3).optional(),
    OBJECT_STORAGE_ENDPOINT: z.string().url().optional(),
    OBJECT_STORAGE_FORCE_PATH_STYLE: z.enum(["true", "false"]).optional(),
    OBJECT_STORAGE_REGION: z.string().min(1).default("auto"),
    OBJECT_STORAGE_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    QUEUE_PREFIX: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .default("wedding-quest-local"),
    REDIS_URL: redisUrlSchema.optional(),
  })
  .superRefine((environment, context) => {
    if (!remoteEnvironment.has(environment.APP_ENV)) return;

    if (!environment.NEXT_PUBLIC_APP_URL) {
      context.addIssue({
        code: "custom",
        message: "is required for staging and production",
        path: ["NEXT_PUBLIC_APP_URL"],
      });
    } else if (!environment.NEXT_PUBLIC_APP_URL.startsWith("https://")) {
      context.addIssue({
        code: "custom",
        message: "must use HTTPS for staging and production",
        path: ["NEXT_PUBLIC_APP_URL"],
      });
    }

    if (!environment.GUEST_TOKEN_SIGNING_SECRET) {
      context.addIssue({
        code: "custom",
        message: "is required for staging and production",
        path: ["GUEST_TOKEN_SIGNING_SECRET"],
      });
    }

    for (const key of requiredRemoteInfrastructureKeys) {
      if (!environment[key]) {
        context.addIssue({
          code: "custom",
          message: "is required for staging and production",
          path: [key],
        });
      }
    }

    if (
      environment.OBJECT_STORAGE_ENDPOINT &&
      !environment.OBJECT_STORAGE_ENDPOINT.startsWith("https://")
    ) {
      context.addIssue({
        code: "custom",
        message: "must use HTTPS for staging and production",
        path: ["OBJECT_STORAGE_ENDPOINT"],
      });
    }
  })
  .transform((environment) => ({
    ...environment,
    DATABASE_URL:
      environment.DATABASE_URL ??
      "postgresql://wedding_quest:wedding_quest_local@localhost:55432/wedding_quest",
    NEXT_PUBLIC_APP_URL: environment.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    NEXT_PUBLIC_PHOTOBOOTH_ENABLED: environment.NEXT_PUBLIC_PHOTOBOOTH_ENABLED === "true",
    NEXT_PUBLIC_REALTIME_ENABLED: environment.NEXT_PUBLIC_REALTIME_ENABLED === "true",
    OBJECT_STORAGE_ACCESS_KEY_ID: environment.OBJECT_STORAGE_ACCESS_KEY_ID ?? "wedding_quest_local",
    OBJECT_STORAGE_BUCKET: environment.OBJECT_STORAGE_BUCKET ?? "wedding-quest-local",
    OBJECT_STORAGE_ENDPOINT: environment.OBJECT_STORAGE_ENDPOINT ?? "http://localhost:9000",
    OBJECT_STORAGE_FORCE_PATH_STYLE:
      environment.OBJECT_STORAGE_FORCE_PATH_STYLE === undefined
        ? !remoteEnvironment.has(environment.APP_ENV)
        : environment.OBJECT_STORAGE_FORCE_PATH_STYLE === "true",
    OBJECT_STORAGE_SECRET_ACCESS_KEY:
      environment.OBJECT_STORAGE_SECRET_ACCESS_KEY ?? "wedding_quest_local_secret",
    REDIS_URL: environment.REDIS_URL ?? "redis://localhost:56379",
  }));

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(environment: RawEnvironment): ServerEnvironment {
  const result = serverEnvironmentSchema.safeParse({
    APP_ENV: environment.APP_ENV,
    DATABASE_MAX_CONNECTIONS: environment.DATABASE_MAX_CONNECTIONS,
    DATABASE_URL: environment.DATABASE_URL,
    GUEST_TOKEN_SIGNING_SECRET: environment.GUEST_TOKEN_SIGNING_SECRET,
    NEXT_PUBLIC_APP_URL: environment.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_PHOTOBOOTH_ENABLED: environment.NEXT_PUBLIC_PHOTOBOOTH_ENABLED,
    NEXT_PUBLIC_REALTIME_ENABLED: environment.NEXT_PUBLIC_REALTIME_ENABLED,
    OBJECT_STORAGE_ACCESS_KEY_ID: environment.OBJECT_STORAGE_ACCESS_KEY_ID,
    OBJECT_STORAGE_BUCKET: environment.OBJECT_STORAGE_BUCKET,
    OBJECT_STORAGE_ENDPOINT: environment.OBJECT_STORAGE_ENDPOINT,
    OBJECT_STORAGE_FORCE_PATH_STYLE: environment.OBJECT_STORAGE_FORCE_PATH_STYLE,
    OBJECT_STORAGE_REGION: environment.OBJECT_STORAGE_REGION,
    OBJECT_STORAGE_SECRET_ACCESS_KEY: environment.OBJECT_STORAGE_SECRET_ACCESS_KEY,
    QUEUE_PREFIX: environment.QUEUE_PREFIX,
    REDIS_URL: environment.REDIS_URL,
  });

  if (!result.success) {
    throw createEnvironmentError("server", result.error.issues);
  }

  return result.data;
}
