import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { serverEnvironment } from "../environment/server";
import "./globals.css";

void serverEnvironment;

export const metadata: Metadata = {
  title: "Wedding Quest — Fondasi",
  description:
    "Fondasi reusable untuk undangan pernikahan interaktif yang hangat, ringan, dan mudah diakses.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4ead8",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
