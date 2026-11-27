import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Noto_Sans_Bengali, Noto_Serif_Bengali, Playfair_Display, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { FirebaseAnalytics } from "@/components/analytics/FirebaseAnalytics";
import { PlanDrawer } from "@/components/plan/PlanDrawer";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SITE_URL } from "@/lib/config";
import { getLang } from "@/lib/i18n/server";
import { makeT } from "@/lib/i18n/core";

const display = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const bengali = Noto_Serif_Bengali({ subsets: ["bengali"], weight: ["400", "500", "600"], variable: "--font-bengali", display: "swap" });
const bengaliSans = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "500", "600", "700"], variable: "--font-bengali-sans", display: "swap" });
const lcd = Share_Tech_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-lcd-mono", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = makeT(await getLang());
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("MUHURTO — Where Every Celebration Begins"), template: "%s · MUHURTO" },
    description: t("Plan weddings, birthdays, corporate and family events in Dhaka. Book verified décor, food, photography and sound with clear prices for every 50 guests."),
    keywords: ["event management Bangladesh", "wedding planner Dhaka", "gaye holud decoration", "birthday decoration Dhaka", "corporate event Bangladesh", "fuchka catering", "MUHURTO", "মুহূর্ত"],
    openGraph: {
      type: "website",
      siteName: "MUHURTO",
      locale: "en_BD",
      alternateLocale: ["bn_BD"],
      title: t("MUHURTO · Where Every Celebration Begins"),
      description: t("Dhaka's event management platform — explore, plan, book and pay in one place."),
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = { themeColor: "#f4f7fc", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${display.variable} ${sans.variable} ${bengali.variable} ${bengaliSans.variable} ${lcd.variable}`}>
      <head>
        {/* Open connections to the photo and film CDNs early so the hero paints fast. */}
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="preconnect" href="https://videos.pexels.com" />
        <link rel="dns-prefetch" href="https://videos.pexels.com" />
      </head>
      <body>
        <Providers lang={lang}>
          <FirebaseAnalytics />
          <SiteChrome header={<Navbar />} footer={<Footer />} drawer={<PlanDrawer />}>
            {children}
          </SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
