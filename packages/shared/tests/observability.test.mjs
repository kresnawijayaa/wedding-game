import assert from "node:assert/strict";
import test from "node:test";

import {
  createDiagnosticRuntimeOptions,
  sanitizeDiagnosticBreadcrumb,
  sanitizeDiagnosticEvent,
} from "../src/observability.ts";

test("diagnostic monitoring stays disabled without a DSN", () => {
  assert.deepEqual(createDiagnosticRuntimeOptions({ environment: "local" }), {
    dsn: undefined,
    enabled: false,
    environment: "local",
    release: undefined,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
});

test("diagnostic monitoring preserves release and environment separation", () => {
  assert.deepEqual(
    createDiagnosticRuntimeOptions({
      dsn: "https://public@example.ingest.sentry.io/1",
      environment: "staging",
      release: "wedding-quest@2026.09.16.1",
    }),
    {
      dsn: "https://public@example.ingest.sentry.io/1",
      enabled: true,
      environment: "staging",
      release: "wedding-quest@2026.09.16.1",
      sendDefaultPii: false,
      tracesSampleRate: 0,
    },
  );
});

test("diagnostic events remove identity and request data", () => {
  const sanitized = sanitizeDiagnosticEvent({
    breadcrumbs: [{ category: "console", data: { token: "secret" }, message: "guest message" }],
    extra: { body: "guest-authored content" },
    request: {
      cookies: { guest: "signed-token" },
      data: "message body",
      headers: { authorization: "Bearer signed-token" },
      method: "POST",
      query_string: "guest=signed-token",
      url: "https://wedding.example/invite/signed-token?guest=signed-token",
    },
    user: { email: "guest@example.test", id: "guest-1" },
  });

  assert.deepEqual(sanitized, {
    breadcrumbs: [{ category: "console", data: undefined, message: undefined }],
    extra: undefined,
    request: { method: "POST", url: "https://wedding.example/<redacted>" },
    user: undefined,
  });
});

test("diagnostic breadcrumbs keep classification but remove payloads", () => {
  assert.deepEqual(
    sanitizeDiagnosticBreadcrumb({
      category: "ui.input",
      data: { value: "private" },
      level: "info",
      message: "private",
      type: "default",
    }),
    {
      category: "ui.input",
      data: undefined,
      level: "info",
      message: undefined,
      type: "default",
    },
  );
});
