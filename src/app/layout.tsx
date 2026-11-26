import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Manrope, Noto_Sans_Bengali, Noto_Serif_Bengali, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/server/settings";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL } from "@/lib/config";
import { getLang } from "@/lib/i18n/server";
import { makeT } from "@/lib/i18n/core";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const bengali = Noto_Serif_Bengali({ subsets: ["bengali"], weight: ["400", "500", "600"], variable: "--font-bengali", display: "swap" });
const bengaliSans = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "500", "600", "700"], variable: "--font-bengali-sans", display: "swap" });
const lcd = Share_Tech_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-lcd-mono", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = makeT(await getLang());
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("MUHURTO — Premium Event Planning in Bangladesh"), template: "%s · MUHURTO" },
    description: t("Plan weddings, birthdays, corporate and family events in Bangladesh. Book verified décor, food, photography and sound with transparent pricing and a dedicated Monitoring Agent."),
    keywords: ["event management Bangladesh", "wedding planner Dhaka", "gaye holud decoration", "birthday decoration Dhaka", "corporate event Bangladesh", "fuchka catering", "MUHURTO", "মুহূর্ত"],
    openGraph: {
      type: "website",
      siteName: "MUHURTO",
      locale: "en_BD",
      alternateLocale: ["bn_BD"],
      title: t("MUHURTO · Every Moment Deserves to Be Extraordinary"),
      description: t("Bangladesh's premium event marketplace — explore, customise, book and let a Monitoring Agent handle the rest."),
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = { themeColor: "#f4f7fc", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [lang, settings] = await Promise.all([getLang(), getSiteSettings()]);
  return (
    <html lang={lang} className={`${display.variable} ${sans.variable} ${bengali.variable} ${bengaliSans.variable} ${lcd.variable}`}>
      <body>
        <Providers lang={lang} settings={settings}>
          <Navbar />
          <main id="main" className="min-h-[70vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
