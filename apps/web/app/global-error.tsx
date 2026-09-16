"use client";

import { useEffect } from "react";

import { captureClientException } from "../observability/client";

type GlobalErrorProperties = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProperties) {
  useEffect(() => {
    void captureClientException(error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <main id="main-content">
          <h1>Undangan belum dapat ditampilkan</h1>
          <p>Terjadi kendala yang tidak terduga. Silakan coba kembali.</p>
          <button type="button" onClick={reset}>
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
