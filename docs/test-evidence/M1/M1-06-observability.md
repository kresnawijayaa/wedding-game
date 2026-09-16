# M1-06 Observability Evidence

Date: 2026-09-16  
Task: `M1-06`  
Result: PASS

## Outcome and scope

Wedding Quest now has Sentry error monitoring boundaries for the browser, Next.js server and edge runtimes, and the BullMQ worker. Environment and immutable release identifiers are explicit and validated. Monitoring remains disabled without a DSN, allowing local development and CI to run without external event delivery.

Client monitoring registers small native error listeners and lazy-loads the SDK only after an exception. Server, edge, and worker monitoring initialize at process startup. The worker reports connection and job failures without attaching job bodies.

## Acceptance criteria satisfied locally

- Sentry SDK versions are exact and aligned across web and worker applications.
- Staging/production require a DSN, a Sentry environment matching `APP_ENV`, and a release identifier.
- Source-map upload activates only when auth token, organization, and project are configured together.
- Browser, server, edge, nested React server-component, global React, worker connection, and worker job error paths are covered.
- PII collection, tracing, and session replay are disabled.
- User identity, request headers/cookies/body/query/full path, breadcrumb payloads, and arbitrary extra data are removed before events are sent.
- Signing secrets, object-storage secrets, and the Sentry auth-token marker remain forbidden in static client assets.
- The Sentry browser SDK stays outside the initial route and the 220 KiB gzip JavaScript budget is enforced in CI.
- A localized, keyboard-operable global error fallback remains available when monitoring is disabled or event delivery fails.

## Tests and results

| Test | Result |
|---|---|
| `pnpm install --frozen-lockfile --prefer-offline` | PASS; all 9 workspaces installed reproducibly and the explicitly allowed Sentry CLI postinstall completed |
| `pnpm verify:environment` | PASS; 10 tests, 0 failures |
| `pnpm verify:observability` | PASS; 4 tests, 0 failures |
| `pnpm verify` | PASS; 20 total unit tests, boundaries, lint, formatting, typecheck, production build, budget, and client-boundary scan |
| `pnpm verify:web-budget` | PASS; initial route JavaScript is 166.6 KiB gzip across 6 files, below the 220 KiB limit |
| `pnpm test:e2e` | PASS; 2/2 Chromium desktop/mobile smoke tests |
| `pnpm audit --prod` | PASS after PostCSS 8.5.28 patch; no known runtime vulnerabilities |
| `rhysd/actionlint:1.7.12` | PASS; updated workflow has no findings |
| [GitHub-hosted workflow run 35077802462](https://github.com/kresnawijayaa/wedding-game/actions/runs/35077802462) | PASS; quality/unit, infrastructure integration, production build and budget checks, and browser smoke tests |

## Performance, accessibility, and security impact

- Eager Sentry initialization measured 310.5 KiB gzip and was rejected. Lazy-on-error loading reduced the initial route to 166.6 KiB gzip.
- Monitoring does not block the invitation, and the global error fallback provides a heading, explanation, and native retry button.
- The Sentry build plugin's telemetry is disabled. Source maps are not uploaded without a complete credential set.
- `sendDefaultPii` is false, and a shared sanitizer provides a second application-side privacy boundary aligned with risks R-004 and R-006.
- PostCSS was upgraded from 8.5.6 to 8.5.28 after the runtime audit identified four transitive advisories through Sentry's bundler path.

## Files and modules changed

- Web initialization and fallback: `apps/web/instrumentation-client.ts`, `instrumentation.ts`, `sentry.*.config.ts`, `observability/client.ts`, `app/global-error.tsx`, and `next.config.ts`.
- Worker initialization and capture: `apps/worker/src/instrumentation.ts` and `main.ts`.
- Environment contract: `packages/config`, web accessors, and `.env.example`.
- Privacy helpers/tests: `packages/shared/src/observability.ts` and `packages/shared/tests/observability.test.mjs`.
- Performance/security gates: `scripts/verify-web-budget.mjs`, `scripts/verify-client-boundaries.mjs`, root scripts, and CI workflow.
- Dependencies and supply-chain policy: web/worker manifests, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`.

## Plan/ADR/CR updates

- `M1-06` is recorded as `DONE`, and `M1-07` is the only `READY` task after GitHub-hosted workflow run `35077802462` passed.
- No ADR or Change Request was required; Sentry and environment isolation were already selected by the implementation plan and ADR-001.

## Remaining risks and follow-ups

- A real event, release creation, and source-map symbolication require deployment-managed Sentry credentials and must be exercised before the M9 release gate.
- Future workflow changes must retain the initial JavaScript budget and client-boundary gates.
