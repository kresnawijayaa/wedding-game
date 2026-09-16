"use client";

import {
  createDiagnosticRuntimeOptions,
  sanitizeDiagnosticBreadcrumb,
  sanitizeDiagnosticEvent,
  type DiagnosticRuntimeConfig,
} from "@wedding-quest/shared/observability";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const environment = (process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
  "local") as DiagnosticRuntimeConfig["environment"];
const release = process.env.NEXT_PUBLIC_SENTRY_RELEASE;

let initialized = false;
let sdkPromise: Promise<typeof import("@sentry/nextjs")> | undefined;

export function registerClientErrorMonitoring(): void {
  if (!dsn || typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    void captureClientException(event.error ?? new Error("Unhandled browser error"));
  });
  window.addEventListener("unhandledrejection", (event) => {
    void captureClientException(event.reason);
  });
}

export async function captureClientException(error: unknown): Promise<void> {
  if (!dsn) return;

  const Sentry = await loadSentry();
  Sentry.captureException(error);
}

async function loadSentry(): Promise<typeof import("@sentry/nextjs")> {
  sdkPromise ??= import("@sentry/nextjs");
  const Sentry = await sdkPromise;

  if (!initialized) {
    Sentry.init({
      ...createDiagnosticRuntimeOptions({ dsn, environment, release }),
      beforeBreadcrumb: (breadcrumb) => sanitizeDiagnosticBreadcrumb(breadcrumb),
      beforeSend: (event) => sanitizeDiagnosticEvent(event),
    });
    initialized = true;
  }

  return Sentry;
}
