# Status Proyek

Terakhir diperbarui: 2026-09-16  
Milestone aktif: M1 — Repository and delivery foundation  
Status umum: sesuai rencana

## Tujuan saat ini

Memverifikasi `M1-07`: memastikan sample wedding lokal valid, deterministik, dan siap dikonsumsi migrasi domain M2-01.

## Status task

| ID | Status | Owner | Bukti | Langkah berikutnya |
|---|---|---|---|---|
| M0-01 | DONE | Product owner | Product brief bagian 1–3 disetujui 2026-09-15 | Selesai |
| M0-02 | DONE | Product owner | Product brief bagian 4–5 dan CR-001 disetujui 2026-09-15 | Selesai |
| M0-03 | DONE | Product/design owner | User flow dan wireframe disetujui 2026-09-15 | Selesai |
| M0-04 | DONE | Product/technical owner | Device matrix dan baseline vendor disetujui 2026-09-15 | Selesai |
| M0-05 | DONE | Product/technical owner | Product brief bagian 8 disetujui 2026-09-15 | Selesai |
| M0-06 | DONE | Product/technical owner | Revisi ADR-001 TypeScript disetujui 2026-09-15 | Selesai |
| M0-07 | DONE | Product/technical owner | Risk register dan performance budgets disetujui 2026-09-16 | Selesai |
| M1-01 | DONE | Technical owner | `docs/test-evidence/M1/M1-01-foundation.md` | Selesai |
| M1-02 | DONE | Technical owner | `docs/test-evidence/M1/M1-02-quality-tooling.md` | Selesai |
| M1-03 | DONE | Technical owner | `docs/test-evidence/M1/M1-03-environment-security.md` | Selesai |
| M1-04 | DONE | Technical owner | `docs/test-evidence/M1/M1-04-infrastructure.md` | Selesai |
| M1-05 | DONE | Technical owner | `docs/test-evidence/M1/M1-05-ci.md` dan GitHub Actions run `35068068329` | Selesai |
| M1-06 | DONE | Technical owner | `docs/test-evidence/M1/M1-06-observability.md` dan GitHub Actions run `35077802462` | Selesai |
| M1-07 | VERIFY | Technical owner | `packages/config/src/wedding-seed.ts` dan focused tests | Jalankan verifikasi lokal, lalu GitHub Actions |

## Pengujian

| Tanggal | Scope | Suite | Hasil | Bukti |
|---|---|---|---|---|
| 2026-09-15 | Dokumentasi M0-01/M0-02/M0-05 | Persetujuan product owner, pemeriksaan file/status, dan review konsistensi | Lulus | Product brief, CR-001, implementation plan, dan project status |
| 2026-09-15 | M0-03 user flow dan low-fidelity wireframe | Review struktur, cakupan state, arsitektur React–Phaser, dan aksesibilitas | Lulus; disetujui product/design owner | `docs/USER_FLOWS.md` dan `docs/WIREFRAMES.md` |
| 2026-09-15 | M0-04 browser/device matrix | Verifikasi baseline vendor, viewport, capability, network, performa, dan aksesibilitas | Lulus; disetujui product/technical owner | `docs/DEVICE_MATRIX.md` |
| 2026-09-15 | M0-06 ADR fondasi TypeScript | Verifikasi versi resmi, lifecycle support, boundary arsitektur, keamanan, dan rollback | Lulus; disetujui product/technical owner | `docs/decisions/ADR-001-foundation-stack.md` |
| 2026-09-16 | M0-07 risiko dan budget | Pemeriksaan owner, skor, trigger, mitigasi, contingency, device/network gate, dan evidence schedule | Lulus; disetujui product/technical owner | `docs/RISK_REGISTER.md` |
| 2026-09-16 | M1-01 monorepo foundation | Frozen install, package boundaries, TypeScript, HTTP probe, production build, dan bundle isolation | Lulus | `docs/test-evidence/M1/M1-01-foundation.md` |
| 2026-09-16 | M1-02 quality tooling | Frozen install, boundary check, ESLint, Prettier, strict typecheck seluruh workspace sumber, pre-commit hook, dan production build | Lulus | `docs/test-evidence/M1/M1-02-quality-tooling.md` |
| 2026-09-16 | M1-03 environment security | Tujuh unit test environment, negative production build, valid production build, client-bundle canary scan, quality gate, dan frozen install | Lulus | `docs/test-evidence/M1/M1-03-environment-security.md` |
| 2026-09-16 | M1-04 server infrastructure | Frozen install, 14 unit test, Drizzle check, Compose validation, PostgreSQL/Redis health, BullMQ integration probe, production build, audit, dan client-boundary scan | Lulus | `docs/test-evidence/M1/M1-04-infrastructure.md` |
| 2026-09-16 | M1-05 CI foundation | Workflow lint, quality/unit, production build, integration probe, dan Playwright Chromium desktop/mobile | Lulus lokal dan GitHub-hosted | `docs/test-evidence/M1/M1-05-ci.md` dan GitHub Actions run `35068068329` |
| 2026-09-16 | M1-06 observability | Environment/release validation, privacy scrubber, web/server/edge/worker integration, production build, bundle budget, audit, workflow lint, dan browser smoke test | Lulus lokal dan GitHub-hosted | `docs/test-evidence/M1/M1-06-observability.md` dan GitHub Actions run `35077802462` |
| 2026-09-21 | M1-07 sample wedding seed | Validasi schema, referential integrity, determinism, ketiadaan raw guest token, boundaries, lint, formatting, dan typecheck | Lulus lokal; GitHub-hosted menunggu commit/push | `docs/test-evidence/M1/M1-07-sample-wedding-seed.md` |

## Risiko dan blocker aktif

| ID | Risiko/blocker | Dampak | Owner | Langkah berikutnya |
|---|---|---|---|---|
| R-002 | Ketersediaan perangkat fisik P0 belum diinventarisasi | Bukti performa rilis mungkin memerlukan hosted device lab | Technical owner | Catat perangkat yang tersedia sebelum M3 dan M9 |
| R-003 | Realtime masuk MVP | Risiko jadwal dan operasional | Technical owner | Pertahankan feature flag dan validasi service Socket.IO terpisah melalui spike/load test M7 |

## Keputusan terbaru

- `CR-001` diterima: single-wedding reusable template; realtime dan photobooth lokal sebagai fitur MVP yang dapat dimatikan; dashboard ditunda.
- Revisi `ADR-001`: pnpm monorepo, Next.js/React/TypeScript, Phaser 3.90, PostgreSQL/Drizzle, Redis/BullMQ, dan service NestJS/Fastify + Socket.IO terpisah pada M7.
- `ADR-001` disetujui 2026-09-15; risk register menetapkan owner, trigger, contingency, dan performance budgets terukur.
- `M0-07` disetujui 2026-09-16; Milestone M0 selesai dan M1 diaktifkan.
- `M1-01` selesai 2026-09-16; Next.js shell dan package boundaries terverifikasi.
- `M1-02` selesai 2026-09-16; quality gate terpadu dan pre-commit staged-file aktif. TypeScript 7 diperiksa oleh compiler strict native sampai parser ESLint stabil mendeklarasikan kompatibilitas.
- `M1-03` selesai 2026-09-16; public/server environment terpisah, production gagal cepat tanpa konfigurasi aman, dan bundle klien diperiksa dari kebocoran secret.
- `M1-04` selesai 2026-09-16; ADR-002 menetapkan package infrastructure server-only, PostgreSQL/Drizzle, Redis/BullMQ worker, adapter S3-compatible, dan Compose lokal terverifikasi.
- `M1-05` selesai 2026-09-16; GitHub Actions run `35068068329` meluluskan quality/unit, production build, infrastructure integration, dan browser smoke tests.
- `M1-06` selesai 2026-09-16; seluruh gate lokal dan GitHub Actions run `35077802462` lulus dengan initial JavaScript 166,6 KiB gzip dan audit runtime tanpa vulnerability yang diketahui.
- `M1-07` masuk `VERIFY` pada 2026-09-21; fixture sample wedding deterministik dan quality gate lokal telah lulus.

## Task berikutnya yang direkomendasikan

- Selesaikan verifikasi lokal M1-07, lalu jalankan GitHub Actions sebelum mengaktifkan M1-08.
