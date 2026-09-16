# ADR-002 — Shared Server Infrastructure Boundary

**Status:** Accepted  
**Date:** 2026-09-16  
**Task:** M1-04  
**Decision owners:** Product owner and technical owner

## Context

ADR-001 assigns PostgreSQL/Drizzle to `packages/database`, BullMQ to a separate worker process, Redis to ephemeral state and queue transport, and S3-compatible storage to wedding media. Redis, queue, and object-storage clients will be needed by more than one server application. Placing those clients in `apps/web` would force the worker to import private web modules; placing them in `packages/database` would mix unrelated infrastructure responsibilities.

ADR-001 lists an optional MinIO local profile. Since that decision, the upstream MinIO community repository has been archived and community binary/container distribution has ended. The final container line is legacy software rather than a maintained default. Production remains Cloudflare R2 as already decided.

## Decision

Add a private `@wedding-quest/infrastructure` workspace package for Node-only Redis, BullMQ, and S3-compatible object-storage adapters.

- All exports live under `@wedding-quest/infrastructure/server/*`.
- Browser/game packages may not depend on it.
- `packages/database` remains the sole Drizzle/PostgreSQL boundary.
- `apps/worker` may depend on infrastructure, database, config, and shared contracts, but never on private Next.js modules.
- Redis uses ioredis because BullMQ 6 supports it directly and this avoids two Redis client implementations.
- Object storage uses AWS S3 client 3.1132.0 against Cloudflare R2 in production and any explicitly configured S3-compatible endpoint in development. Patch 3.1133.0 was intentionally not exempted from the repository's 24-hour minimum-release-age policy.
- The committed Compose baseline includes pinned PostgreSQL and Redis services bound to loopback.
- No MinIO container is included by default. A developer may configure a separately maintained S3-compatible local endpoint without changing application code.
- Photobooth images remain browser-local and must never use this adapter.

## Consequences

### Positive

- Web and worker code share one tested server infrastructure boundary.
- Database ownership stays narrow and migrations remain reviewable.
- Browser bundles can be checked for both database and infrastructure markers.
- Local development does not silently depend on archived object-storage binaries.

### Negative

- The repository gains one server-only package beyond the initial illustrative layout.
- Developers who require local object storage must provide a maintained S3-compatible endpoint or use an isolated development bucket.
- Redis connections must use purpose-specific retry behavior; request and worker connections are not interchangeable.

## Alternatives

### Put all adapters in `packages/database`

Rejected because queues and object storage are not database responsibilities and would make the package an ambiguous server utility collection.

### Keep adapters inside `apps/web`

Rejected because the BullMQ worker must not import private application code.

### Pin the final legacy MinIO image

Rejected as the default because upstream community container maintenance has ended. Optional developer-managed S3 compatibility remains supported.

## Verification

- Boundary checks reject infrastructure dependencies from Phaser and browser-facing packages.
- Unit tests exercise configuration, retry policy, queue defaults, and storage-key safety without external services.
- Compose configuration validates successfully.
- PostgreSQL, Redis, and BullMQ connectivity are proven through a disposable local integration probe when Docker is available.
- Production web builds and client-bundle checks remain green.

## Sources

- MinIO repository and source-only distribution notice: <https://github.com/minio/minio>
- Final MinIO security release history: <https://github.com/minio/minio/releases>
