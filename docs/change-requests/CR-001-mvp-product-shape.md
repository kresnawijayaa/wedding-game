# CR-001 — Bentuk Produk dan Scope MVP

**Status:** Accepted  
**Tanggal:** 2026-09-15  
**Approver:** Product owner  
**Task terkait:** M0-01, M0-02, M0-05

## Requested change

Mengubah baseline dari platform multi-wedding dengan dashboard menjadi fondasi reusable untuk satu wedding per project/deployment, serta mengubah komposisi MVP:

- Dashboard pengelolaan mandiri dikeluarkan dari MVP.
- Realtime presence dan chat sementara masuk target MVP melalui feature flag.
- Photobooth lokal masuk target MVP melalui feature flag.
- Informasi penting wajib memiliki fallback web biasa ketika game gagal.
- Bahasa awal dibatasi ke Indonesia dan zona waktu WIB.

## Reason and evidence

Product owner akan mengoperasikan dan menyesuaikan setiap project sebagai developer. Kebutuhan utamanya adalah menyalin fondasi yang stabil, lalu mengganti copywriting, foto, background, dan aset tema tanpa membangun platform SaaS multi-tenant.

Product owner juga menyetujui bahwa realtime dan photobooth menambah nilai pada MVP, tetapi keduanya tidak boleh menjadi penghambat akses atau single point of failure.

## Affected users

- Tamu undangan.
- Developer/operator.
- Moderator yang pada MVP dirangkap developer/operator.

## Affected milestones/tasks

- M0-01, M0-02, M0-05: definisi produk, scope, dan kebijakan diperbarui.
- M1: fondasi tetap reusable, tetapi tidak memerlukan kebutuhan multi-tenant atau dashboard.
- M2: link personal dan fallback undangan non-game tetap wajib.
- M6: dashboard ditunda di luar MVP.
- M7: realtime menjadi target MVP tetapi tetap optional at runtime.
- M8: subset photobooth lokal menjadi target MVP; upload dan storage tetap di luar MVP.
- M9: release gate harus menguji feature-on, feature-off, dan degraded states.

## Architecture/data/security impact

- Satu deployment melayani satu wedding, tetapi domain content dan theme tetap dipisahkan untuk reuse.
- Data tidak perlu mempunyai workflow tenant self-service pada MVP.
- Realtime tetap memakai Redis untuk state ephemeral dan tidak menyimpan posisi/chat ke PostgreSQL.
- Photobooth dilakukan client-side tanpa upload, mengurangi data biometrik/media yang ditangani server.
- Link personal tetap memakai token acak, bertanda tangan atau dapat diverifikasi, dan dapat dicabut.
- Fitur opsional wajib dikendalikan oleh configuration/feature flags.

## Schedule impact

- Menghapus dashboard dari MVP mengurangi pekerjaan M6.
- Realtime dan photobooth menambah pekerjaan sebelum rilis MVP.
- Scope photobooth lokal dan fallback realtime membatasi risiko tambahan tersebut.

## Alternatives considered

1. Platform multi-tenant lengkap: ditolak untuk MVP karena melebihi kebutuhan operasional.
2. Tanpa realtime dan photobooth: ditolak karena keduanya diinginkan sebagai bagian pengalaman awal.
3. Menjadikan realtime dan photobooth release blocker mutlak: ditolak karena dapat menghambat undangan utama.
4. Menyimpan foto photobooth di server: ditolak untuk MVP demi kesederhanaan dan privasi.

## Decision

Disetujui. Implementation plan diperbarui menjadi baseline baru untuk scope MVP.

## Approver

Product owner.

## Date

2026-09-15.
