import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import IntroLoader from "@/components/shared/IntroLoader";
import "./globals.css";
import StructuredData from "@/components/shared/StructuredData";

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

/* Approved SEO metadata — verbatim from the specialist brief. Do not
   paraphrase, shorten or re-punctuate these two strings. */
export const metadata: Metadata = {
  title: "Foakh Wind Corridor Enclave | Apartments for Sale in DHA City",
  description:
    "Luxury flats & apartments for sale in DHA City Karachi. 1 to 3 bed residences, serviced apartments & duplex penthouses with private pools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">
        <StructuredData />
        <IntroLoader />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
