import * as Sentry from "@sentry/node";
import { parseServerEnvironment } from "@wedding-quest/config/environment/server";
import {
  createDiagnosticRuntimeOptions,
  sanitizeDiagnosticBreadcrumb,
  sanitizeDiagnosticEvent,
} from "@wedding-quest/shared/observability";

const environment = parseServerEnvironment(process.env);

Sentry.init({
  ...createDiagnosticRuntimeOptions({
    dsn: environment.NEXT_PUBLIC_SENTRY_DSN,
    environment: environment.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    release: environment.NEXT_PUBLIC_SENTRY_RELEASE,
  }),
  beforeBreadcrumb: (breadcrumb) => sanitizeDiagnosticBreadcrumb(breadcrumb),
  beforeSend: (event) => sanitizeDiagnosticEvent(event),
});
