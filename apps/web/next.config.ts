import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@wedding-quest/config", "@wedding-quest/shared"],
};

const hasSentryBuildCredentials = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
);

export default hasSentryBuildCredentials
  ? withSentryConfig(nextConfig, {
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      release: process.env.NEXT_PUBLIC_SENTRY_RELEASE
        ? { name: process.env.NEXT_PUBLIC_SENTRY_RELEASE }
        : undefined,
      silent: true,
      sourcemaps: { disable: false },
      telemetry: false,
      webpack: {
        treeshake: {
          removeDebugLogging: true,
          removeTracing: true,
        },
      },
    })
  : nextConfig;
