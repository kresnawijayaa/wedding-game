# M1-01 Foundation Evidence

**Task:** M1-01  
**Date:** 2026-09-16  
**Environment:** Windows 11, Node.js 24.21.0, pnpm 12.4.1  
**Result:** Passed

## Acceptance criteria

- pnpm workspace contains the Next.js web application and approved package boundaries.
- Exact runtime and direct dependency baselines are pinned; `pnpm-lock.yaml` is committed as the resolution source.
- A frozen install succeeds.
- Boundary verification, TypeScript checking, and the optimized production build succeed.
- The web shell responds successfully and provides accessible semantic structure.
- Phaser is present only in `packages/game` and does not enter the initial web static bundle.

## Commands and results

| Command/check | Result |
|---|---|
| `node --version` | Passed: `v24.21.0` |
| `pnpm.cmd --version` | Passed: `12.4.1` |
| `pnpm.cmd install --frozen-lockfile` | Passed: lockfile current; supply-chain policy check passed |
| `pnpm.cmd verify:boundaries` | Passed: all workspace package boundaries verified |
| `pnpm.cmd typecheck` | Passed: TypeScript reported no errors |
| `pnpm.cmd build` | Passed: Next.js 16.3.5 optimized production build |
| Route output | `/` and `/_not-found` prerendered as static content |
| Development HTTP probe | Passed: `GET /` returned 200 |
| `rg -i phaser apps/web/.next/static` | Passed: no Phaser references in static web bundle |
| Generated nested agent files | Passed: disabled and absent; root `AGENTS.md` remains authoritative |

## Architecture evidence

- `apps/web` imports only framework-neutral `@wedding-quest/shared` and `@wedding-quest/config` workspace packages.
- `packages/game` owns Phaser and is forbidden from depending on Next.js, Drizzle, Redis, BullMQ, NestJS, or Socket.IO.
- `packages/database` exposes only a `./server` entry point.
- `scripts/verify-boundaries.mjs` fails the build when these initial invariants drift.
- `apps/worker` and `apps/realtime` are intentionally not scaffolded before their roadmap tasks.

## Performance, accessibility, and security impact

- Next.js server-renders and statically prerenders the current shell.
- Phaser is excluded from the initial web bundle; gallery, realtime, and photobooth code are not present.
- The shell includes Indonesian document language, one main landmark, a skip link, semantic headings, visible keyboard focus, reduced-motion handling, mobile safe areas, and touch-sized primary action.
- No secrets, environment values, guest data, database clients, or external media are present.
- `poweredByHeader` is disabled and server-only database access has a dedicated package boundary.

## Limitations and follow-ups

- No browser surface was available for screenshot-based visual QA in this environment. HTTP/render/build checks passed; cross-browser and physical-device visual evidence remains scheduled by the device matrix.
- CI is introduced by M1-05. The local `pnpm verify` command is the reproducible evidence until that task moves the same checks into CI.
- Linting, formatting, broader static analysis, and pre-commit checks belong to M1-02.
