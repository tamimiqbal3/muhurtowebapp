"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { AuthProvider } from "./auth/AuthProvider";
import { PlanProvider } from "./plan/PlanProvider";
import { PlanDrawer } from "./plan/PlanDrawer";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { SmoothScroll } from "./motion/SmoothScroll";
import { ScrollThread } from "./motion/ScrollThread";
import { Preloader } from "./motion/Preloader";
import type { Lang } from "@/lib/i18n/core";
import type { SiteSettings } from "@/lib/site-settings";
import { SiteSettingsProvider } from "./SiteSettingsProvider";

export function Providers({ children, lang, settings }: { children: ReactNode; lang: Lang; settings: SiteSettings }) {
  return (
    <MotionConfig reducedMotion="never">
      <SiteSettingsProvider value={settings}>
      <LanguageProvider initial={lang}>
        <AuthProvider>
          <PlanProvider>
            <SmoothScroll />
            <ScrollThread />
            {children}
            <PlanDrawer />
            <Preloader />
          </PlanProvider>
        </AuthProvider>
      </LanguageProvider>
      </SiteSettingsProvider>
    </MotionConfig>
  );
}
