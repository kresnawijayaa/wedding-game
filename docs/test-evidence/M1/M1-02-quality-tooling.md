# M1-02 Quality Tooling Evidence

Date: 2026-09-16  
Task: `M1-02`  
Result: PASS

## Outcome and scope

The monorepo now has a reproducible quality baseline without adding wedding-domain behavior:

- ESLint 10 flat configuration checks JavaScript tooling and configuration files.
- Prettier provides explicit check and write modes for maintained source/config files.
- TypeScript 7 strict analysis runs in the web app and every source package.
- Existing architectural boundary checks remain part of the default quality gate.
- A simple-git-hooks pre-commit hook delegates to lint-staged and only changes staged files.
- `pnpm quality` runs all non-build checks; `pnpm verify` adds the production build.

The stable `typescript-eslint` release available during implementation declares TypeScript support below 6.1, while ADR-001 pins TypeScript 7.0.2. It was therefore not installed with incompatible peer dependencies. TypeScript source uses the native strict compiler; ESLint covers JavaScript tooling until upstream compatibility is declared.

## Acceptance criteria satisfied

- A root ESLint flat config exists and fails on warnings.
- `pnpm format:check` is read-only and `pnpm format` applies formatting.
- Strict typecheck scripts cover `apps/web`, `packages/config`, `packages/database`, `packages/game`, and `packages/shared`.
- `pnpm quality` combines boundaries, linting, formatting, and type checking.
- `pnpm verify` combines the quality gate with a production Next.js build.
- The installed pre-commit hook runs lint-staged with sequential commands and does not scan or rewrite unstaged files.
- Exact dependency versions and the pnpm lockfile make the setup reproducible.

## Test evidence

| Command | Result |
|---|---|
| `pnpm.cmd install --frozen-lockfile` | PASS; lockfile current, all seven workspace projects recognized |
| `pnpm.cmd quality` | PASS; boundaries, ESLint, Prettier, and five source-workspace typechecks passed |
| `pnpm.cmd verify` | PASS; full quality gate plus Next.js 16.3.5 production build and static route generation passed |
| `git hook run pre-commit` with an empty index | PASS; lint-staged reported no staged files and did not touch the worktree |
| `git diff --check` | PASS; no whitespace errors |

An initial frozen-install retry was required because Windows briefly held a lock on `node_modules/.pnpm`; the isolated rerun completed successfully in 34 ms. This was environmental and did not require a repository workaround.

## Performance, accessibility, and security

- No runtime dependency or application behavior was added, so there is no guest bundle or accessibility impact.
- The production build remains static and Phaser remains outside the initial web dependency graph.
- pnpm supply-chain policy explicitly denies the dependency lifecycle script for `simple-git-hooks`; the trusted root `prepare` script installs the configured hook.
- No secret, token, guest content, or diagnostic payload is introduced or logged.

## Files and modules changed

- Root quality configuration: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `eslint.config.mjs`, `lint-staged.config.mjs`, `.prettierrc.json`, `.prettierignore`.
- Workspace static analysis: package scripts and `tsconfig.json` files under `packages/config`, `packages/database`, `packages/game`, and `packages/shared`.
- Formatting-only source changes: `apps/web/app/globals.css`, `apps/web/app/page.tsx`, and `apps/web/tsconfig.json`.
- Documentation/status: `README.md`, `docs/IMPLEMENTATION_PLAN.md`, and `docs/PROJECT_STATUS.md`.

## Remaining risks and follow-ups

- Re-evaluate `typescript-eslint` after it declares TypeScript 7 support; do not relax strict peer-dependency enforcement meanwhile.
- CI enforcement belongs to `M1-05`; local commands and hooks are present now, but there is not yet a remote branch-protection gate.
- `M1-03` is next and must add validated environment boundaries without exposing secrets to client code.
