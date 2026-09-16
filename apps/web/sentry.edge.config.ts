import * as Sentry from "@sentry/nextjs";
import {
  createDiagnosticRuntimeOptions,
  sanitizeDiagnosticBreadcrumb,
  sanitizeDiagnosticEvent,
} from "@wedding-quest/shared/observability";

import { publicEnvironment } from "./environment/public";

Sentry.init({
  ...createDiagnosticRuntimeOptions({
    dsn: publicEnvironment.NEXT_PUBLIC_SENTRY_DSN,
    environment: publicEnvironment.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    release: publicEnvironment.NEXT_PUBLIC_SENTRY_RELEASE,
  }),
  beforeBreadcrumb: (breadcrumb) => sanitizeDiagnosticBreadcrumb(breadcrumb),
  beforeSend: (event) => sanitizeDiagnosticEvent(event),
});
