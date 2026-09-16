import { parsePublicEnvironment } from "@wedding-quest/config/environment/public";

export const publicEnvironment = parsePublicEnvironment({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_PHOTOBOOTH_ENABLED: process.env.NEXT_PUBLIC_PHOTOBOOTH_ENABLED,
  NEXT_PUBLIC_REALTIME_ENABLED: process.env.NEXT_PUBLIC_REALTIME_ENABLED,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  NEXT_PUBLIC_SENTRY_RELEASE: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});
