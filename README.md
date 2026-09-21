# Wedding Quest

Reusable, one-wedding-per-deployment foundation for an accessible web invitation with an optional Phaser world and feature-flagged realtime presence.

## Approved foundation

- Node.js 24.21.0 LTS and pnpm 12.4.1.
- Next.js App Router, React, and TypeScript.
- Workspace packages for shared contracts, game runtime, database, wedding configuration, and tooling.
- Phaser stays isolated from the initial invitation bundle.
- PostgreSQL/Drizzle, Redis/BullMQ, and the dedicated realtime service are introduced by their planned M1/M7 tasks.

See [the implementation plan](docs/IMPLEMENTATION_PLAN.md) and [ADR-001](docs/decisions/ADR-001-foundation-stack.md) before changing architecture.

## Workspace

```text
apps/
├── web/             Next.js invitation shell and MVP HTTP backend
└── worker/          BullMQ process boundary and lifecycle

packages/
├── config/          validated wedding configuration boundary
├── database/        server-only database boundary
├── game/            Phaser runtime boundary
├── infrastructure/  server-only Redis, queue, and object-storage adapters
├── shared/          framework-neutral Zod contracts and types
└── tooling/         shared TypeScript/build configuration
```

The worker and realtime applications are added only when their roadmap tasks become active.

## Local setup

Prerequisites:

- Node.js 24.21.0 (the repository includes `.nvmrc` and `.node-version`).
- Corepack enabled.

```powershell
corepack enable
corepack prepare pnpm@12.4.1 --activate
pnpm install --frozen-lockfile
pnpm verify
pnpm dev
```

On Windows PowerShell systems that block `pnpm.ps1`, use `pnpm.cmd` or `corepack pnpm` with the same arguments.

Open <http://localhost:3000>. The current page is a deliberately small foundation shell, not the completed invitation.

## Environment

Local development works with safe defaults. Copy `.env.example` to `.env.local` only when values need to be overridden. Files matching `.env` and `.env.*` are ignored; `.env.example` is the only committed exception.

- `NEXT_PUBLIC_*` values are intentionally visible to browsers and must never contain secrets.
- `GUEST_TOKEN_SIGNING_SECRET` is server-only and must contain at least 32 characters.
- Staging and production require an HTTPS app URL and a signing secret; builds fail fast when either is missing.
- Real staging/production secrets belong in the deployment secret manager, never in repository files or logs.

## Local infrastructure

Docker Compose provides pinned PostgreSQL and Redis services on loopback-only, conflict-resistant ports:

```powershell
pnpm infra:up
pnpm infra:probe
pnpm infra:status
pnpm infra:down
```

PostgreSQL uses port `55432` and Redis uses `56379` by default. Override `POSTGRES_PORT` or `REDIS_PORT` before `infra:up` if needed, and keep the corresponding URLs synchronized.

The Drizzle baseline is configured, but domain tables and migrations intentionally begin in M2. The BullMQ worker can be started separately with `pnpm worker` while Redis is running.

No local object-storage container is bundled. Configure a maintained S3-compatible development endpoint through `OBJECT_STORAGE_*`; production targets Cloudflare R2. Photobooth captures never use server storage.

## Verification

```powershell
pnpm quality
pnpm verify
```

`quality` runs package-boundary checks, environment contract tests, ESLint, Prettier verification, and strict TypeScript checks for every source workspace. `verify` adds the production build and scans static client assets for forbidden server-only markers. Use `pnpm format` to apply repository formatting.

The pre-commit hook runs ESLint/Prettier only against staged files. TypeScript 7 source is checked with its native strict compiler because the current stable TypeScript ESLint parser does not yet declare TypeScript 7 compatibility. Do not bypass strict peer-dependency checks to force that integration.

`verify:boundaries` prevents infrastructure dependencies from entering the Phaser package, prevents the web app from eagerly depending on the game package, and keeps the database package server-only.

## Continuous integration

GitHub Actions runs four bounded jobs on pull requests, pushes to `main`, and manual dispatches:

- quality and unit tests, including Drizzle metadata, Compose configuration, and runtime dependency audit;
- a production Next.js build followed by the client-bundle boundary scan;
- a live PostgreSQL, Redis, and BullMQ integration probe;
- Playwright Chromium smoke tests at desktop and mobile viewports, with failure artifacts retained for seven days.

Reproduce the application checks locally with `pnpm verify` and `pnpm test:e2e`. The GitHub-hosted workflow remains the final CI acceptance gate.

On Windows, Playwright opens Chromium visibly to avoid an upstream headless-profile cleanup defect. Linux CI remains headless.

## Local sample wedding

The reusable local fixture in `packages/config/src/wedding-seed.ts` defines one draft wedding, couple, ceremony, reception, guest, and versioned theme assignment. Run `pnpm seed:validate` to validate it. M2 database migrations will consume this fixture; it intentionally contains no raw guest token or game-world coordinates.

## Observability

Sentry error monitoring is configured for the browser, Next.js server/edge runtimes, and the BullMQ worker. It remains disabled when `NEXT_PUBLIC_SENTRY_DSN` is blank. Staging and production require:

- `NEXT_PUBLIC_SENTRY_DSN` for event delivery;
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT` matching `APP_ENV`;
- `NEXT_PUBLIC_SENTRY_RELEASE` as an immutable release identifier.

Source-map upload is enabled only when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are all present during the build. Keep the token in deployment secret management.

Client monitoring loads the SDK only after an exception, keeping it outside the initial route bundle. Default PII, tracing, and replay are disabled. Diagnostic sanitization removes user identity, request headers, cookies, bodies, query strings, full paths, breadcrumb payloads, and arbitrary extra data before delivery.

## Current task

`M1-07` is complete with one validated local sample wedding. `M1-08` is next and will add health and readiness endpoints; database persistence remains part of M2-01.
