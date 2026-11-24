import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL } from "@/lib/config";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const bengali = Noto_Serif_Bengali({ subsets: ["bengali"], weight: ["400", "500", "600"], variable: "--font-bengali", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "MUHURTO · মুহূর্ত — Premium Event Planning in Bangladesh", template: "%s · MUHURTO" },
  description: "Plan weddings, birthdays, corporate and family events in Bangladesh. Book verified décor, food, photography and sound with transparent pricing and a dedicated Monitoring Agent.",
  keywords: ["event management Bangladesh", "wedding planner Dhaka", "gaye holud decoration", "birthday decoration Dhaka", "corporate event Bangladesh", "fuchka catering", "MUHURTO"],
  openGraph: {
    type: "website",
    siteName: "MUHURTO",
    locale: "en_BD",
    title: "MUHURTO · Every Moment Deserves to Be Extraordinary",
    description: "Bangladesh's premium event marketplace — explore, customise, book and let a Monitoring Agent handle the rest.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f7f3ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${bengali.variable}`}>
      <body>
        <Providers>
          <Navbar />
          <main id="main" className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
