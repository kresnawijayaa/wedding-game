# M1-07 Sample Wedding Seed Evidence

Date: 2026-09-21  
Task: `M1-07`  
Result: LOCAL PASS — REMOTE VERIFICATION PENDING

## Outcome and acceptance criteria

- One deterministic Indonesian sample wedding covers the wedding, couple, ceremony, reception, guest, and versioned theme-assignment records needed by the upcoming domain migration.
- Zod validates identifiers, references, publication state, event times, locale, timezone, and theme version.
- Couple-specific content remains separate from game geometry and reusable runtime logic.
- The fixture contains no raw guest token and no secret.
- `pnpm seed:validate` provides a documented reproduction command.
- Database persistence remains explicitly owned by M2-01 because M1 has no domain tables to write to.

## Tests and results

| Test | Result |
|---|---|
| `pnpm seed:validate` | PASS; `ayu-rama`, 2 events, 1 guest |
| `pnpm verify:seed` | PASS; 4/4 tests |
| `pnpm quality` | PASS; boundaries, 24 tests, lint, formatting, and all workspace typechecks |
| GitHub Actions | PENDING; requires commit and push |

## Performance, accessibility, and security impact

The fixture is development-only data and adds no client runtime or accessibility cost. It contains fictional identities, a placeholder map domain, no credentials, and no personalized access token.

## Files or modules changed

- `packages/config/src/wedding-seed.ts`
- `packages/config/tests/wedding-seed.test.mjs`
- `packages/config/scripts/validate-sample-wedding.mjs`
- Root/package scripts and task documentation

## Plan/ADR/CR updates

M1-07 is clarified as the validated fixture task, while database persistence remains M2-01 as already planned. No architecture or product scope changed, so no ADR or Change Request is required.

## Remaining risks or follow-ups

M2-01 must map this fixture to database inserts transactionally and keep repeated local seeding idempotent.
