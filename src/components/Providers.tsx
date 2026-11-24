"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { AuthProvider } from "./auth/AuthProvider";
import { PlanProvider } from "./plan/PlanProvider";
import { PlanDrawer } from "./plan/PlanDrawer";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <PlanProvider>
          {children}
          <PlanDrawer />
        </PlanProvider>
      </AuthProvider>
    </MotionConfig>
  );
}
