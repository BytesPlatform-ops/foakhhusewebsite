import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import IntroLoader from "@/components/shared/IntroLoader";
import "./globals.css";

// High-contrast editorial serif for display — graceful, tall, refined
// thin-thick strokes; cleaner and more modern than the reference. Inter
// carries body/UI.
const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Foakh Wind Corridor Enclave",
  description:
    "Foakh Wind Corridor Enclave — a 12-storey residential development in DHA City, Karachi. Two blocks, 160 apartments and eight duplex penthouses, shaped around natural airflow, renewable energy and resilient water planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">
        <IntroLoader />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
