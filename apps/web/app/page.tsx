import { foundationStatusSchema } from "@wedding-quest/shared";

const foundation = foundationStatusSchema.parse({
  milestone: "M1",
  task: "M1-01",
  state: "verified",
});

const foundations = [
  {
    label: "Undangan dahulu",
    detail: "Informasi penting tetap hadir meski dunia permainan belum dimuat.",
  },
  {
    label: "Satu bahasa",
    detail: "Kontrak web, game, data, dan realtime tumbuh bersama dalam TypeScript.",
  },
  {
    label: "Ringan sejak awal",
    detail: "Phaser, galeri, dan fitur sosial menunggu sampai tamu membutuhkannya.",
  },
];

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Lewati ke isi utama
      </a>

      <main className="foundation-page" id="main-content">
        <div className="garden-frame" aria-hidden="true">
          <span className="leaf leaf-one" />
          <span className="leaf leaf-two" />
          <span className="sun-disc" />
        </div>

        <header className="site-header" aria-label="Identitas proyek">
          <a className="wordmark" href="#main-content" aria-label="Wedding Quest, kembali ke awal">
            <span className="wordmark-mark" aria-hidden="true">
              WQ
            </span>
            <span>Wedding Quest</span>
          </a>
          <p className="stage-pill">
            <span aria-hidden="true" />
            Fondasi {foundation.task}
          </p>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Taman Senja Nusantara</p>
            <h1 id="hero-title">
              Sebuah awal untuk
              <em> kisah yang bisa dijelajahi.</em>
            </h1>
            <p className="hero-lead">
              Kerangka teknis sedang dirapikan agar setiap undangan berikutnya cukup mengganti
              cerita, gambar, dan suasana—tanpa membangun pengalaman dari nol.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#foundation">
                Lihat fondasi
                <span aria-hidden="true">↓</span>
              </a>
              <p>Belum ada data tamu atau aset pernikahan yang dimuat.</p>
            </div>
          </div>

          <div
            className="garden-illustration"
            role="img"
            aria-label="Ilustrasi gerbang taman saat senja"
          >
            <span className="arch arch-back" />
            <span className="arch arch-front" />
            <span className="path" />
            <span className="lantern lantern-left" />
            <span className="lantern lantern-right" />
            <span className="flower flower-one" />
            <span className="flower flower-two" />
            <span className="flower flower-three" />
            <span className="illustration-caption">Gerbang pertama</span>
          </div>
        </section>

        <section className="foundation" id="foundation" aria-labelledby="foundation-title">
          <div className="section-heading">
            <p className="eyebrow">Prinsip fondasi</p>
            <h2 id="foundation-title">Ruang yang tenang untuk pengalaman yang kaya.</h2>
          </div>

          <ol className="foundation-list">
            {foundations.map((item, index) => (
              <li key={item.label}>
                <span className="foundation-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="site-footer">
          <p>Milestone {foundation.milestone}</p>
          <p>Arsitektur siap tumbuh, fitur belum dibuka.</p>
        </footer>
      </main>
    </>
  );
}
