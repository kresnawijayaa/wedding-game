# M2-01 Domain Migration Evidence

Date: 2026-09-21  
Task: `M2-01`  
Result: PASS

## Outcome and acceptance criteria

- PostgreSQL schema covers weddings, couples, events, guests, and versioned theme assignments.
- Foreign keys cascade only within one wedding aggregate; database checks protect slugs, publication state, event time order, and party-size range.
- The generated Drizzle migration is committed and reproducible.
- The validated M1-07 fixture is persisted transactionally and idempotently.
- Guest rows contain invitation state but no raw personalized token; signed token handling remains M2-03.

## Tests and results

| Test | Result |
|---|---|
| `pnpm --filter @wedding-quest/database db:check` | PASS; migration metadata is consistent |
| `pnpm verify` | PASS; 30 unit tests, boundaries, lint, formatting, typechecks, production build, bundle budget, and client isolation |
| [GitHub Actions run 35566259440](https://github.com/kresnawijayaa/wedding-game/actions/runs/35566259440) | PASS; migration, two seed runs, persisted-count verification, infrastructure probe, build, and browser tests |

## Performance, accessibility, and security impact

Indexes cover wedding event ordering and guest lookup. This server-only change adds no client JavaScript or accessibility surface. Seed logs contain only the public sample slug.

## Files or modules changed

- `packages/database/src/schema/index.ts`
- `packages/database/src/seed.ts`
- Generated Drizzle migration and metadata
- Database scripts/tests, CI integration gate, and documentation

## Plan/ADR/CR updates

The work follows the PostgreSQL/Drizzle architecture already approved in ADR-001 and ADR-002. No ADR or Change Request is required.

## Remaining risks or follow-ups

M2-02 must expose these tables only through authorized server-side repositories. M2-03 must add signed guest-token handling without persisting raw tokens.
