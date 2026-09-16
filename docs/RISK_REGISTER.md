# Wedding Quest Risk Register and Performance Budgets

**Status:** Accepted  
**Date:** 2026-09-16  
**Task:** M0-07  
**Owner:** Technical owner  
**Related baselines:** `PRODUCT_BRIEF.md`, `DEVICE_MATRIX.md`, `IMPLEMENTATION_PLAN.md`, and `decisions/ADR-001-foundation-stack.md`

## 1. Purpose

This document is the measurable risk and performance baseline for one-wedding-per-deployment projects created from Wedding Quest. It does not replace task-level risk analysis. Each implementation task must reference affected risks and collect evidence for the applicable budgets.

## 2. Acceptance criteria

M0-07 can be accepted when:

- Every known high-impact product, architecture, performance, privacy, and operational risk has an owner.
- Each risk has probability, impact, trigger, prevention, contingency, and review milestone.
- Web, game, media, API, worker, realtime, accessibility, and reliability budgets are measurable.
- Budgets identify the device/network profile and milestone that must produce evidence.
- Any exception requires a documented owner, reason, expiry/review date, and product/technical-owner approval.

## 3. Scoring and response rules

Probability and impact use a 1–5 scale. Score is probability × impact.

| Score | Level | Required handling |
|---:|---|---|
| 15–25 | Critical | Preventive work must be scheduled; release blocked while trigger is active without explicit risk acceptance |
| 10–14 | High | Named mitigation and milestone evidence required |
| 5–9 | Medium | Monitor at the named review point and implement contingency when triggered |
| 1–4 | Low | Track; address within normal task work |

Risk status values are `OPEN`, `MITIGATING`, `ACCEPTED`, `CLOSED`, or `REALIZED`. Product owner accepts product/scope risk; technical owner accepts technical/security risk. Critical privacy or security risk cannot be silently accepted.

## 4. Risk register

| ID | Risk | P | I | Score | Owner | Trigger / early warning | Prevention | Contingency | Review |
|---|---|---:|---:|---:|---|---|---|---|---|
| R-001 | Large art or decoded textures exhaust mobile memory | 4 | 5 | 20 Critical | Game/technical owner | Payload or decoded-memory budget fails; tab reloads; WebGL context loss | Asset manifest checks, 2048 px texture limit, atlases, lazy gallery loading | Reduce texture dimensions/variants, split preload, disable decorative layers | M3, M4, every RC |
| R-002 | Required physical P0 devices are unavailable | 3 | 4 | 12 High | Technical owner | No named device/test slot before M3 verification | Inventory owned devices and reserve hosted real-device access | Rent/borrow device or use hosted lab; do not treat emulator FPS as final evidence | Before M3 and M9 |
| R-003 | Realtime consumes disproportionate schedule or operations effort | 4 | 4 | 16 Critical | Product + realtime owner | M7 spike misses load/reconnect gate or requires unplanned infrastructure | Feature flag, dedicated service boundary, transport-neutral shared contracts | Ship presence/chat disabled while invitation and local game remain complete | M7 spike and every RC |
| R-004 | Next.js server-only code or secrets leak into client bundles | 3 | 5 | 15 Critical | Web/security owner | Bundle contains database/storage/secret modules or serialized private fields | Server-only package boundary, DTO allowlist, Zod output schemas, bundle inspection | Disable affected route, rotate exposed secret, patch and audit release | M1, M2, every RC |
| R-005 | Shared TypeScript packages create circular or cross-application coupling | 3 | 3 | 9 Medium | Technical owner | Circular dependency, app imports another app, game imports infrastructure | Enforced import boundaries and framework-neutral `packages/shared` | Extract stable contract or split package; add lint boundary regression | M1, M3, M7 |
| R-006 | Personalized guest link/token leaks | 3 | 5 | 15 Critical | Web/security owner | Token appears in logs/referrer/analytics or unauthorized use is reported | High entropy, hash at rest, revocation, referrer policy, log redaction | Revoke/rotate link, block session, review logs and affected access | M2, M9, incident |
| R-007 | Wishes/chat permit abuse, spam, or XSS | 3 | 4 | 12 High | Product + security owner | Escaped markup fails, rate alerts fire, blocked term/session repeats | Plain-text rendering, Zod length limits, rate limits, blocked terms, kill switch | Disable chat, block session, remove wish, preserve safe audit metadata | M5, M7, every RC |
| R-008 | Touch/keyboard state remains active after interruption | 3 | 4 | 12 High | Game owner | Movement continues after pointer cancel, blur, modal, or visibility change | Central input controller and mandatory cancellation tests | Force input reset on lifecycle boundary; disable game controls until recovery | M3, M5 |
| R-009 | Browser audio/camera policies break optional features | 4 | 2 | 8 Medium | Web owner | Autoplay rejection, permission denial, missing MediaDevices/download API | Explicit activation, capability detection, clear permission timing | Silent/local non-camera fallback; never block invitation | M5, M8 |
| R-010 | Mobile Safari or small viewport diverges from emulation | 3 | 4 | 12 High | Web/game owner | Physical-device clipping, safe-area, keyboard, audio, or lifecycle failure | P0 iPhone tests, safe-area CSS, visibility/page lifecycle handling | Disable game/feature selectively and expose complete non-game invitation | M3, M5, M8, M9 |
| R-011 | Wedding content or coordinates become hard-coded into reusable logic | 3 | 4 | 12 High | Technical + theme owner | Second sample requires scene/component duplication | Versioned content and theme schemas; automated manifest validation | Extract data, add migration/adapter, reject incompatible theme publish | M4, M6 |
| R-012 | Database migration or operator workflow loses durable guest data | 2 | 5 | 10 High | Data/operations owner | Destructive SQL, failed restore, or unrepeatable content update | Reviewable Drizzle SQL, backups, idempotent seed/import, staging rehearsal | Stop writes, restore backup, roll back image/migration, reconcile audit log | M1, M6, M9 |
| R-013 | BullMQ retries duplicate side effects or retain sensitive payloads | 3 | 3 | 9 Medium | Worker/security owner | Duplicate output/notification, unbounded retries, sensitive job inspection | Idempotency keys, bounded retries, minimal payloads, retention cleanup | Pause queue, deduplicate result, purge safe job data, replay selectively | M1, M6 |
| R-014 | CDN/cache serves mismatched HTML, assets, or theme manifest | 3 | 4 | 12 High | Web/operations owner | 404/chunk error or old manifest references new/removed asset | Content-hashed assets, versioned manifest, atomic promotion, cache policy tests | Roll back image/manifest pair and purge only affected cache keys | M4, M6, M9 |
| R-015 | Solo-development schedule expands beyond the reusable core | 4 | 4 | 16 Critical | Product owner | New scope lacks CR; milestone exit slips due optional feature | Task IDs, milestone gates, no self-service dashboard, feature flags | Defer optional feature/theme; protect complete invitation path first | Every milestone |
| R-016 | Recent framework majors have compatibility/regression issues | 3 | 3 | 9 Medium | Technical owner | Frozen install, typecheck, test, or production build fails | Exact baseline, lockfile, clean CI, focused update policy | Pin compatible patch/minor and amend ADR with evidence | M1 and dependency updates |
| R-017 | Retention/deletion behavior violates approved privacy policy | 2 | 5 | 10 High | Data/privacy owner | Data exceeds deadline; deletion misses storage/backup/log class | Data inventory, scheduled cleanup, retention tests, deletion runbook | Stop collection, delete reachable copies, document backup expiry and incident | M5, M6, M9 |

## 5. Performance budgets

### 5.1 Measurement policy

- P0 device and network profiles come from `DEVICE_MATRIX.md`.
- Report median and p75 for page metrics; report p95 for API/realtime latency and long-running operations.
- Use production builds with representative compressed assets and no debug instrumentation that materially changes results.
- Collect at least five cold runs for load metrics and a continuous five-minute run for FPS/memory stability.
- A single reproducible crash, context loss, data corruption, inaccessible essential flow, or sustained FPS below the blocker threshold fails the gate regardless of averages.
- Automated lab results guide iteration; physical P0 hardware is required for final FPS, memory, touch, camera, audio, and Safari evidence.

### 5.2 Invitation shell and initial route

Measured on D-AND-MID with the cached-4G profile unless stated otherwise.

| Metric | Budget | Gate |
|---|---:|---|
| Cover usable | ≤ 3.0 s | P75, cached 4G |
| Largest Contentful Paint | ≤ 2.5 s | P75 |
| Interaction to Next Paint | ≤ 200 ms | P75 |
| Cumulative Layout Shift | ≤ 0.10 | P75 |
| Initial route JavaScript, excluding Phaser/realtime/photobooth | ≤ 220 KiB compressed | Build artifact |
| Initial HTML + CSS + JS + critical fonts/images | ≤ 650 KiB transferred | Cold route |
| Critical font payload | ≤ 120 KiB compressed | Build artifact |
| Initial server response | ≤ 800 ms | P95, constrained 4G including RTT |

Phaser, gallery originals, full audio, realtime client code, and photobooth code must not enter the initial critical bundle.

### 5.3 Game load and runtime

| Metric | Budget | Gate |
|---|---:|---|
| Game ready after explicit entry | ≤ 5.0 s | P75, D-AND-MID constrained 4G |
| Initial compressed game payload | ≤ 4 MiB | Network/build artifact |
| World background | Target ≤ 500 KiB | Asset check; exception requires visual evidence |
| Individual texture dimension | ≤ 2048×2048 | Automated manifest check |
| Decoded texture memory | ≤ 80 MiB | D-AND-LOW and D-AND-MID |
| Normal gameplay | 50–60 FPS | Five-minute D-AND-MID run |
| Release blocker | Sustained < 45 FPS for > 5 s during representative play | D-AND-MID |
| Long frame | P95 frame time ≤ 25 ms | Representative play |
| Re-entry stability | No duplicate canvas/listeners; heap growth ≤ 10% after three enter/leave cycles after GC stabilization | Browser profile |
| Hidden/modal state | Zero continued movement; realtime snapshots stop or reduce to documented idle behavior | Lifecycle test |

### 5.4 Gallery, audio, and local photobooth

| Metric | Budget |
|---|---:|
| Gallery thumbnail | Target ≤ 80 KiB each at rendered mobile size |
| Mobile lightbox image | Target ≤ 500 KiB; responsive source selected |
| Concurrent gallery image fetches | ≤ 4 |
| Initial audio segment | ≤ 1 MiB and loaded only after explicit activation/need |
| Photobooth working memory | One capture plus one compositing surface; release references immediately after download/retake |
| Photobooth upload | 0 bytes to application, analytics, logs, object storage, or worker |

### 5.5 HTTP/API and database

Measured against a production-like staging build with 25 concurrent guest flows and seeded representative data.

| Metric | Budget |
|---|---:|
| Read endpoint/server action latency | P95 ≤ 500 ms server time |
| RSVP/wish mutation latency | P95 ≤ 750 ms server time |
| Application error rate | < 1% excluding intentionally rejected validation/rate limits |
| RSVP duplication | 0 duplicate active responses for repeated idempotency key |
| Database query count | No unbounded/N+1 growth with gallery, schedule, RSVP, or wishes fixture size |
| Health/readiness response | P95 ≤ 250 ms and accurately fails when required dependency is unavailable |

### 5.6 Realtime M7 gate

This deployment serves one wedding. The baseline test models one primary room, not SaaS multi-tenancy.

| Metric | Budget |
|---|---:|
| Nominal concurrent connected guests | 100 for 30 minutes |
| Burst concurrent connected guests | 200 for 10 minutes |
| Movement send rate | 8–12 snapshots/s per moving guest; idle clients do not send movement snapshots |
| End-to-end snapshot/chat delivery | P95 ≤ 500 ms under the adverse 250 ms RTT profile |
| Server event-loop delay | P95 ≤ 50 ms during nominal load |
| Unexpected disconnect/error rate | < 1% during nominal test |
| Reconnect after recoverable network loss | P95 ≤ 10 s after connectivity returns |
| Stale presence removal | 45 s target; never later than 60 s after final heartbeat |
| Database position/chat writes | 0 continuous position writes and 0 durable chat-history writes |
| Disabled/failure behavior | Invitation, RSVP, direct navigation, and local game remain usable |

If these gates fail, realtime remains disabled by feature flag. Raising concurrency targets is a deployment-specific decision backed by new evidence, not a reason to weaken this baseline.

### 5.7 BullMQ worker

| Metric | Budget |
|---|---:|
| Retry count | Maximum 3 by default with bounded exponential backoff |
| Duplicate side effects | 0 for replayed idempotency key |
| Failed-job payload | No token, message body, gift/payment value, or photobooth pixels |
| Image-processing completion | P95 ≤ 60 s for one supported source image on staging worker |
| Queue outage | Web invitation and already-processed media remain available |

### 5.8 Accessibility and resilience gates

- Zero critical or serious automated accessibility violations on critical pages.
- 100% of essential invitation information and RSVP flow usable by keyboard without Phaser.
- Dialog focus trap and focus restoration pass for every modal.
- Touch targets are at least 44×44 CSS px.
- Layout remains operable at 320×568 CSS px, 200% desktop zoom, text resize, and supported landscape probes.
- Reduced-motion behavior disables optional DOM motion and reduces nonessential game effects.
- WebGL, WebSocket, camera, audio, offline, expired-token, unpublished, empty, error, and permission-denied fallbacks are explicitly tested.

## 6. Evidence schedule

| Milestone | Required evidence |
|---|---|
| M1 | Clean frozen install; bundle boundary check; CI timing; health/readiness; dependency audit |
| M2 | Server/API latency baseline; token-redaction test; accessible non-game flow |
| M3 | Game load, payload, FPS, memory, input cancellation, teardown/re-entry |
| M4 | Asset/manifest budgets, reachability, collision, texture-memory evidence |
| M5 | Full invitation route weight, gallery/audio lazy loading, RSVP idempotency, accessibility |
| M6 | Worker idempotency/retry, image budgets, publish/rollback, backup restore |
| M7 | Nominal/burst realtime load, latency, reconnect, TTL, degraded mode, moderation |
| M8 | Camera denial/failure, local-only processing, memory release, zero-upload proof |
| M9 | Full P0 matrix, security/accessibility audit, production-like load, rollback rehearsal |

Store evidence under `docs/test-evidence/<milestone>/`. Each exception must identify the failed metric, measured value, affected device/profile, owner, mitigation, expiry, and approval.

## 7. Review cadence

- Review open Critical risks at every milestone start and exit.
- Review High risks at their named milestone and every release candidate.
- Re-measure affected budgets after asset, dependency, rendering, network-protocol, or deployment changes.
- Close a risk only with evidence that its condition no longer applies; successful mitigation alone changes it to `MITIGATING`.
- Add new risks when implementation evidence exposes them. Do not renumber existing IDs.
