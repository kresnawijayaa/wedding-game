# M1-03 Environment Security Evidence

Date: 2026-09-16  
Task: `M1-03`  
Result: PASS

## Outcome and scope

Wedding Quest now validates deployment configuration at runtime/build boundaries without exposing private values to browser code. The config package owns separate public and server schemas. The Next.js server accessor is poisoned with `server-only`, while the public accessor explicitly selects only approved `NEXT_PUBLIC_*` values.

Local development has safe defaults. Staging and production fail before serving pages unless they receive an HTTPS application URL and a signing secret of at least 32 characters. `.env.example` contains variable names and non-secret defaults only; all real `.env` variants remain ignored.

## Acceptance criteria satisfied

- Environment input is treated as untrusted and parsed by Zod.
- Public output is an explicit allowlist and cannot return server-only input.
- Server access is isolated behind a Next.js `server-only` module.
- Public feature flags accept only literal `true` or `false` values.
- Staging/production require HTTPS and a sufficiently long signing secret.
- Validation errors identify invalid keys without including rejected secret values.
- A synthetic secret canary is absent from all generated static client assets.
- Environment unit tests and the client-bundle boundary scan are permanent quality commands.

## Tests and results

| Test | Result |
|---|---|
| `pnpm.cmd verify:environment` | PASS; 7 tests, 0 failures |
| Public allowlist with injected private key | PASS; server key omitted |
| Invalid public flag | PASS; rejected with key-specific error |
| Local defaults without secret | PASS |
| Staging/production missing or insecure values | PASS; rejected |
| Rejected secret error sanitization | PASS; value absent from message |
| Production build without required variables | EXPECTED FAIL; both missing keys reported without values |
| Production build with HTTPS URL and synthetic secret canary | PASS |
| `pnpm.cmd verify:client-boundaries` | PASS; 9 generated static files inspected |
| Synthetic canary search in `.next/static` | PASS; no match |
| `pnpm.cmd verify` | PASS; quality, production build, and bundle boundary scan |

## Performance, accessibility, and security impact

- Environment parsing runs during server module evaluation/build and adds no client interaction or accessibility behavior.
- Only a small public configuration object may enter client code; signing material remains server-only.
- The client-bundle scan mitigates `R-004` and now runs after every local `pnpm verify`.
- No genuine secret, production credential, or guest data was used. Bundle-leak testing used a disposable synthetic canary.

## Files and modules changed

- Environment contract: `packages/config/src/environment/public.ts` and `server.ts`.
- Next.js accessors: `apps/web/environment/public.ts` and `server.ts`.
- Validation tests: `packages/config/tests/environment.test.mjs`.
- Bundle verification: `scripts/verify-client-boundaries.mjs`.
- Safe template and ignore boundary: `.env.example` and `.gitignore`.
- Scripts/dependencies: root, config, and web `package.json` files plus `pnpm-lock.yaml`.
- Shared TypeScript option: `packages/tooling/typescript/base.json`.

## Plan/ADR/CR updates

- `M1-03` moved to `DONE`; `M1-04` moved to `READY`.
- No ADR or Change Request was required; implementation follows ADR-001 sections 7–9.

## Remaining risks and follow-ups

- `M1-04` must extend the server schema with database, Redis, queue, and object-storage variables when those adapters are introduced.
- `M1-05` must run the same quality and bundle checks in CI.
- Future server-only variables must be added only to the server contract and forbidden-marker scan.
