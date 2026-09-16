# Implementation Plan — Wedding Quest Platform

**Status:** Baseline plan 1.0  
**Working title:** Wedding Quest  
**Document role:** Source of truth for product scope, architecture, delivery order, and acceptance criteria  
**Target experience:** Mobile-first wedding invitation presented as an explorable 2D world, with conventional web modals for wedding information and optional realtime guest presence/chat.

---

## 1. How this document must be used

This file is the project's implementation contract. Product decisions, technical changes, and development tasks must trace back to it.

At the beginning of every development session:

1. Read sections 1–8 and the currently active milestone.
2. Confirm the active milestone and its exit criteria.
3. Select only tasks marked `READY` whose dependencies are complete.
4. Record material decisions in the Decision Log.
5. Do not add a feature merely because it is convenient while working on another task.

At the end of every development session:

1. Update task status and evidence.
2. Record tests executed and their results.
3. Record deviations, risks, or newly discovered dependencies.
4. Confirm whether the milestone exit criteria remain accurate.
5. Add the next recommended task without silently changing scope.

Any requested change must be classified as one of:

- **Clarification:** Does not alter scope or architecture; update wording directly.
- **Correction:** Fixes an invalid assumption; document the evidence and affected tasks.
- **Scope change:** Adds/removes behavior; create a Change Request before implementation.
- **Architecture change:** Changes a major technology or boundary; create an ADR before implementation.

No milestone is complete because its code exists. It is complete only when its exit criteria and verification evidence are satisfied.

---

## 2. Product objective

Create a reusable wedding invitation codebase in which guests can:

1. Open a personalized invitation link without installing an application.
2. Choose an avatar and enter an explorable 2D venue.
3. Move by touchscreen joystick, keyboard, or directional controls.
4. Approach themed stations and open wedding information.
5. Open the same information directly from an accessible navigation menu.
6. View the couple, schedule, gallery, RSVP/wishes, gift information, and photobooth.
7. Optionally see other active guests and exchange short messages or reactions.
8. Use the experience comfortably on mid-range mobile devices and ordinary desktop browsers.

Each project/deployment serves one wedding. The codebase must remain reusable so a developer can copy it for a future wedding and replace validated content, copywriting, photos, backgrounds, audio, and theme assets without rebuilding the core movement, interaction, modal, realtime, or accessibility systems. This is not a multi-tenant SaaS product.

### Product principles

- The game enriches the invitation; it must never block access to important information.
- All important content must remain reachable without moving the character.
- Mobile performance is a primary requirement, not a later optimization.
- Wedding data, visual theme, and game-world geometry must remain separate.
- Realtime features must degrade gracefully when disconnected.
- Guest privacy and abuse prevention are part of the core design.

---

## 3. Scope boundaries

### 3.1 MVP scope

Scope amended by accepted `CR-001` on 2026-09-15.

- Personalized invitation URL and guest name.
- Cover/entrance screen.
- Four avatar presets with masculine and feminine presentations, without requiring a gender label from the guest.
- One complete explorable theme.
- Four-direction movement with normalized diagonal speed.
- Camera follow and world bounds.
- Static collision geometry.
- Interaction zones and contextual action button.
- Direct-access bottom navigation.
- Couple, schedule, gallery, RSVP/wishes, and gift modals.
- Background music with explicit user activation.
- Responsive mobile and desktop presentation.
- Developer-managed wedding content through validated configuration/seed data.
- Developer-operated image optimization and asset delivery pipeline.
- Realtime guest presence and interpolated remote avatars behind a feature flag.
- Ephemeral bubble chat and predefined quick reactions behind a feature flag.
- Client-side photobooth capture, frame composition, and download behind a feature flag; no server upload.
- Graceful non-game, offline, realtime-disabled, and unsupported-device fallbacks.
- Basic analytics and error monitoring.
- Automated test coverage for critical flows.

### 3.2 Production release scope

- Realtime operational monitoring, load hardening, and room controls.
- Additional reusable game themes.
- Optional authenticated operator/dashboard workflows if later approved.
- Optional server-backed photobooth gallery only through a future Change Request with privacy and retention review.
- QR guest check-in integration if required by the business.
- Operational dashboard and alerting.

### 3.3 Explicit non-goals for the first release

- Multi-tenant SaaS operation or one deployment serving multiple couples.
- A self-service couple/admin dashboard.
- Server storage or shared gallery of photobooth captures.
- Competitive gameplay, scoring, combat, or complex physics.
- User-created maps inside the browser.
- Voice/video chat.
- Peer-to-peer networking.
- Native Android or iOS applications.
- Server-authoritative physics simulation.
- Unlimited free-form avatar customization.
- Offline RSVP submission.
- 3D rendering.

---

## 4. Chosen technical architecture

### 4.1 Recommended stack

| Layer | Choice | Responsibility |
|---|---|---|
| Monorepo/runtime | pnpm workspace + Node.js LTS + TypeScript | Reproducible install and shared contracts across applications/packages |
| Web/BFF | Next.js App Router | SSR/metadata, guest links, RSVP/wishes, developer-operated HTTP workflows |
| Web UI | React + TypeScript | Cover, HUD, navigation, dialogs, forms, gallery, accessible fallbacks |
| Styling | Tailwind CSS + Radix/shadcn patterns | Responsive and accessible UI components |
| Motion | Framer Motion | DOM transitions only; respect reduced-motion settings |
| Game runtime | Phaser 3 | Canvas/WebGL world, player, camera, collision, NPCs, proximity detection |
| Validation/contracts | Zod + shared workspace package | Runtime validation and common UI/game/API/realtime contracts |
| Database | PostgreSQL | Durable application and invitation records |
| Database access | Drizzle ORM | Typed queries and reviewable SQL migrations |
| Realtime (M7) | Dedicated NestJS/Fastify + Socket.IO service | Presence, player snapshots, chat, reactions |
| Ephemeral state | Redis | Presence TTL, room membership, rate limits, pub/sub |
| Queue | BullMQ worker | Image processing, cleanup, and asynchronous operations |
| Object storage | S3-compatible storage such as Cloudflare R2 | Wedding photos, audio, and optimized invitation assets |
| CDN/edge | Cloudflare or equivalent | Asset caching, TLS, basic edge protection |
| Monitoring | Sentry + structured application logs | Frontend/backend errors and release health |
| Testing | Vitest, React Testing Library, Playwright, Artillery | Unit, integration, browser, and realtime load tests |

Use current stable versions when the repository is initialized. Pin exact versions in the lockfile and record them in ADR-001. Do not upgrade major versions during an active milestone without a separate task.

### 4.2 High-level runtime

```text
Guest browser
├── Next.js/React application
│   ├── cover and guest personalization
│   ├── fixed HUD and navigation
│   ├── accessible content modals
│   └── forms and gallery
├── Phaser canvas
│   ├── world background
│   ├── stations and foreground objects
│   ├── player/NPC sprites
│   ├── collisions and triggers
│   └── camera and controls
└── Typed event bridge
    ├── Phaser → React: nearby station, scene ready, player state
    └── React → Phaser: pause, resume, avatar, modal state, audio state

Next.js web/BFF
├── App Router pages, server components, and metadata
├── Route Handlers/Server Actions for validated mutations
├── PostgreSQL
├── Redis-backed rate limits/cache
├── object storage
└── BullMQ → separate worker process

M7 dedicated realtime service
└── NestJS/Fastify + Socket.IO ↔ Redis ↔ connected guests
```

### 4.3 Mandatory architectural boundaries

- Phaser must not render long-form wedding content or forms.
- React must not implement character physics or the camera loop.
- Wedding records must not contain hard-coded screen coordinates.
- Theme geometry must not contain couple-specific content.
- Realtime positions must not be written continuously to PostgreSQL.
- Long-lived realtime connections must not run inside Next.js Route Handlers or lambda-only functions.
- UI components must not call Phaser internals directly; use the typed bridge.
- Domain services must not depend on a specific theme.
- Server-only database modules must never enter browser bundles.
- Assets must be referenced through a manifest, not scattered import paths.

---

## 5. Repository layout

```text
apps/
├── web/                         # Next.js App Router, React UI, and MVP HTTP backend
├── worker/                      # BullMQ processors, enabled when jobs are introduced
└── realtime/                    # NestJS/Fastify + Socket.IO, introduced in M7

packages/
├── game/                        # Phaser scenes, systems, assets, and typed React bridge
├── shared/                      # Zod schemas, DTOs, events, IDs, and framework-neutral types
├── database/                    # Drizzle schema, queries, SQL migrations, and seed helpers
├── config/                      # Validated wedding content and feature configuration
├── infrastructure/              # Server-only Redis, queue, and object-storage adapters
└── tooling/                     # Shared TypeScript, ESLint, Vitest, and build configuration

assets/
├── sources/                     # PSD/Aseprite/source artwork; not web-served
├── exported/
└── manifests/

docs/
├── IMPLEMENTATION_PLAN.md
├── decisions/
├── contracts/
├── runbooks/
└── test-evidence/
```

`packages/game` may not import Next.js, Drizzle, Redis, BullMQ, NestJS, or Socket.IO. `packages/database` is server-only. Applications share validated contracts through `packages/shared`, not by importing one another's private modules.

---

## 6. Core data model

### 6.1 Durable PostgreSQL records

| Entity | Essential fields |
|---|---|
| `weddings` | stable ID, slug, status, locale, timezone, publication settings |
| `couples` | names, biographies, family details, social links |
| `events` | title, date/time, venue, address, map URL, streaming URL |
| `guests` | wedding, personalized token, display name, group, invitation status |
| `theme_assignments` | wedding, theme ID, version, serialized safe customizations |
| `media_assets` | wedding, storage key, type, dimensions, size, processing status |
| `gallery_items` | wedding, media, caption, order, visibility |
| `rsvp_responses` | guest, attendance, party size, message, timestamps |
| `wishes` | wedding, guest/display name, message, sticker, moderation state |
| `gift_methods` | wedding, type, encrypted/safely stored destination fields |
| `analytics_events` | privacy-safe event name, wedding, coarse client context, timestamp |
| `audit_logs` | actor, action, target, safe before/after summary |

### 6.2 Ephemeral Redis records

- Active guest sessions by wedding room.
- Last known player snapshot.
- Presence heartbeat TTL.
- Chat and movement rate-limit counters.
- Ephemeral chat/reaction payloads required for short bubble delivery; no durable history.
- Pub/sub channels.
- Temporary reconnect tokens.

Presence must disappear automatically after missed heartbeats. PostgreSQL is not the authoritative source for who is currently online.

---

## 7. Theme and world specification

Every theme must be data-driven and versioned.

```ts
interface ThemeManifest {
  id: string;
  version: number;
  logicalViewport: { width: 480; height: 720 };
  world: { width: number; height: number; backgroundKey: string };
  spawnPoints: Array<{ id: string; x: number; y: number }>;
  colliders: ColliderDefinition[];
  interactionZones: InteractionZoneDefinition[];
  stations: StationDefinition[];
  foregroundLayers: LayerDefinition[];
  npcs: NpcDefinition[];
  audio?: ThemeAudioDefinition;
}
```

### Theme rules

- Logical viewport baseline: 480×720 portrait.
- Phaser scaling: `FIT` plus `CENTER_BOTH`.
- Respect browser safe-area insets for DOM HUD.
- World background should normally stay below 2048 px in either dimension.
- Use WebP/AVIF for opaque world art and PNG/WebP with alpha for sprites.
- Store source artwork separately from exported runtime files.
- Interaction radius must be independent of visual image bounds.
- Collision geometry must be editable without recompiling the main application when practical.
- Every theme requires an asset manifest, spawn point, navigation labels, collision data, and automated smoke test.

### Asset budgets per theme

- Initial compressed game payload target: ≤ 4 MB.
- Individual world background target: ≤ 500 KB when visual quality allows.
- Texture dimension target: ≤ 2048×2048.
- Total decoded texture-memory target: ≤ 80 MB on mobile.
- Audio initial segment target: ≤ 1 MB; defer full audio where possible.
- Do not include gallery photos in the Phaser preload.

---

## 8. Functional contracts

### 8.1 Typed React–Phaser bridge

Required outbound events from Phaser:

```ts
type GameToUiEvent =
  | { type: "GAME_READY" }
  | { type: "LOAD_PROGRESS"; value: number }
  | { type: "INTERACTION_CHANGED"; stationId: string | null }
  | { type: "PLAYER_MOVED"; x: number; y: number; direction: Direction }
  | { type: "GAME_ERROR"; code: string };
```

Required inbound commands from React:

```ts
type UiToGameCommand =
  | { type: "SET_AVATAR"; avatarId: string }
  | { type: "SET_INPUT_ENABLED"; enabled: boolean }
  | { type: "SET_AUDIO_ENABLED"; enabled: boolean }
  | { type: "TELEPORT_TO_STATION"; stationId: string }
  | { type: "SET_REMOTE_PLAYERS"; players: RemotePlayerSnapshot[] }
  | { type: "DESTROY_GAME" };
```

### 8.2 Interaction behavior

- Entering a zone reveals a contextual prompt.
- If zones overlap, choose the nearest eligible station deterministically.
- Pressing A/Enter opens the same modal as direct navigation.
- Opening a modal disables local movement but does not destroy the game.
- Closing a modal restores input and focus appropriately.
- Direct navigation must work before the Phaser scene finishes loading.
- The Escape key closes only the topmost dismissible modal.

### 8.3 Movement behavior

- Joystick, WASD, and arrow keys feed one normalized movement vector.
- Diagonal speed equals cardinal speed.
- Input release always returns velocity to zero.
- Pointer cancellation and browser visibility changes must clear movement.
- Character animation follows direction and movement state.
- Camera follows with configurable smoothing and stays inside world bounds.

### 8.4 Realtime protocol

Client snapshot:

```ts
interface PlayerSnapshot {
  sessionId: string;
  sequence: number;
  x: number;
  y: number;
  direction: Direction;
  animation: "idle" | "walk";
  sentAt: number;
}
```

Rules:

- Movement broadcast target: 8–12 updates per second.
- Remote clients interpolate between snapshots.
- Never trust client display names or message HTML.
- Validate world bounds and implausible movement server-side.
- Heartbeat interval target: 15 seconds; presence TTL target: 45 seconds.
- Chat maximum: 120 characters by default.
- Rate-limit movement, chat, reactions, and reconnect attempts separately.
- Reconnect with bounded exponential backoff and jitter.
- Game remains usable when realtime is unavailable.

---

## 9. Delivery roadmap

Task states: `BACKLOG`, `READY`, `IN PROGRESS`, `BLOCKED`, `VERIFY`, `DONE`.

### Milestone M0 — Product and technical baseline

**Goal:** Remove ambiguity before production code.

- [DONE] `M0-01` Write user journeys for guest, developer/operator, and moderator.
- [DONE] `M0-02` Approve MVP versus production scope.
- [DONE] `M0-03` Create wireframes for cover, game HUD, all modals, loading, and error states.
- [DONE] `M0-04` Define browser/device support matrix.
- [DONE] `M0-05` Define privacy, retention, and moderation policy.
- [DONE] `M0-06` Approve ADR-001 TypeScript monorepo stack with exact stable dependency versions.
- [DONE] `M0-07` Create risk register and initial performance budgets.

**Exit criteria:** Product/technical owner approves journeys, MVP scope, wireframes, supported devices, non-goals, and ADR-001; the initial risk/performance register has owners and measurable gates.

### Milestone M1 — Repository and delivery foundation

**Goal:** Establish a reproducible, testable application skeleton.

- [DONE] `M1-01` Initialize the pnpm monorepo, Next.js, React, TypeScript, and shared package boundaries.
- [DONE] `M1-02` Configure linting, formatting, static analysis, and pre-commit checks.
- [DONE] `M1-03` Configure environment validation and safe secret handling.
- [DONE] `M1-04` Configure PostgreSQL/Drizzle, Redis, BullMQ worker, and object-storage adapters.
- [VERIFY] `M1-05` Add CI for unit/integration tests, browser tests, type checking, linting, and production builds.
- [BACKLOG] `M1-06` Configure Sentry release/environment separation.
- [BACKLOG] `M1-07` Create local seed data for one sample wedding.
- [BACKLOG] `M1-08` Add health and readiness endpoints.

**Exit criteria:** A clean checkout can be installed, migrated, seeded, tested, and built through documented commands and CI.

### Milestone M2 — Wedding domain and invitation shell

**Goal:** Render a complete non-game invitation from stored data.

- `M2-01` Implement wedding, couple, event, guest, and theme-assignment migrations.
- `M2-02` Implement server authorization and data-access boundaries.
- `M2-03` Implement personalized signed guest URL/token handling.
- `M2-04` Create the validated server-to-client invitation DTO contract.
- `M2-05` Build cover and avatar selection UI.
- `M2-06` Build accessible navigation and empty modal shells.
- `M2-07` Build loading, expired invitation, unpublished, and not-found states.
- `M2-08` Add localization infrastructure and timezone-safe date formatting.

**Exit criteria:** A guest can open a personalized invitation and access every section through ordinary web navigation without Phaser.

### Milestone M3 — Game vertical slice

**Goal:** Prove the full Phaser lifecycle with placeholder assets.

- `M3-01` Dynamically load Phaser only after the cover action.
- `M3-02` Implement Boot, Preload, and World scenes.
- `M3-03` Implement fixed logical viewport and responsive scaling.
- `M3-04` Load a placeholder world and avatar spritesheet.
- `M3-05` Implement keyboard and joystick input.
- `M3-06` Normalize diagonal movement.
- `M3-07` Implement animation state and facing direction.
- `M3-08` Implement camera follow and bounds.
- `M3-09` Implement collision primitives.
- `M3-10` Implement scene teardown without memory leaks.
- `M3-11` Add frame-rate and scene-error instrumentation.

**Exit criteria:** On target mobile and desktop browsers, a player can enter, move, collide, leave, and re-enter without duplicate canvases, stuck input, or memory growth.

### Milestone M4 — Data-driven world and interaction system

**Goal:** Complete the first real theme without hard-coded wedding content.

- `M4-01` Finalize theme manifest JSON schema.
- `M4-02` Build theme manifest validator.
- `M4-03` Produce optimized world background and foreground layers.
- `M4-04` Export player and NPC sprite atlases.
- `M4-05` Define colliders, spawn points, and station placements.
- `M4-06` Implement proximity detection and nearest-zone selection.
- `M4-07` Implement contextual action prompt.
- `M4-08` Connect station activation to the typed event bridge.
- `M4-09` Implement NPC animation and depth ordering.
- `M4-10` Add automated theme integrity and asset-budget checks.

**Exit criteria:** Every station is reachable, collision feels correct, no player can become trapped, and all world configuration passes schema validation.

### Milestone M5 — Invitation content features

**Goal:** Make the experience a complete usable wedding invitation.

- `M5-01` Couple modal.
- `M5-02` Schedule/rundown modal with map links.
- `M5-03` Gallery modal with responsive thumbnails and lightbox.
- `M5-04` RSVP form with validation and idempotent submission.
- `M5-05` Wishes list, moderation state, and optional sticker.
- `M5-06` Gift information with appropriate sensitive-data handling.
- `M5-07` Background music control and browser autoplay compliance.
- `M5-08` Deep-link/direct-navigation behavior.
- `M5-09` Pause/resume and focus restoration around modals.
- `M5-10` Reduced-motion and non-game navigation mode.

**Exit criteria:** A guest can obtain all essential information and submit RSVP with game input, direct navigation, keyboard-only navigation, and a screen reader-compatible flow.

### Milestone M6 — Developer operations and media pipeline

**Goal:** Let the developer/operator configure and publish one wedding safely through documented, validated workflows.

- `M6-01` Define and validate the wedding content configuration/seed contract.
- `M6-02` Add documented developer workflow for couple and event content updates.
- `M6-03` Add gallery asset import, ordering, captions, and removal workflow.
- `M6-04` Verify MIME signatures and normalize developer-supplied images.
- `M6-05` Generate responsive thumbnails and WebP/AVIF variants through build steps or queued jobs.
- `M6-06` Add secure operator workflow to review/export RSVP and wishes.
- `M6-07` Configure theme assignment and approved theme fields without a self-service editor.
- `M6-08` Implement preview, publish, and unpublish states.
- `M6-09` Record important content, guest-link, and publication operations without sensitive values.

**Exit criteria:** A developer/operator can configure, validate, preview, and publish the sample invitation through documented commands or configuration, with rollback/recovery for important content changes and no self-service dashboard dependency.

### Milestone M7 — Realtime presence and chat

**Goal:** Add social presence without compromising the invitation experience.

- `M7-01` Spike the dedicated NestJS/Fastify + Socket.IO topology, Redis adapter, load behavior, and deployment profile; amend ADR-001 if evidence requires a change.
- `M7-02` Issue anonymous signed guest-session tokens.
- `M7-03` Implement wedding-scoped room authorization.
- `M7-04` Implement heartbeat, TTL, join, leave, and reconnect behavior.
- `M7-05` Broadcast throttled player snapshots.
- `M7-06` Render remote avatars with interpolation.
- `M7-07` Implement chat and quick reactions.
- `M7-08` Implement sanitization, configurable blocked terms, rate limits, session blocking, and global chat controls.
- `M7-09` Add connection status and graceful offline behavior.
- `M7-10` Load-test representative concurrent rooms.

**Exit criteria:** Remote avatars remain smooth under representative latency; disconnected guests disappear within TTL; abusive traffic is limited; game and invitation content continue working during realtime failure.

### Milestone M8 — Local photobooth and optional event features

**Goal:** Add a privacy-minimizing local photobooth behind capabilities/feature flags.

- `M8-01` Define photobooth privacy and consent flow.
- `M8-02` Implement camera-permission request only after explicit guest action.
- `M8-03` Implement local capture, preview, and retake without server upload.
- `M8-04` Implement frame/theme composition.
- `M8-05` Implement local download and verify that captures are not persisted server-side.
- `M8-06` Add QR check-in integration if approved.
- `M8-07` Add capability checks and unsupported-device fallback.

**Exit criteria:** Media permissions are contextual; capture, frame composition, retake, and download work locally; no capture reaches the server; and denial/failure paths are usable.

### Milestone M9 — Hardening, launch, and operations

**Goal:** Meet measurable production quality thresholds.

- `M9-01` Cross-device and cross-browser matrix testing.
- `M9-02` Accessibility audit and remediation.
- `M9-03` Performance profiling on mid-range Android hardware.
- `M9-04` Security review and dependency audit.
- `M9-05` Realtime soak/load tests.
- `M9-06` Backup and restore rehearsal.
- `M9-07` CDN/cache and asset-versioning verification.
- `M9-08` Monitoring dashboards and alert thresholds.
- `M9-09` Incident, rollback, and degraded-mode runbooks.
- `M9-10` Staged beta, feedback triage, and production release.

**Exit criteria:** All launch gates in section 13 pass, rollback is rehearsed, monitoring is operational, and no unresolved severity-1 or severity-2 defects remain.

---

## 10. Recommended implementation sequence inside each feature

Use this order for every feature:

1. Define the user outcome and acceptance criteria.
2. Define or update the typed contract.
3. Add/update database migration only if durable state is required.
4. Add authorization and validation.
5. Implement domain/service behavior.
6. Implement the smallest UI path.
7. Add error, loading, empty, and disconnected states.
8. Add analytics and safe diagnostic logging.
9. Add unit/integration tests.
10. Add browser test for the critical user path.
11. Verify performance and accessibility impact.
12. Update documentation and evidence.

Do not begin with styling before the contract and success behavior are understood.

---

## 11. Testing strategy

### Backend

- Unit tests for domain rules and token validation.
- Feature tests for authorization, RSVP idempotency, publication states, and asset-import validation.
- Contract tests for invitation page props.
- Queue-job tests for media processing and cleanup.
- Realtime channel authorization tests.

### Frontend

- Unit tests for stores, event bridge, interaction selection, and movement-vector normalization.
- Component tests for dialogs, forms, validation, and focus management.
- Phaser system tests for collision definitions, input cancellation, and scene teardown.
- Snapshot/schema tests for every theme manifest.

### Browser E2E

Critical scenarios:

1. Open personalized invitation → choose avatar → enter world.
2. Move with keyboard and virtual joystick.
3. Reach every station and open its modal.
4. Reach every modal directly from navigation.
5. Submit RSVP once; retry does not duplicate it.
6. Open/close modal; game input pauses and resumes correctly.
7. Refresh/re-enter without duplicate canvas or audio.
8. Realtime reconnect and graceful failure.
9. Mobile viewport, safe-area, and orientation behavior.
10. Keyboard-only and reduced-motion flow.

### Load and reliability

- HTTP load test for invitation landing and asset delivery.
- WebSocket connection ramp test.
- Representative normal and peak room sizes for one wedding deployment.
- Chat flood and movement-event flood tests.
- Redis restart and realtime server restart recovery.
- Queue backlog and failed-image-processing recovery.

---

## 12. Quality budgets

These are initial targets; any change requires recorded evidence.

### Performance

- Invitation cover usable within 3 seconds on representative 4G after edge caching.
- Phaser must be lazy-loaded after explicit entry unless product testing proves otherwise.
- Game-ready target: ≤ 5 seconds on representative mid-range Android and 4G.
- Maintain 50–60 FPS normally; sustained FPS below 45 is a release blocker on supported devices.
- No continuous movement/network processing while the document is hidden.
- No duplicate event listeners or canvases after navigation/re-entry.
- Largest gallery images must not be loaded on initial cover.

### Accessibility

- All essential content accessible outside character movement.
- Dialog focus is trapped and restored correctly.
- Keyboard navigation and Escape behavior are deterministic.
- Text contrast meets WCAG AA where applicable.
- Touch targets target at least 44×44 CSS pixels.
- Reduced-motion preference disables optional DOM motion and reduces game effects.
- Canvas has a meaningful accessible alternative/description.

### Reliability

- RSVP writes are idempotent.
- Realtime failure cannot block invitation content.
- Asset-import and background-processing status is visible and recoverable to the developer/operator.
- Deployment supports rollback to the previous application and asset manifest.

---

## 13. Security and privacy requirements

- Use signed, revocable guest tokens; do not expose sequential guest IDs.
- Apply CSRF protection to state-changing web requests.
- Sanitize wishes/chat and render them as text by default.
- Validate MIME signature, dimensions, and size for imported media assets.
- Re-encode imported images before public delivery.
- Store secrets only in environment/secret management.
- Apply per-IP and per-session rate limits with reasonable proxy handling.
- Authorize every wedding-scoped read/write operation.
- Do not expose gift/payment details in analytics or logs.
- Minimize guest telemetry and document retention.
- Provide owner controls for chat disablement and moderation.
- Log security-relevant actions without logging tokens or message bodies unnecessarily.
- Define deletion behavior for weddings, media, guests, messages, and backups.

---

## 14. Release gates

Production release is blocked unless all items pass:

- All milestone exit criteria are documented as passed.
- No open severity-1 or severity-2 defects.
- Critical E2E suite passes in CI.
- Supported mobile and desktop browser matrix passes.
- Accessibility audit has no critical violations.
- Performance budgets pass on representative hardware/network.
- Realtime load and reconnect tests pass if realtime is enabled.
- Security review and asset-validation abuse tests pass.
- Backup restoration and deployment rollback have been rehearsed.
- Sentry release tracking and operational alerts are verified.
- Privacy, retention, moderation, and support procedures are documented.

---

## 15. Planning and change-control system

### 15.1 Task format

Every implementation task must contain:

```text
ID:
Milestone:
Status:
User outcome:
Scope:
Out of scope:
Dependencies:
Acceptance criteria:
Test evidence required:
Performance/security considerations:
Files/modules expected to change:
Risks:
```

### 15.2 Pull request requirements

Every PR must:

- Reference one or more plan task IDs.
- State which acceptance criteria it satisfies.
- Include tests or explain why no test is appropriate.
- State performance, accessibility, security, and migration impact.
- Avoid unrelated refactoring.
- Update this plan if it changes status, assumptions, or architecture.
- Include screenshots/video for visible behavior.
- Include rollback notes for migrations or infrastructure changes.

### 15.3 Change Request format

```text
CR-ID:
Requested change:
Reason and evidence:
Affected users:
Affected milestones/tasks:
Architecture/data/security impact:
Schedule impact:
Alternatives considered:
Decision:
Approver:
Date:
```

### 15.4 Architecture Decision Record format

```text
ADR-ID and title:
Status: proposed | accepted | superseded
Context:
Decision:
Alternatives:
Consequences:
Migration/rollback:
Date:
```

### 15.5 Drift-prevention rules

- Do not change frameworks because a different tool is fashionable.
- Do not introduce a new state manager, UI library, transport, or database without ADR approval.
- Do not hard-code a second theme by duplicating the first theme's components.
- Do not store mutable game state in multiple unsynchronized stores.
- Do not place networking logic inside Phaser scene classes.
- Do not postpone error/loading/empty states to an unspecified cleanup phase.
- Do not mark a task `DONE` without test evidence.
- When implementation contradicts the plan, pause and amend the plan explicitly; never allow silent divergence.

---

## 16. Risk register

The authoritative scored register, triggers, owners, mitigations, contingencies, and measurable budgets are maintained in `docs/RISK_REGISTER.md`.

Current Critical risks are:

- `R-001`: mobile texture/payload memory pressure.
- `R-003`: realtime schedule and operational complexity.
- `R-004`: Next.js server-only code or secret leakage into client bundles.
- `R-006`: personalized guest-token leakage.
- `R-015`: solo-development scope expansion.

Tasks and release evidence must reference the relevant risk IDs. A budget exception requires an owner, evidence, expiry/review date, and product/technical-owner approval; budgets must not be silently weakened.

---

## 17. Initial Definition of Done

A task is `DONE` only when:

- Acceptance criteria are demonstrably satisfied.
- Code follows architectural boundaries.
- Tests appropriate to its risk pass.
- Error/loading/empty states are addressed.
- Accessibility has been considered and verified.
- Security/privacy impact has been considered.
- No debug output, temporary asset, or secret remains.
- Documentation and task status are updated.
- CI is green.
- Reviewer can reproduce the behavior from documented steps.

---

## 18. Suggested schedule

Rough estimate for a focused small team with artwork available:

| Period | Target |
|---|---|
| Weeks 1–2 | M0–M1: product baseline and foundation |
| Weeks 3–4 | M2: invitation shell and domain model |
| Weeks 5–6 | M3: playable vertical slice |
| Weeks 7–8 | M4: production theme and interactions |
| Weeks 9–10 | M5: complete invitation content |
| Weeks 11–12 | M6: developer operations and media pipeline |
| Weeks 13–14 | M7: feature-flagged realtime presence/chat |
| Weeks 15–16 | M8–M9: local photobooth, hardening, beta |

For a solo developer, assume approximately 1.5–2.5 times this duration depending on asset production, operator tooling, and realtime requirements. Treat dates as planning estimates, not acceptance criteria.

---

## 19. Decision log

| Date | ID | Decision | Reason | Status |
|---|---|---|---|---|
| Baseline | DEC-001 | Use a hybrid React DOM + Phaser Canvas architecture | Keeps content/forms accessible while Phaser owns game behavior | Accepted |
| Baseline | DEC-002 | Use a data-driven versioned theme manifest | Prevents each wedding/theme becoming a separate application | Accepted |
| Baseline | DEC-003 | Use PostgreSQL for durable state and Redis for transient presence | Matches access and lifetime characteristics | Accepted |
| Baseline | DEC-004 | Keep direct navigation to all essential content | The game must not block invitation usability | Accepted |
| Baseline | DEC-005 | Defer final realtime transport choice until M7 spike | Presence scale and deployment constraints require measurement | Superseded by revised ADR-001 |
| 2026-09-15 | CR-001 | Use one wedding per deployment; move realtime and local photobooth into feature-flagged MVP scope; defer self-service dashboard | Matches developer-operated reusable-template product shape | Accepted |
| 2026-09-15 | ADR-001 revision | Replace proposed Laravel/Inertia foundation with a TypeScript pnpm monorepo, Next.js BFF, Drizzle, BullMQ, and a dedicated M7 Socket.IO service | Matches primary developer expertise and enables shared runtime contracts without changing Phaser performance | Accepted |
| 2026-09-16 | M0-07 baseline | Adopt the scored risk register and measurable performance budgets as task/release gates | Makes risk response and release evidence explicit before implementation | Accepted |
| 2026-09-16 | ADR-002 | Add a shared server-only infrastructure package and omit an unmaintained default MinIO container | Keeps web/worker adapters reusable without weakening server/browser boundaries | Accepted |

---

## 20. Current starting point

Milestone M0 was completed on 2026-09-16. Product scope, flows, wireframes, device support, privacy/moderation, TypeScript ADR-001, scored risks, and measurable performance budgets are approved.

Milestone M1 is active. `M1-01` through `M1-04` were completed on 2026-09-16. The repository now has a reproducible web/package skeleton, local quality gates, validated environment boundaries, production fail-fast rules, client-bundle secret checks, and tested PostgreSQL/Redis/BullMQ/S3-compatible server adapters. `M1-05` is in `VERIFY`: all CI commands and browser smoke tests pass locally, while its first GitHub-hosted run still requires an authorized commit and push. M1-06 through M1-08 remain `BACKLOG`.

The first executable proof should then be M3's vertical slice using placeholder assets. Only after movement, camera, lifecycle, collision, and React–Phaser integration are stable should production artwork and full content be integrated.

This sequence protects the project from the two most expensive failure modes: producing artwork for an unstable technical model and building realtime features before the single-player experience is reliable.
