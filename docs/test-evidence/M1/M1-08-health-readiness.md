# M1-08 Health and Readiness Evidence

Date: 2026-09-21  
Task: `M1-08`  
Result: PASS

## Outcome and acceptance criteria

- `/api/health` is a dependency-free liveness endpoint.
- `/api/readiness` checks PostgreSQL and Redis concurrently with bounded waiting.
- Readiness returns HTTP 200 only when both dependencies respond; otherwise it returns 503.
- Responses disable caching and expose no URLs, credentials, exception messages, or other internals.
- Connections are closed after every readiness request.

## Tests and results

| Test | Result |
|---|---|
| `pnpm verify:health` | PASS; 4/4 liveness, readiness, sanitization, and timeout tests |
| `pnpm verify` | PASS; 28 unit tests, boundaries, lint, formatting, typechecks, production build, 166.6 KiB initial JavaScript, and client isolation |
| [GitHub Actions run 35564084065](https://github.com/kresnawijayaa/wedding-game/actions/runs/35564084065) | PASS; quality/unit, build, migration/seed integration, infrastructure probe, and browser smoke tests |

## Performance, accessibility, and security impact

The endpoints add no client JavaScript or user-interface accessibility surface. Checks run only on request, use a single database connection, have a four-second bound, and sanitize failure output to `ok` or `error`.

## Files or modules changed

- `apps/web/app/api/health/route.ts`
- `apps/web/app/api/readiness/route.ts`
- `apps/web/health/readiness.ts`
- Focused unit/browser tests, workspace boundaries, and documentation

## Plan/ADR/CR updates

M1-08 uses the already approved Next.js backend and server-only infrastructure packages. No ADR or Change Request is required.

## Remaining risks or follow-ups

Deployment probes must use liveness for process restarts and readiness for traffic routing, with intervals longer than the dependency timeout.
