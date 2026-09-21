export type ReadinessCheckState = "error" | "ok";

export interface ReadinessChecks {
  database: () => Promise<void>;
  redis: () => Promise<void>;
}

export interface ReadinessResult {
  checks: {
    database: ReadinessCheckState;
    redis: ReadinessCheckState;
  };
  status: "ready" | "unavailable";
}

async function runCheck(
  check: () => Promise<void>,
  timeoutMs: number,
): Promise<ReadinessCheckState> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      check(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Readiness check timed out.")), timeoutMs);
      }),
    ]);
    return "ok";
  } catch {
    return "error";
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function runReadinessChecks(
  checks: ReadinessChecks,
  timeoutMs = 4_000,
): Promise<ReadinessResult> {
  const [database, redis] = await Promise.all([
    runCheck(checks.database, timeoutMs),
    runCheck(checks.redis, timeoutMs),
  ]);

  return {
    checks: { database, redis },
    status: database === "ok" && redis === "ok" ? "ready" : "unavailable",
  };
}
