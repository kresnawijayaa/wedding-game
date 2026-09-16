import { z } from "zod";

const featureFlagSchema = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

export const publicEnvironmentSchema = z
  .object({
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_PHOTOBOOTH_ENABLED: featureFlagSchema,
    NEXT_PUBLIC_REALTIME_ENABLED: featureFlagSchema,
  })
  .readonly();

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;
export type RawEnvironment = Readonly<Record<string, string | undefined>>;

export function parsePublicEnvironment(environment: RawEnvironment): PublicEnvironment {
  const result = publicEnvironmentSchema.safeParse({
    NEXT_PUBLIC_APP_URL: environment.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_PHOTOBOOTH_ENABLED: environment.NEXT_PUBLIC_PHOTOBOOTH_ENABLED,
    NEXT_PUBLIC_REALTIME_ENABLED: environment.NEXT_PUBLIC_REALTIME_ENABLED,
  });

  if (!result.success) {
    throw createEnvironmentError("public", result.error.issues);
  }

  return result.data;
}

export function createEnvironmentError(
  scope: "public" | "server",
  issues: ReadonlyArray<{ message: string; path: ReadonlyArray<PropertyKey> }>,
): Error {
  const summary = issues
    .map((issue) => `${issue.path.map(String).join(".") || "environment"}: ${issue.message}`)
    .join("; ");

  return new Error(`Invalid ${scope} environment: ${summary}`);
}
