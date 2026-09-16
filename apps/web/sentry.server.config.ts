import * as Sentry from "@sentry/nextjs";
import {
  createDiagnosticRuntimeOptions,
  sanitizeDiagnosticBreadcrumb,
  sanitizeDiagnosticEvent,
} from "@wedding-quest/shared/observability";

import { serverEnvironment } from "./environment/server";

Sentry.init({
  ...createDiagnosticRuntimeOptions({
    dsn: serverEnvironment.NEXT_PUBLIC_SENTRY_DSN,
    environment: serverEnvironment.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    release: serverEnvironment.NEXT_PUBLIC_SENTRY_RELEASE,
  }),
  beforeBreadcrumb: (breadcrumb) => sanitizeDiagnosticBreadcrumb(breadcrumb),
  beforeSend: (event) => sanitizeDiagnosticEvent(event),
});
