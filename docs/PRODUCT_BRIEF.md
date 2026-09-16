# Product Brief — Wedding Quest

**Status:** Approved  
**Terakhir diperbarui:** 2026-09-15  
**Task terkait:** M0-01, M0-02, M0-05  
**Change Request:** `CR-001`

Disetujui oleh product owner pada 2026-09-15.

## 1. Ringkasan produk

Wedding Quest adalah undangan pernikahan web mobile-first yang menyajikan lokasi virtual 2D untuk dijelajahi tamu. Tamu dapat memilih avatar, bergerak di dunia game, mendekati station, dan membuka informasi pernikahan melalui card atau modal React.

Produk ini bukan platform multi-tenant. Setiap pernikahan menggunakan project dan deployment tersendiri. Codebase dipertahankan sebagai fondasi reusable yang dapat disalin untuk project berikutnya. Konten, foto, background, aset, copywriting, dan konfigurasi tema diganti oleh developer, sedangkan sistem gerakan, interaksi, realtime, modal, dan fitur inti digunakan kembali.

Game memperkaya pengalaman tetapi tidak menjadi satu-satunya jalan menuju informasi. Jika Phaser gagal dimuat atau perangkat tidak mendukungnya, tamu tetap dapat membuka jadwal, lokasi, RSVP, hadiah, dan informasi penting lainnya melalui UI web biasa.

## 2. Pengguna dan pengelolaan

### Tamu

- Membuka link undangan personal tanpa memasang aplikasi.
- Melihat nama yang dipersonalisasi dari identitas link.
- Memilih satu dari empat avatar preset.
- Menjelajahi lokasi, melihat tamu aktif lain, dan membuka informasi dari station.
- Membuka seluruh informasi penting langsung dari navigasi web.
- Mengirim atau memperbarui RSVP melalui link yang sama.
- Mengirim bubble chat sementara dan quick reaction jika realtime aktif.
- Menggunakan photobooth lokal jika perangkat mendukung kamera.

### Developer/operator

- Menyiapkan satu deployment untuk satu pernikahan.
- Mengubah konten, seed/configuration, aset visual, dan feature flag.
- Mengelola daftar tamu dan menerbitkan link personal.
- Mengawasi layanan, menonaktifkan chat/realtime/photobooth, dan memblokir sesi bermasalah.
- Tidak memerlukan dashboard pengelolaan mandiri pada MVP.

### Moderator

Pada MVP, developer/operator juga bertindak sebagai moderator. Moderasi dilakukan melalui filter otomatis, rate limit, feature flag, dan kemampuan server-side untuk memblokir sesi. Tidak ada dashboard moderator atau laporan pesan dari tamu pada MVP.

## 3. User journey

### 3.1 Tamu — alur utama

1. Tamu membuka link personal yang masih berlaku.
2. Cover menampilkan sapaan dan informasi pembuka.
3. Tamu memilih salah satu dari empat avatar preset tanpa harus menyatakan gender.
4. Setelah tindakan eksplisit untuk masuk, aplikasi memuat Phaser dan menawarkan kontrol musik.
5. Tamu bergerak menggunakan joystick, tombol arah, WASD, atau arrow key.
6. Tamu mendekati station dan membuka card informasi melalui prompt interaksi.
7. Tamu juga dapat membuka card yang sama dari navigasi langsung kapan saja.
8. Jika realtime tersedia, tamu melihat avatar aktif lain serta dapat mengirim bubble chat atau reaction.
9. Tamu membuka RSVP, memilih kehadiran dan jumlah orang sesuai kuota, lalu mengirim respons.
10. Tamu dapat kembali melalui link yang sama untuk memperbarui RSVP sebelum tenggat.
11. Tamu dapat membuka photobooth, memberi izin kamera setelah tindakan eksplisit, mengambil foto, memasang frame, dan mengunduh hasil secara lokal.

### 3.2 Tamu — kondisi gagal atau terbatas

1. Jika Phaser lambat atau gagal, aplikasi menampilkan status dan tindakan coba lagi.
2. Navigasi web biasa tetap tersedia tanpa menunggu Phaser.
3. Jika realtime terputus, pengalaman single-player dan seluruh informasi tetap bekerja.
4. Jika kamera ditolak atau tidak didukung, aplikasi menjelaskan keadaan dan menyediakan jalan kembali.
5. Jika link tidak valid, kedaluwarsa, dicabut, atau undangan belum diterbitkan, aplikasi menampilkan state khusus tanpa membocorkan data tamu.

### 3.3 Developer/operator

1. Developer menyalin fondasi project untuk pernikahan baru.
2. Developer mengganti configuration/seed, copywriting, foto, background, audio, dan aset tema.
3. Validator memeriksa data, manifest tema, geometri, ukuran, dan referensi aset.
4. Developer membuat data tamu dan link personal bertoken acak.
5. Developer menjalankan test, preview, dan deployment sesuai runbook.
6. Saat acara berlangsung, developer memantau kesehatan layanan dan dapat mematikan fitur opsional tanpa mematikan undangan.
7. Setelah masa retensi berakhir, data pribadi dihapus sesuai kebijakan.

### 3.4 Moderator/operator

1. Sistem menolak pesan yang tidak valid atau melanggar filter yang dikonfigurasi.
2. Rate limit membatasi spam chat, reaction, movement, dan reconnect.
3. Operator dapat mematikan chat secara global melalui feature flag.
4. Operator dapat memblokir sesi tamu tertentu dari sisi server.
5. Karena chat bersifat sementara dan tidak disimpan, tidak tersedia riwayat moderasi pesan pada MVP.

## 4. Scope MVP yang disepakati

- Satu project/deployment untuk satu pernikahan, dibangun dari fondasi reusable.
- Link personal dengan token acak, dapat dicabut, dan tidak mengekspos ID berurutan.
- Cover, sapaan personal, dan empat avatar preset: dua presentasi maskulin dan dua feminin tanpa label gender wajib.
- Satu tema explorable yang dapat diganti melalui content/configuration, manifest, dan aset.
- Gerakan empat arah, normalized diagonal speed, kamera, collision, interaction zone, dan contextual prompt.
- Card pasangan, jadwal/lokasi, galeri, RSVP/ucapan, dan hadiah.
- Navigasi langsung dan fallback non-game untuk semua informasi penting.
- Musik dengan aktivasi eksplisit dari pengguna.
- Bahasa Indonesia dan zona waktu WIB.
- Realtime presence, remote avatar, bubble chat sementara, dan quick reactions melalui feature flag.
- Photobooth lokal melalui feature flag, tanpa upload atau penyimpanan server.
- Loading, empty, error, offline, permission-denied, unsupported-device, unpublished, expired, dan revoked-link states.
- Monitoring, analytics minimum yang menjaga privasi, dan test untuk alur kritis.

## 5. Di luar scope MVP

- Platform SaaS multi-tenant atau satu deployment yang melayani banyak pasangan.
- Dashboard mandiri untuk pasangan, admin, atau moderator.
- Theme editor atau customization oleh pasangan/tamu.
- Pembayaran atau transaksi hadiah digital.
- Penyimpanan permanen chat atau posisi pemain.
- Upload, galeri bersama, atau penyimpanan server untuk hasil photobooth.
- Pelaporan pesan oleh tamu.
- Voice/video chat, gameplay kompetitif, 3D, aplikasi native, atau user-created maps.

Dashboard dapat ditambahkan kemudian tanpa mengubah pemisahan domain, data, dan tema yang sudah disiapkan.

## 6. Kontrak fitur utama

### RSVP

- Satu respons aktif per tamu.
- Pengiriman dan pembaruan bersifat idempotent.
- Respons dapat diperbarui melalui link yang sama sampai tenggat yang dikonfigurasi.
- Field MVP: kehadiran, jumlah hadir yang dibatasi kuota, dan ucapan opsional.
- Tidak meminta nomor telepon, email, alamat, atau data tambahan.

### Realtime dan chat

- Realtime ditargetkan untuk MVP tetapi tidak boleh menjadi single point of failure.
- Chat maksimal 120 karakter, dirender sebagai teks biasa, dan tampil sebagai bubble sekitar delapan detik.
- Tidak ada riwayat chat dan pesan tidak disimpan ke PostgreSQL.
- Quick reactions berasal dari daftar yang sudah ditentukan.
- Chat, reactions, movement, dan reconnect memiliki rate limit terpisah.
- Chat dan seluruh realtime dapat dimatikan dengan feature flag.

### Photobooth

- Kamera hanya diminta setelah tindakan eksplisit tamu.
- Pemrosesan frame dan hasil foto dilakukan di browser.
- Hasil dapat diunduh oleh tamu.
- Foto tidak dikirim atau disimpan di server.
- Penolakan izin, pembatalan, retake, kegagalan, dan perangkat tidak didukung memiliki state yang jelas.

### Hadiah

- Hanya menampilkan informasi rekening atau e-wallet.
- Platform tidak memproses pembayaran.
- Informasi sensitif tidak masuk analytics atau log.

## 7. Dukungan perangkat awal

- Pengalaman utama: ponsel dalam orientasi portrait.
- Chrome Android dan Safari iOS pada dua versi mayor terbaru.
- Chrome, Edge, Firefox, dan Safari desktop pada dua versi mayor terbaru.
- Landscape tetap usable, tetapi bukan tata letak utama.
- Perangkat tanpa WebGL tetap mendapat undangan web biasa.
- Perangkat tanpa dukungan kamera tetap mendapat fallback photobooth yang jelas.
- Baseline performa diuji pada Android kelas menengah.
- Target permainan normal 50–60 FPS; FPS berkelanjutan di bawah 45 pada perangkat target menjadi blocker rilis.

Versi konkret dan perangkat fisik pengujian akan dicatat dalam `docs/DEVICE_MATRIX.md` pada M0-04.

## 8. Privasi, retensi, dan moderasi

- Data tamu dan RSVP disimpan sampai 90 hari setelah acara secara default.
- Ucapan disimpan sampai 90 hari setelah acara secara default.
- Pesan chat dan posisi realtime tidak disimpan permanen.
- Foto photobooth tidak dikirim ke server.
- Log teknis disimpan maksimal 14 hari dan tidak memuat token, detail hadiah, atau isi pesan.
- Analytics anonim disimpan maksimal 90 hari.
- Retensi dapat dikonfigurasi per deployment.
- Developer dapat menghapus seluruh data pernikahan lebih awal apabila diminta.
- Semua konten tamu divalidasi, dibatasi, disanitasi, dan dirender sebagai teks secara default.
- Link tamu dapat dicabut dan sesi bermasalah dapat diblokir.

## 9. Feature flags MVP

Fitur berikut harus dapat dimatikan tanpa menghilangkan informasi undangan:

- Realtime presence.
- Bubble chat dan quick reactions.
- Photobooth.
- Background music.

## 10. Kriteria persetujuan product brief

Product brief dapat dinyatakan disetujui apabila product owner mengonfirmasi bahwa:

- Arah single-wedding reusable template sudah benar.
- Scope MVP dan non-goals sudah benar.
- User journey tamu, operator, dan moderator sudah mencerminkan pengalaman yang diinginkan.
- Fallback non-game, realtime, photobooth, RSVP, serta kebijakan privasi sudah dapat diterima.
- Tidak ada keputusan produk kritis yang masih berstatus `OPEN`.
