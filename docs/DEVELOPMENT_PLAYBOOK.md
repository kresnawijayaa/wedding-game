# Panduan Development — Wedding Quest

**Fungsi dokumen:** Panduan praktis untuk Anda selama menjalankan proyek dari tahap perencanaan sampai produksi.  
**Pengguna utama:** Pemilik produk, developer, technical lead, desainer, dan reviewer.  
**Dokumen pendamping:** `docs/IMPLEMENTATION_PLAN.md` dan `AGENTS.md` di root repository.

---

## 1. Fungsi tiga dokumen proyek

### `IMPLEMENTATION_PLAN.md`

Ini adalah sumber kebenaran utama proyek untuk manusia dan AI. Isinya menjelaskan:

- Produk yang akan dibuat.
- Scope MVP, scope produksi, dan non-goals.
- Arsitektur teknis.
- Pembagian tanggung jawab React dan Phaser.
- Struktur data.
- Milestone dan task ID.
- Acceptance criteria.
- Quality budget, keamanan, dan release gate.

Anda memakai dokumen ini untuk menentukan **apa yang harus dibangun dan urutan pembangunannya**. AI juga wajib membacanya sebelum mengerjakan kode.

### `AGENTS.md`

Ini terutama merupakan aturan kerja untuk model AI/coding agent. Isinya menjaga agar AI:

- Selalu membaca implementation plan.
- Hanya mengerjakan task yang aktif.
- Tidak menambah scope sendiri.
- Tidak mengganti arsitektur tanpa ADR.
- Menjaga pemisahan React dan Phaser.
- Menjalankan pengujian sebelum menyatakan selesai.
- Memperbarui status dan bukti pekerjaan.

Anda biasanya tidak perlu membaca file ini setiap hari, tetapi file ini harus berada di root repository agar agent selalu menemukannya.

### Panduan development ini

Dokumen ini terutama untuk Anda dan tim. Isinya menjelaskan **apa yang harus dilakukan setiap hari**, cara memberikan task kepada AI, cara memeriksa hasilnya, dan kapan sebuah tahap boleh dilanjutkan.

---

## 2. Yang harus Anda lakukan sekarang

Jangan langsung membuat map final, multiplayer, atau dashboard lengkap. Selesaikan keputusan produk terlebih dahulu agar tidak terjadi pekerjaan ulang.

### Langkah 1 — Tentukan bentuk produknya

Jawab dan catat pertanyaan berikut:

1. Apakah ini platform untuk banyak pasangan atau satu undangan khusus?
2. Siapa yang membuat dan mengedit data pernikahan?
3. Apakah pasangan mengatur undangannya sendiri atau dibantu operator internal?
4. Informasi apa yang wajib tetap tersedia jika game gagal dimuat?
5. Apakah realtime presence wajib pada rilis pertama?
6. Apakah chat dapat dilihat semua tamu atau hanya muncul sebagai bubble sementara?
7. Apakah riwayat chat disimpan permanen?
8. Apakah photobooth masuk MVP atau fitur premium berikutnya?
9. Apakah hadiah digital hanya menampilkan rekening/e-wallet atau platform akan memproses pembayaran?
10. Bahasa dan zona waktu apa yang harus didukung?
11. Ponsel dan browser minimum apa yang harus didukung?
12. Seberapa jauh pasangan boleh mengubah tema?

Simpan hasilnya di `docs/PRODUCT_BRIEF.md`. Jawaban yang belum diputuskan diberi tanda `OPEN`, bukan diisi dengan asumsi tersembunyi.

### Langkah 2 — Bekukan MVP pertama

Rekomendasi isi MVP:

- Satu sistem wedding yang reusable.
- Satu tema game berkualitas produksi.
- Cover dan pemilihan avatar.
- Pergerakan, kamera, collision, dan interaction zone.
- Informasi pasangan, acara, galeri, RSVP/ucapan, dan hadiah.
- Menu bawah untuk akses langsung.
- Musik latar.
- Workflow developer berbasis configuration/seed; tanpa dashboard self-service.
- Realtime, chat, dan photobooth lokal berada di belakang feature flag dan dikerjakan setelah single-player stabil.

Jika daftar ini berubah, catat sebagai Change Request sebelum coding.

### Langkah 3 — Tentukan pemilik keputusan

Walaupun proyek dikerjakan sendiri, pisahkan peran berpikirnya:

| Jenis keputusan | Penanggung jawab |
|---|---|
| Scope dan prioritas produk | Product owner |
| UX dan penerimaan visual | Design owner |
| Arsitektur dan dependency | Technical owner |
| Privasi, retensi, dan moderasi | Product + technical owner |
| Persetujuan rilis produksi | Product + technical owner |

Satu orang boleh memegang semua peran, tetapi keputusan tetap dicatat berdasarkan kategorinya.

### Langkah 4 — Siapkan dokumentasi repository

Buat struktur berikut sebelum fitur aplikasi:

```text
AGENTS.md
README.md
docs/
├── IMPLEMENTATION_PLAN.md
├── PRODUCT_BRIEF.md
├── PROJECT_STATUS.md
├── CHANGELOG.md
├── decisions/
├── change-requests/
├── contracts/
├── runbooks/
└── test-evidence/
```

Kemudian:

1. Salin `AGENTS_WEDDING_QUEST.md` menjadi `AGENTS.md` di root repository.
2. Salin `IMPLEMENTATION_PLAN_WEDDING_QUEST.md` menjadi `docs/IMPLEMENTATION_PLAN.md`.
3. Simpan panduan ini di `docs/DEVELOPMENT_PLAYBOOK.md`.
4. Commit ketiganya sebelum membuat fitur.

### Langkah 5 — Buat project board

Gunakan kolom:

```text
BACKLOG → READY → IN PROGRESS → VERIFY → DONE
                      ↓
                   BLOCKED
```

Aturannya:

- Task masuk `READY` hanya jika dependency dan acceptance criteria sudah jelas.
- Satu developer maksimal memiliki satu task utama `IN PROGRESS`.
- Setelah coding dan self-test, pindahkan ke `VERIFY`.
- Pindahkan ke `DONE` hanya setelah ada bukti bahwa Definition of Done terpenuhi.
- Task `BLOCKED` harus menjelaskan penyebab, pemilik keputusan, dan langkah pembukanya.
- Gunakan task ID dari implementation plan, jangan membuat nama card umum yang tidak dapat dilacak.

---

## 3. Rencana tujuh hari kerja pertama

### Hari 1 — Product brief

- Jawab pertanyaan bentuk produk.
- Tetapkan MVP dan non-goals.
- Tulis user journey tamu.
- Tulis user journey pasangan/admin.
- Catat kebutuhan privasi dan moderasi.
- Perbarui status `M0-01`, `M0-02`, dan `M0-05`.

**Hasil:** `PRODUCT_BRIEF.md` yang disetujui.

### Hari 2 — User flow dan wireframe

Buat wireframe untuk:

- Cover undangan.
- Pemilihan avatar.
- Loading screen.
- Game HUD.
- Prompt tombol interaksi.
- Modal pasangan.
- Modal acara/rundown.
- Galeri dan lightbox.
- Form RSVP dan ucapan.
- Modal hadiah.
- Chat dan kondisi realtime terputus.
- Error, data kosong, masa aktif habis, belum dipublikasikan, dan perangkat tidak didukung.

**Hasil:** Flow dan wireframe `M0-03` disetujui.

### Hari 3 — Device matrix dan performance budget

Pilih perangkat nyata untuk pengujian, misalnya:

- Chrome Android pada ponsel kelas menengah.
- Safari iPhone pada versi iOS minimum yang didukung.
- Chrome, Edge, dan Firefox desktop versi aktif.
- Safari desktop jika pengguna macOS masuk target.
- Portrait sebagai pengalaman utama.
- Perilaku yang jelas saat landscape.

Tetapkan target kecepatan, FPS, ukuran aset, dan penggunaan memori.

**Hasil:** `docs/DEVICE_MATRIX.md` dan risk register awal.

### Hari 4 — Keputusan arsitektur

Buat `ADR-001` yang mencatat:

- Versi stabil Node, pnpm, Next.js, React, TypeScript, Phaser, Tailwind, Drizzle, dan alat testing.
- Versi PostgreSQL dan Redis.
- Object storage dan CDN.
- Cara menjalankan local, staging, dan production.
- Alasan memilih React DOM + Phaser Canvas.
- Konsekuensi dan cara rollback.

Jangan menetapkan transport realtime final sebelum spike test di M7, kecuali realtime resmi dimasukkan ke MVP.

**Hasil:** `docs/decisions/ADR-001-foundation-stack.md`.

### Hari 5 — Repository dan CI

- Inisialisasi repository.
- Inisialisasi pnpm monorepo, Next.js, React, TypeScript, dan package bersama.
- Pasang formatter, linter, type checking, dan static analysis.
- Buat pipeline CI minimum.
- Buat `.env.example` tanpa secret asli.
- Dokumentasikan instalasi di README.

**Hasil:** Clean checkout dapat di-install, diuji, dan dibangun ulang.

### Hari 6 — Layanan lokal dan seed data

- Konfigurasikan PostgreSQL.
- Konfigurasikan Redis dan queue worker.
- Konfigurasikan object storage development.
- Tambahkan satu wedding contoh.
- Tambahkan health/readiness endpoint.
- Pastikan log tidak membocorkan secret.

**Hasil:** Environment lokal dapat dibuat ulang secara konsisten.

### Hari 7 — Review baseline

- Jalankan seluruh pemeriksaan dari clean checkout.
- Audit exit criteria M0.
- Periksa kemajuan M1.
- Catat risiko dan blocker.
- Perbarui `PROJECT_STATUS.md`.
- Pilih task `READY` berikutnya.

Task berikutnya sebaiknya domain data wedding, bukan Phaser.

---

## 4. Urutan development utama

Ikuti urutan berikut:

```text
Product brief
→ MVP dan non-goals
→ user flow dan wireframe
→ target perangkat dan performa
→ ADR dependency/arsitektur
→ repository dan CI
→ domain wedding
→ undangan biasa tanpa game
→ vertical slice Phaser dengan aset placeholder
→ tema dan aset produksi
→ fitur undangan lengkap
→ workflow developer dan media
→ realtime presence dan chat
→ photobooth
→ hardening
→ staging
→ beta
→ production
```

Jangan melompati fondasi untuk mengejar fitur yang terlihat menarik. Perubahan urutan harus mempunyai alasan dan Change Request yang disetujui.

---

## 5. Urutan kepentingan dokumen

Jika ditemukan informasi yang bertentangan, gunakan urutan berikut:

1. Keputusan eksplisit terbaru dari product owner.
2. Change Request atau ADR yang sudah disetujui.
3. `docs/IMPLEMENTATION_PLAN.md`.
4. `docs/PRODUCT_BRIEF.md`.
5. Kontrak API/data/event di `docs/contracts/`.
6. Deskripsi task atau pull request.
7. Perilaku kode saat ini.
8. Preferensi pribadi atau asumsi.

Kode yang sudah ada tidak otomatis benar. Jika berbeda dari plan, periksa apakah kodenya salah atau plan memang perlu diperbarui secara eksplisit.

---

## 6. Proses untuk setiap task development

### Tahap A — Pilih task

Pastikan:

- Task memiliki ID dari implementation plan.
- Dependency-nya sudah `DONE`.
- Acceptance criteria dapat diperiksa secara objektif.
- Scope cukup kecil untuk satu perubahan fokus.
- Desain, data, dan kontraknya sudah tersedia.

Jika belum, rapikan task terlebih dahulu.

### Tahap B — Inspeksi

Sebelum mengubah kode:

- Baca `AGENTS.md`.
- Baca milestone aktif.
- Periksa kode dan test yang terkait.
- Periksa perubahan lokal dan jangan merusak pekerjaan yang tidak terkait.
- Identifikasi dampak keamanan, aksesibilitas, migrasi, dan performa.
- Tentukan modul yang kemungkinan berubah.

### Tahap C — Tulis catatan implementasi

Gunakan format:

```text
Task ID:
Tujuan pengguna:
Perilaku saat ini:
Perilaku yang diinginkan:
Modul yang terpengaruh:
Perubahan data/API/event:
Kondisi gagal, loading, dan kosong:
Test yang harus ditambahkan:
Risiko:
```

Jika keputusan mengubah arsitektur atau sulit dibalik, buat ADR terlebih dahulu.

### Tahap D — Implementasikan secara vertikal

Urutan yang disarankan:

```text
validasi
→ aturan domain
→ endpoint atau page props
→ UI
→ error state
→ test
→ bukti
```

Selesaikan satu hasil pengguna secara end-to-end. Hindari membuat seluruh database untuk fitur masa depan sebelum satu flow dapat digunakan.

### Tahap E — Self-review

Periksa:

- Apakah perubahan hanya mengerjakan scope task?
- Apakah muncul state ganda antara React dan Phaser?
- Apakah loading, error, empty, offline, dan cancellation sudah ditangani?
- Apakah input tamu divalidasi dan disanitasi?
- Apakah keyboard dan touch masih bekerja?
- Apakah aset dimuat secara efisien?
- Apakah log aman?
- Apakah migrasi dapat gagal di tengah deployment?

### Tahap F — Verifikasi

Jalankan sesuai risiko perubahan:

- Formatter dan linter.
- Type checking.
- Backend unit/feature test.
- Frontend unit/component test.
- Browser test untuk flow terkait.
- Critical-path E2E jika modul bersama berubah.
- Performance/load test jika menyentuh Phaser, aset, media, atau realtime.
- Visual comparison jika tampilan berubah.

Catat hasil aktual. Jangan hanya menulis “sudah dites”.

### Tahap G — Selesaikan

Perbarui:

- Status task.
- Bukti acceptance criteria.
- Implementation plan jika asumsi/status berubah.
- ADR atau Change Request jika diperlukan.
- Changelog untuk perubahan yang terlihat pengguna.
- Risiko dan follow-up.

Baru setelah itu merge dan tandai `DONE`.

---

## 7. Aturan Git dan review

### Nama branch

```text
feature/M3-05-joystick-input
fix/M5-09-modal-input-lock
chore/M1-05-ci-pipeline
spike/M7-01-realtime-transport
```

### Commit

- Buat commit kecil dan fokus.
- Sertakan task ID.
- Jangan mencampur fitur, aset, infrastruktur, dan refactor yang tidak berhubungan.
- Jangan commit secret, data tamu asli, hasil ekspor produksi, atau upload mentah.
- Jangan menulis ulang shared history tanpa koordinasi.

Contoh:

```text
M3-05 tambahkan input joystick dengan kecepatan diagonal normal
```

### Pull request

Setiap PR harus memuat:

- Task ID dan milestone.
- Tujuan pengguna.
- Acceptance criteria yang diperiksa satu per satu.
- Screenshot atau video untuk perubahan visual.
- Test yang dijalankan dan hasilnya.
- Dampak database, rollback, performa, aksesibilitas, dan keamanan.
- Scope yang sengaja tidak dikerjakan.
- Pembaruan status plan.

---

## 8. Cara memberikan pekerjaan kepada Codex

Jangan memberikan instruksi besar seperti “lanjutkan proyek”. Sebutkan milestone, task ID, dan batas scope.

### Memulai task

```text
Baca AGENTS.md dan docs/IMPLEMENTATION_PLAN.md. Task aktif adalah M3-05.
Periksa repository dan pastikan dependency serta acceptance criteria-nya.
Implementasikan hanya task tersebut, tambahkan test yang sesuai, jalankan
verifikasi, dan perbarui PROJECT_STATUS.md. Jangan memperluas scope atau
mengubah arsitektur tanpa melaporkannya.
```

### Meminta diagnosis tanpa perubahan kode

```text
Diagnosis masalah ini berdasarkan task M3-10 dan implementation plan.
Jangan mengubah kode terlebih dahulu. Berikan root cause, bukti, requirement
yang terkena dampak, dan perbaikan compliant yang paling kecil.
```

### Meminta implementasi setelah diagnosis

```text
Implementasikan perbaikan M3-10 yang sudah disetujui. Pertahankan perubahan
lain yang tidak terkait, tambahkan regression test, jalankan test target dan
test terkait, lalu perbarui bukti task. Berhenti dan laporkan jika solusi
membutuhkan perubahan scope atau arsitektur.
```

### Meminta code review

```text
Review perubahan saat ini berdasarkan AGENTS.md, task M5-09, acceptance
criteria, dan Definition of Done. Prioritaskan correctness, regression,
security, accessibility, lifecycle Phaser, dan kepemilikan state React–Phaser.
Jangan mengubah kode.
```

### Menutup milestone

```text
Audit seluruh exit criteria M4 menggunakan bukti repository dan hasil test.
Daftar semua kriteria yang belum terpenuhi. Jika semuanya lolos, perbarui
PROJECT_STATUS.md dan siapkan task READY untuk M5 tanpa mengimplementasikannya.
```

### Mengevaluasi ide baru

```text
Evaluasi ide ini sebagai kemungkinan scope change. Jangan implementasikan.
Buat draft Change Request berisi milestone yang terdampak, arsitektur,
keamanan, performa, jadwal, alternatif, dan rekomendasi.
```

Gunakan task/chat baru untuk fitur besar yang independen. Jangan mengandalkan ingatan percakapan sebagai sumber utama; semua konteks penting harus berada di repository.

---

## 9. Format status proyek

Pertahankan `docs/PROJECT_STATUS.md` dengan format:

```markdown
# Status Proyek

Terakhir diperbarui: YYYY-MM-DD
Milestone aktif: Mx — Nama
Status umum: sesuai rencana | berisiko | terhambat

## Tujuan saat ini

Satu paragraf mengenai hasil yang sedang dikerjakan.

## Status task

| ID | Status | Owner | Bukti | Langkah berikutnya |
|---|---|---|---|---|

## Pengujian

| Tanggal | Scope | Suite | Hasil | Bukti |
|---|---|---|---|---|

## Risiko dan blocker aktif

| ID | Risiko/blocker | Dampak | Owner | Langkah berikutnya |
|---|---|---|---|---|

## Keputusan terbaru

- Referensi ADR/CR.

## Task berikutnya yang direkomendasikan

- Satu task ID dan alasan task tersebut sudah READY.
```

Perbarui setelah setiap sesi development yang menghasilkan perubahan berarti.

---

## 10. Panduan setiap milestone

### M0 — Jangan coding

Ubah kebutuhan menjadi hal yang dapat diuji. Definisikan bukan hanya tampilan utama, tetapi juga loading, data kosong, kegagalan, keyboard, mobile, dan privasi.

### M1 — Utamakan reproducibility

Tujuannya adalah memastikan setiap developer dapat memasang, menguji, dan membangun aplikasi dengan hasil yang sama. Jangan bergantung pada konfigurasi lokal yang tidak terdokumentasi.

### M2 — Buat undangan berguna tanpa game

Bangun domain wedding dan akses konten biasa terlebih dahulu. Informasi penting tidak boleh bergantung pada Phaser.

### M3 — Gunakan aset placeholder

Buktikan:

- Lifecycle scene.
- Tidak ada Canvas ganda.
- Joystick dan keyboard setara.
- Kecepatan diagonal benar.
- Camera bounds.
- Collision.
- Input terkunci saat modal terbuka.
- Cleanup saat navigasi.

Jangan membuat artwork final sebelum fondasi ini stabil.

### M4 — Integrasikan tema pertama

Buat manifest tervalidasi dan asset-export pipeline. Tema adalah data yang digunakan sistem reusable, bukan salinan kode game.

### M5 — Lengkapi pengalaman tamu

Setiap konten harus dapat dibuka melalui dua jalur:

- Berjalan ke station dan berinteraksi.
- Menekan menu akses langsung.

Keduanya harus memanggil perilaku fitur yang sama.

### M6 — Buat project dapat dioperasikan developer

Sediakan workflow configuration/seed, validasi, preview, publish, export, dan recovery yang terdokumentasi. Dashboard self-service tetap di luar MVP.

### M7 — Tambahkan realtime setelah pengukuran

Urutannya:

1. Spike dan pilih transport.
2. Otorisasi room wedding.
3. Join, leave, heartbeat, dan TTL.
4. Position snapshot.
5. Interpolasi remote avatar.
6. Reconnect dan degraded mode.
7. Chat dan reaction.
8. Moderasi dan load test.

Jangan menyimpan setiap posisi pemain ke PostgreSQL.

### M8 — Perlakukan kamera sebagai data sensitif

Minta izin kamera hanya setelah tamu menekan photobooth. Sediakan kondisi ditolak, batal, retake, gagal memproses, dan download. Pastikan hasil tidak diunggah atau disimpan server-side.

### M9 — Buktikan kesiapan produksi

Uji pada perangkat nyata, pulihkan backup, latihan rollback, verifikasi alert, dan lakukan beta bertahap. Hardening harus menghasilkan bukti, bukan hanya perasaan bahwa aplikasi sudah rapi.

---

## 11. Aturan kerja React dan Phaser

### React memiliki

- Data wedding.
- Modal aktif.
- Identitas dan pilihan avatar tamu.
- RSVP dan ucapan.
- Preferensi musik tingkat produk.
- Status koneksi realtime yang ditampilkan kepada pengguna.

### Phaser memiliki

- Posisi dan velocity pemain lokal.
- Arah dan animasi pemain.
- Kamera.
- Collision body.
- Animasi NPC.
- Perhitungan interaction zone terdekat.
- Interpolasi avatar remote yang dirender.

Keduanya hanya berkomunikasi melalui typed event bridge. Event bridge tidak boleh menjadi state store ketiga.

### Checklist lifecycle

Setiap kali mounting game berubah, periksa:

- Hanya satu Phaser instance.
- Hanya satu Canvas.
- Resize listener tidak ganda.
- Listener keyboard/pointer dilepas saat teardown.
- Subscription realtime dilepas saat teardown.
- Audio dihentikan dengan benar.
- Modal tidak membuat karakter terus berjalan.
- Navigasi browser dan masuk ulang bekerja.

---

## 12. Workflow produksi aset

1. Buat source artwork pada dimensi yang disetujui.
2. Simpan file ber-layer di luar public runtime assets.
3. Ekspor world, foreground, station, NPC, dan pemain secara terpisah.
4. Gunakan origin dan skala koordinat yang konsisten.
5. Buat sprite atlas dan manifest.
6. Jalankan validasi dimensi, ukuran, alpha, dan nama.
7. Periksa pada ukuran layar mobile sebenarnya.
8. Ukur decoded texture memory, bukan hanya ukuran file terkompresi.
9. Uji loading lambat dan kegagalan satu aset.
10. Naikkan versi theme manifest jika geometry atau asset key berubah.

Setiap tema produksi harus menyimpan:

- Versi source artwork.
- Pengaturan ekspor.
- Runtime asset manifest.
- Data collider dan interaction zone.
- Screenshot referensi.
- Hasil automated smoke test.

---

## 13. Jadwal testing

### Saat mengerjakan perubahan

- Formatter, linter, dan focused unit test bila tersedia.

### Sebelum commit

- Type check.
- Test backend/frontend yang terkait.
- Verifikasi manual flow yang berubah.

### Sebelum membuka PR

- Test modul bersama yang terdampak.
- Browser test untuk user flow.
- Screenshot atau rekaman perubahan visual.
- Review migrasi dan rollback.

### Sebelum menutup milestone

- Full CI.
- Critical E2E suite.
- Pengujian device matrix yang relevan.
- Accessibility check.
- Perbandingan performa dengan baseline.
- Audit exit criteria tertulis.

### Sebelum production

- Seluruh release gate.
- Latihan backup dan restore.
- Latihan rollback.
- Load/soak test realtime jika aktif.
- Pengujian ponsel nyata.
- Pengujian error monitoring dan alert.

---

## 14. Aturan environment dan deployment

| Environment | Fungsi | Data |
|---|---|---|
| Local | Development | Seed data buatan |
| Test/CI | Pengujian otomatis | Fixture sementara |
| Staging | Kandidat rilis dan review | Data sintetis atau data uji yang disetujui |
| Production | Undangan sebenarnya | Data nyata yang dilindungi |

Aturan:

- Jangan menyalin data tamu production ke local tanpa proses resmi.
- Jangan memakai credential object storage production di local.
- Jalankan migrasi melalui pipeline deployment.
- Gunakan migrasi backward-compatible untuk sistem aktif.
- Versioning aset harus memungkinkan rollback aplikasi.
- Deploy ke staging terlebih dahulu.
- Jalankan smoke test setelah deployment.
- Gunakan feature flag untuk realtime, photobooth, dan fitur premium yang belum siap.
- Catat versi aplikasi, theme manifest, dan tanggal rilis.

---

## 15. Kapan harus berhenti dan meminta keputusan

Hentikan implementasi sementara jika:

- Acceptance criteria saling bertentangan.
- Permintaan baru memperluas MVP secara material.
- Migrasi dapat menghapus atau mengubah arti data lama.
- Layanan pihak ketiga baru akan menerima data tamu.
- Hadiah digital berubah menjadi pemrosesan transaksi.
- Realtime membutuhkan model keamanan berbeda.
- Solusi melanggar pembagian React–Phaser.
- Performance budget tidak mungkin dicapai tanpa kompromi visual/produk.
- Dimensi artwork bertentangan dengan model viewport/world.
- Deployment produksi belum memiliki rollback teruji.

Berhenti untuk mendapatkan keputusan adalah bentuk kepatuhan terhadap plan, bukan kegagalan development.

---

## 16. Rutinitas mingguan

Setiap minggu:

1. Review milestone aktif dan bukti task selesai.
2. Bandingkan kemajuan dengan exit criteria.
3. Review bug, risiko, blocker, dan technical debt.
4. Review tren bundle size dan asset budget.
5. Review keputusan keamanan dan privasi.
6. Tutup atau ubah scope task lama secara eksplisit.
7. Siapkan hanya beberapa task `READY` berikutnya.
8. Perbarui estimasi berdasarkan bukti.
9. Pastikan kode tidak diam-diam menyimpang dari plan.

Milestone boleh direncanakan panjang, tetapi task kecil cukup dirinci menjelang pengerjaan agar tidak cepat basi.

---

## 17. Review bulanan

Untuk proyek lebih dari satu bulan, periksa:

- Apakah theme system masih reusable?
- Apakah data wedding tetap terpisah dari geometry tema?
- Apakah komunikasi React–Phaser tetap typed?
- Apakah ukuran bundle/aset masih sesuai budget?
- Apakah query database dan queue job masih sehat?
- Apakah kebutuhan support/moderasi berubah?
- Apakah feature flag berubah menjadi kode setengah jadi permanen?
- Apakah temuan pengguna memerlukan Change Request?
- Apakah ADR masih berlaku?

Catat hasilnya walaupun tidak ada perubahan.

---

## 18. Indikator kesehatan proyek

### Delivery

- Task selesai dibanding rencana milestone.
- Task yang dibuka kembali setelah verifikasi.
- Usia task yang blocked.
- Scope tambahan melalui Change Request.

### Quality

- Critical E2E pass rate.
- Error rate staging/production.
- Bug terbuka berdasarkan severity.
- Accessibility violations.

### Performance

- Waktu sampai cover dapat digunakan.
- Waktu sampai game siap.
- Ukuran JavaScript dan aset awal.
- FPS dan memori mobile.
- Perilaku loading galeri.

### Realtime

- Koneksi dan room aktif.
- Reconnect rate.
- Event chat/pergerakan per detik.
- Event yang ditolak atau hilang.
- Penggunaan Redis dan server realtime.

Metrik harus menghasilkan tindakan, keputusan, atau observasi yang diterima. Jangan membuat dashboard yang tidak pernah dipakai.

---

## 19. Checklist kerja

### Sebelum setiap sesi coding

- [ ] Baca `AGENTS.md` dan bagian plan yang aktif.
- [ ] Tetapkan satu task ID.
- [ ] Baca acceptance criteria.
- [ ] Periksa dependency dan kondisi working tree.
- [ ] Tentukan risiko dan test yang diperlukan.

### Sebelum mengakhiri sesi

- [ ] Jalankan test yang relevan.
- [ ] Review scope dan batas arsitektur.
- [ ] Catat bukti dan perbarui status task.
- [ ] Catat keputusan, blocker, dan risiko.
- [ ] Tentukan task berikutnya yang direkomendasikan.

### Sebelum milestone baru

- [ ] Audit seluruh exit criteria sebelumnya.
- [ ] Dokumentasikan bug yang belum selesai.
- [ ] Pastikan desain dan kontrak tahap berikutnya siap.
- [ ] Review risiko dan estimasi.

### Sebelum production

- [ ] Semua release gate lolos.
- [ ] Backup restore teruji.
- [ ] Rollback teruji.
- [ ] Monitoring dan alert teruji.
- [ ] Prosedur privasi, moderasi, dan support tersedia.
- [ ] Product owner dan technical owner menyetujui rilis.

---

## 20. Langkah Anda berikutnya

Mulai dari `M0-01`: product brief dan user journey.

Jangan menginisialisasi Phaser atau memproduksi artwork final terlebih dahulu. Setelah product brief disetujui, lanjutkan ke wireframe, device matrix, ADR-001, kemudian repository foundation.

Urutan pendeknya:

```text
Product brief
→ MVP disetujui
→ wireframe
→ target perangkat/performa
→ ADR teknologi
→ repository dan CI
→ domain wedding
→ undangan tanpa game
→ prototype Phaser
→ tema final
→ konten lengkap
→ workflow developer dan media
→ realtime
→ photobooth
→ hardening dan rilis bertahap
```

Ikuti urutan ini kecuali Change Request yang disetujui menyatakan perubahan.
