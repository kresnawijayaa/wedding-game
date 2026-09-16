type DiagnosticRequest = {
  cookies?: unknown;
  data?: unknown;
  env?: unknown;
  headers?: unknown;
  method?: string;
  query_string?: unknown;
  url?: string;
};

type DiagnosticBreadcrumb = {
  category?: string;
  data?: unknown;
  level?: string;
  message?: string;
  timestamp?: number;
  type?: string;
};

type DiagnosticEvent = {
  breadcrumbs?: DiagnosticBreadcrumb[];
  extra?: unknown;
  request?: DiagnosticRequest;
  user?: unknown;
};

export type DiagnosticRuntimeConfig = {
  dsn?: string;
  environment: "local" | "test" | "staging" | "production";
  release?: string;
};

export function createDiagnosticRuntimeOptions(config: DiagnosticRuntimeConfig) {
  return {
    dsn: config.dsn,
    enabled: Boolean(config.dsn),
    environment: config.environment,
    release: config.release,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  } as const;
}

export function sanitizeDiagnosticBreadcrumb<T extends DiagnosticBreadcrumb>(breadcrumb: T): T {
  return {
    ...breadcrumb,
    data: undefined,
    message: undefined,
  };
}

export function sanitizeDiagnosticEvent<T extends DiagnosticEvent>(event: T): T {
  return {
    ...event,
    breadcrumbs: event.breadcrumbs?.map(sanitizeDiagnosticBreadcrumb),
    extra: undefined,
    request: event.request
      ? {
          method: event.request.method,
          url: sanitizeRequestUrl(event.request.url),
        }
      : undefined,
    user: undefined,
  };
}

function sanitizeRequestUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const origin = /^https?:\/\/[^/?#]+/i.exec(url)?.[0];
  return origin ? `${origin}/<redacted>` : "<redacted>";
}
