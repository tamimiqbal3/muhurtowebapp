"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { AuthProvider } from "./auth/AuthProvider";
import { PlanProvider } from "./plan/PlanProvider";
import { PlanDrawer } from "./plan/PlanDrawer";
import { LanguageProvider } from "./i18n/LanguageProvider";
import { SmoothScroll } from "./motion/SmoothScroll";
import { ScrollThread } from "./motion/ScrollThread";
import type { Lang } from "@/lib/i18n/core";

export function Providers({ children, lang }: { children: ReactNode; lang: Lang }) {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider initial={lang}>
        <AuthProvider>
          <PlanProvider>
            <SmoothScroll />
            <ScrollThread />
            {children}
            <PlanDrawer />
          </PlanProvider>
        </AuthProvider>
      </LanguageProvider>
    </MotionConfig>
  );
}
