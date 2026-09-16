# M1-04 Server Infrastructure Evidence

Date: 2026-09-16  
Task: `M1-04`  
Result: PASS

## Outcome and scope

Wedding Quest now has explicit server-only boundaries for PostgreSQL/Drizzle, Redis, BullMQ, and S3-compatible object storage. A separate worker application owns background-job lifecycle. Docker Compose provides pinned, loopback-only PostgreSQL and Redis services for local development; wedding-domain tables remain reserved for M2.

ADR-002 records the shared infrastructure package boundary and the decision not to bundle an unmaintained MinIO community container. The storage adapter remains compatible with an explicitly configured S3 endpoint and Cloudflare R2.

## Acceptance criteria satisfied

- PostgreSQL access and Drizzle metadata live in the server-only database package.
- Redis, queue, and object-storage adapters live in a shared server-only infrastructure package.
- The worker is a separate process and does not import private Next.js modules.
- Compose services use pinned images, health checks, named volumes, and loopback-only ports.
- Redis request and BullMQ worker connections use purpose-specific retry behavior.
- Storage keys are validated before object operations.
- Database, Redis, queue, storage, and worker variables are validated without leaking secret values.
- Boundary checks prevent infrastructure dependencies from entering Phaser or browser-facing code.

## Tests and results

| Test | Result |
|---|---|
| `pnpm install --frozen-lockfile` | PASS; all 9 workspaces installed reproducibly |
| `pnpm verify:environment` | PASS; 8 tests, 0 failures |
| `pnpm verify:infrastructure` | PASS; 6 tests, 0 failures |
| `pnpm --filter @wedding-quest/database db:check` | PASS |
| `docker compose config --quiet` | PASS |
| `docker compose up -d postgres redis` | PASS; both services healthy |
| `pnpm infra:probe` | PASS; PostgreSQL, Redis, and BullMQ round trip verified |
| `docker compose down` | PASS; services removed and named data volumes retained |
| `pnpm verify` | PASS; boundaries, tests, lint, formatting, typecheck, build, and bundle scan |
| `pnpm audit --prod` | PASS; no known runtime vulnerabilities |
| Production client canary scan | PASS; no server infrastructure marker in static assets |

## Performance, accessibility, and security impact

- Infrastructure packages are never shipped to the browser, so they add no client bundle or accessibility cost.
- Connections are created lazily and expose explicit close paths; the worker handles termination signals.
- Local service ports bind only to loopback. Credentials in Compose are development-only defaults.
- Validation errors and tests avoid printing signing secrets, storage credentials, or guest-authored data.

## Files and modules changed

- Database boundary: `packages/database`.
- Shared server adapters: `packages/infrastructure`.
- Worker process: `apps/worker`.
- Local services and probe: `compose.yaml` and `scripts/probe-infrastructure.mjs`.
- Environment contract and examples: `packages/config` and `.env.example`.
- Architecture record: `docs/decisions/ADR-002-server-infrastructure-boundary.md`.
- Workspace scripts and lockfile: root `package.json`, workspace manifests, and `pnpm-lock.yaml`.

## Plan/ADR/CR updates

- `M1-04` moved to `DONE`; `M1-05` moved into implementation/verification.
- ADR-002 was accepted for the shared server infrastructure boundary and local object-storage decision.
- No Change Request was required; product scope did not change.

## Remaining risks and follow-ups

- A live S3-compatible endpoint was not required for this foundation task; provider integration must be exercised before media upload ships.
- Wedding-domain tables and migrations begin in M2.
- The worker currently proves lifecycle and queue connectivity; production processors arrive with their owning feature tasks.
- Health/readiness HTTP endpoints remain M1-08 scope.
