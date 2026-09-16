# ADR-001 — TypeScript Foundation Stack and Deployment Baseline

**Status:** Accepted  
**Date:** 2026-09-15  
**Task:** M0-06  
**Decision owners:** Product owner and technical owner

## Context

Wedding Quest is a mobile-first invitation delivered as one project/deployment per wedding. The codebase is reusable, but it is not a multi-tenant SaaS product and does not include a self-service dashboard in the MVP.

The original draft selected Laravel and Inertia. Before implementation began, the product owner identified that the primary developer is substantially more experienced in the JavaScript/TypeScript ecosystem. The browser still owns Phaser rendering, collision, camera, and movement, so the backend language does not materially determine game FPS. A TypeScript stack also allows UI, game, API, validation, database types, and later realtime contracts to share one language and workspace.

This ADR replaces the unaccepted Laravel/Inertia draft. No application migration is required because the repository still contains planning documents only.

Exact version research was refreshed on 2026-09-15. These are initialization baselines; committed lockfiles remain authoritative after installation.

## Decision

### 1. Monorepo and runtime

Use a pnpm workspace monorepo with Node.js LTS and TypeScript throughout.

| Component | Exact baseline | Decision |
|---|---:|---|
| Node.js | 24.21.0 LTS | Production and development runtime; do not use Node 26 Current |
| pnpm | 12.4.1 | Sole package manager, pinned through the root `packageManager` field/Corepack |
| TypeScript | 7.0.2 | Strict shared configuration; no implicit `any` and no unchecked boundary data |
| React / React DOM | 19.3.0 | UI runtime; versions must match exactly |
| Next.js | 16.3.5 | App Router web application and backend-for-frontend for the MVP |
| Phaser | 3.90.0 | Browser game runtime; remains on the plan-approved Phaser 3 boundary |
| Tailwind CSS | 4.3.3 | Styling baseline |
| Motion | 13.3.0 | DOM motion only; never drives Phaser state |
| Zod | 4.6.5 | Shared runtime validation and type inference at every trust boundary |

Use compatible manifest ranges where ecosystem conventions require them, but commit `pnpm-lock.yaml` and run `pnpm install --frozen-lockfile` in CI. Workspace packages reference each other through `workspace:` ranges.

### 2. Application topology

#### MVP through M6

`apps/web` is a Next.js App Router application that owns:

- Invitation routes, server rendering, metadata, and social previews.
- Personalized guest-token validation and revocation checks.
- React cover, HUD, navigation, dialogs, forms, gallery, and non-game fallback.
- Route Handlers and Server Actions where appropriate for RSVP, wishes, and developer-operated workflows.
- Authorization, rate limits, durable database access, and signed responses.

Next.js is the only HTTP application during the initial MVP. Do not add a second general-purpose REST API or duplicate domain logic.

`apps/worker` is a small Node process using BullMQ. It is deployed only when background work is needed and owns image optimization, cleanup, and asynchronous operational jobs. It must import domain contracts from workspace packages rather than calling private Next.js modules.

#### Realtime at M7

`apps/realtime` is a separate long-running NestJS 12 service using the Fastify platform and Socket.IO. It owns:

- WebSocket lifecycle and wedding-scoped rooms.
- Signed guest-session authorization.
- Presence, heartbeat, reconnect, and TTL behavior.
- Player position snapshots, chat, and reactions.
- Redis pub/sub/adapter integration and realtime rate limits.

Do not host long-lived Socket.IO connections in Next.js Route Handlers or serverless functions. `apps/realtime` is added only after the M7 spike verifies the topology, representative load, reconnect behavior, and operational cost. If disabled or unavailable, the invitation and local game remain fully usable.

### 3. Data, jobs, and infrastructure

| Component | Exact baseline | Responsibility |
|---|---:|---|
| PostgreSQL | 18.6 | Durable wedding, guest, RSVP, wishes, media metadata, analytics, and audit records |
| Drizzle ORM | 0.45.2 | Typed PostgreSQL schema, queries, and SQL migrations |
| Drizzle Kit | 0.31.10 | Generate reviewable SQL migration artifacts; migrations are reviewed before execution |
| Redis Open Source | 8.10.1 | Cache, presence TTL, rate limits, pub/sub, and BullMQ backing store |
| BullMQ | 6.0.9 | Background jobs with bounded retries, idempotency, and retention |
| NestJS | 12.0.0 | Structure and lifecycle for the M7 realtime service |
| Fastify | 5.12.2 | Patched HTTP platform for realtime health/auth endpoints |
| Socket.IO server/client | 4.8.3 | Realtime transport and browser client |
| Socket.IO Redis adapter | 8.3.0 | Cross-instance broadcasts when the realtime service scales horizontally |
| Object storage | Cloudflare R2 production; optional MinIO local profile | Wedding photos/audio and optimized assets; never local photobooth captures |
| CDN/edge | Cloudflare | TLS edge, caching, asset delivery, and basic edge protection |

Drizzle is selected over Prisma because it adds a smaller abstraction, keeps migrations as reviewable SQL, and shares inferred schema types without introducing a separate schema runtime. Changing ORM requires a new ADR and migration proof.

PostgreSQL is never used for continuous player positions or presence writes. Photobooth captures stay in the browser and never enter object storage or BullMQ.

### 4. Testing and code quality

| Tool | Exact baseline | Scope |
|---|---:|---|
| Vitest | 5.0.0 | Shared packages, domain logic, React behavior, bridge, and Node services |
| React Testing Library | 16.3.3 | Accessible component interaction tests |
| Playwright Test | 1.63.0 | Chromium, Firefox, WebKit, mobile viewports, and critical E2E |
| ESLint | 10.10.0 | TypeScript/React/Node static linting with flat config |
| Prettier | 3.9.6 | Formatting, pinned exactly |
| Artillery | 2.0.34 | Socket.IO load, reconnect, and room tests |

Transitive and framework-generated dependencies are accepted only after the M1 clean-install compatibility check and are recorded by the committed lockfile.

### 5. Repository layout

```text
apps/
├── web/                         # Next.js App Router + React UI + MVP HTTP backend
│   ├── app/
│   ├── components/
│   ├── features/
│   └── server/
├── worker/                      # BullMQ processors; enabled when jobs are introduced
└── realtime/                    # NestJS/Fastify + Socket.IO, introduced in M7

packages/
├── game/                        # Phaser bootstrap, scenes, systems, and React bridge
├── shared/                      # Zod schemas, events, DTOs, IDs, and shared types
├── database/                    # Drizzle schema, queries, migrations, and seed helpers
├── config/                      # Typed wedding content and feature configuration
└── tooling/                     # Shared TypeScript, ESLint, Vitest, and build config

assets/
├── sources/                     # Private source artwork; never web-served
├── exported/
└── manifests/

docs/
├── decisions/
├── contracts/
├── runbooks/
└── test-evidence/
```

Package boundaries:

- `packages/shared` contains framework-neutral contracts and Zod schemas, not database clients or React components.
- `packages/game` cannot import Next.js, Drizzle, Redis, BullMQ, NestJS, or Socket.IO.
- `packages/database` is server-only and cannot be imported into browser bundles.
- `apps/web` and `apps/realtime` may share contracts, but not private application services.
- React and Phaser communicate only through the typed event bridge.

### 6. Rendering and state

- Use Next.js App Router and server rendering for the invitation shell, metadata, expired/unpublished states, and accessible content.
- Mark only interactive UI islands as client components. Phaser must load through a client-only dynamic import after the guest activates the cover.
- Use React local state, context, and reducers. Do not add Redux, Zustand, or another application state manager without an ADR.
- Use Radix/shadcn patterns selectively, installing only primitives needed by a task.
- Use Motion only for DOM transitions and honor `prefers-reduced-motion`.
- Never include Phaser, gallery media, realtime client code, or photobooth code in the initial critical bundle unless required by the active route/capability.

### 7. Security boundaries

- Validate environment variables, route input, shared events, and database-facing DTOs with server-owned Zod schemas.
- Treat TypeScript types as compile-time assistance, not runtime validation.
- Use high-entropy, revocable guest tokens; store only a token hash where practical.
- Protect mutations with origin/CSRF defenses appropriate to the selected Next.js mechanism, idempotency for RSVP, and scoped rate limits.
- Server components and Route Handlers must never serialize secrets, database credentials, raw token hashes, or gift/payment internals to client components.
- Realtime sessions use short-lived signed credentials minted by `apps/web`; Socket.IO never accepts a display name or wedding/room scope solely from the client.
- Keep Fastify at 5.12.2 or newer reviewed stable because earlier 5.x releases include patched request-validation bypasses.
- Never log signed guest tokens, secrets, full message bodies, gift/payment data, or photobooth pixels.

### 8. Local development

- Primary path: Docker Desktop with WSL2 on Windows plus Docker Compose.
- Run Node and pnpm either inside the documented development container or through a pinned local Node version; do not rely on an undocumented global version.
- Initial services: Next.js web, PostgreSQL, Redis, and optional MinIO.
- The BullMQ worker runs as a separate profile/process when queue tasks are exercised.
- The realtime service is not required for M1–M6; add its Compose profile during M7.
- Use synthetic seed data only. No production credentials or guest data are allowed locally.
- `.env.example` contains variable names and safe defaults only.

### 9. Staging, production, and rollback

- Build reproducible OCI images for `web`, `worker`, and—when introduced—`realtime` from the same repository and lockfile.
- Keep staging and production databases, Redis instances/namespaces, storage credentials, signing keys, and Sentry environments separate.
- Initial production may use one Ubuntu 24.04 LTS VPS behind Cloudflare, with web, worker, scheduler/cron, and realtime supervised as independent processes/containers.
- Managed PostgreSQL and Redis may replace local containers without changing ownership or retention boundaries.
- Use a reverse proxy for Next.js HTTP and Socket.IO WebSocket upgrade routing. Do not deploy the realtime service to a lambda-only target.
- Deploy to staging first, run migrations and smoke tests, then promote the same image digests to production.

Each release records the Git commit, image digests, `pnpm-lock.yaml` checksum, migration set, theme manifest/version, asset version, environment, and timestamp. Rollback restores the prior images and compatible theme/assets. Database migrations must remain backward compatible for at least one release whenever practical; destructive migrations require backup, rehearsal, and dedicated rollback notes.

### 10. Dependency policy

- Do not run unrelated upgrades during feature work.
- Patch/security updates use focused maintenance tasks with tests and audit evidence.
- Minor updates require changelog review and relevant regression tests.
- Major framework, ORM, transport, database, or state-management changes require an ADR.
- CI runs frozen installs, type checking, lint, tests, production builds, and dependency audits.
- A critical/high advisory affecting a reachable path blocks release until patched or formally risk-accepted.
- Generate an SBOM from pnpm during release builds.

## Alternatives

### Laravel + Inertia

Rejected before implementation. It is capable of the product requirements, but it would require the primary developer to maintain PHP/Laravel knowledge and duplicate more contracts between PHP and TypeScript. It offers no meaningful browser-game FPS advantage because Phaser runs client-side.

### Next.js plus a second API service from day one

Rejected for M1–M6. It duplicates deployment and domain boundaries before scale or protocol requirements justify them. Next.js Route Handlers and Server Actions are sufficient for the invitation's initial HTTP mutations.

### Long-lived Socket.IO inside Next.js Route Handlers

Rejected. Lambda/serverless Route Handler deployments may terminate long-lived connections and do not provide a reliable WebSocket process lifecycle. Realtime receives a dedicated service.

### Fastify without NestJS

Considered and technically viable. NestJS is retained for the isolated realtime service because its modules, gateways, dependency injection, lifecycle hooks, and test structure make connection/auth/presence responsibilities explicit. M7 may simplify to plain Fastify only if spike evidence shows Nest adds material overhead; doing so requires amending this ADR.

### Prisma instead of Drizzle

Rejected for the initial baseline. Prisma provides strong tooling but adds a separate schema/client-generation layer that is unnecessary for this compact, one-deployment application. Drizzle provides typed SQL with fewer layers.

### Phaser 4 instead of Phaser 3.90

Deferred. Phaser 4 is available, but changing a major engine alongside the backend architecture increases vertical-slice risk. Adoption requires a separate compatibility/performance ADR.

### Self-service dashboard and multi-tenant CRUD

Rejected by CR-001. Developer-operated configuration/seed workflows remain the MVP, even though Next.js can support dashboard routes later.

## Consequences

### Positive

- One language and type system across UI, game bridge, API, jobs, database access, and realtime.
- Lower learning overhead for the primary developer.
- Shared Zod contracts reduce frontend/backend drift.
- Next.js provides invitation rendering and MVP HTTP behavior without a premature second service.
- Realtime remains operationally isolated and independently scalable.
- Phaser performance characteristics remain unchanged by the backend switch.

### Negative

- The eventual system has separate web, worker, and realtime processes.
- Shared TypeScript packages can become tightly coupled without enforced boundaries.
- Next.js server/client module separation needs bundle-leak tests and discipline.
- Very recent major versions require clean-install and compatibility proof in M1.
- Drizzle's current stable line is pre-1.0, so minor upgrades require careful migration review.

## Migration and rollback

There is no application code to migrate. The earlier Laravel ADR was proposed but never accepted, so this revision replaces it directly.

If an exact baseline proves incompatible during M1:

1. Capture the clean-install/build failure and smallest reproduction.
2. Do not silently switch framework, ORM, transport, or package manager.
3. Amend this ADR with the compatible version and evidence.
4. Regenerate `pnpm-lock.yaml` from the accepted set.
5. Verify install, typecheck, lint, unit tests, and production build from a clean checkout.

Rollback before M1 is simply restoration of this document revision. After M1, architecture rollback requires reverting workspace code and schema migrations together; Laravel is not maintained as a parallel fallback.

## Verification required before acceptance

- Product/technical owner approves the TypeScript stack and deployment baseline.
- M0-06 documentation checks confirm that the implementation plan and playbook no longer prescribe Laravel/Inertia.
- Exact versions are traceable to official release pages or package registries as of the research date.
- The design preserves CR-001, React–Phaser ownership, non-game access, device budgets, and privacy rules.
- M1 must still prove clean installation, lockfile resolution, tests, and production build; this ADR alone does not prove compatibility.

## Sources checked

- Next.js package releases: <https://www.npmjs.com/package/next>
- Next.js Route Handlers: <https://nextjs.org/docs/app/getting-started/route-handlers>
- Next.js backend-for-frontend and WebSocket limitation: <https://nextjs.org/docs/app/guides/backend-for-frontend>
- Node.js lifecycle: <https://nodejs.org/en/about/previous-releases>
- pnpm releases: <https://github.com/pnpm/pnpm/releases>
- TypeScript releases: <https://www.npmjs.com/package/typescript>
- React releases: <https://react.dev/versions>
- Phaser project templates and releases: <https://docs.phaser.io/phaser/getting-started/project-templates> and <https://phaser.io/download/archive>
- NestJS releases: <https://github.com/nestjs/nest/releases>
- Fastify releases and patched advisory: <https://github.com/fastify/fastify/releases> and <https://github.com/fastify/fastify/security/advisories/GHSA-hwr6-493r-vm6h>
- Socket.IO package releases: <https://www.npmjs.com/package/socket.io>
- Socket.IO Redis adapter releases: <https://www.npmjs.com/package/@socket.io/redis-adapter>
- Drizzle ORM and Drizzle Kit releases: <https://www.npmjs.com/package/drizzle-orm> and <https://www.npmjs.com/package/drizzle-kit>
- BullMQ releases: <https://github.com/taskforcesh/bullmq/releases>
- Zod package releases: <https://www.npmjs.com/package/zod>
- PostgreSQL releases: <https://www.postgresql.org/docs/release/>
- Redis releases: <https://download.redis.io/releases/>
- Tailwind releases: <https://github.com/tailwindlabs/tailwindcss/releases>
- Motion changelog: <https://motion.dev/changelog?type=minor>
- Vitest releases: <https://vitest.dev/blog>
- React Testing Library releases: <https://www.npmjs.com/package/@testing-library/react>
- Playwright package releases: <https://www.npmjs.com/package/@playwright/test>
- Artillery releases: <https://www.npmjs.com/package/artillery>
- ESLint releases: <https://eslint.org/blog/2026/09/eslint-v10.10.0-released/>
- Prettier releases: <https://prettier.io/blog/2026/06/27/3.9.0.html>
