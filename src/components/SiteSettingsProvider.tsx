"use client";

import type { ReactNode } from "react";
import { useCatalog } from "@/lib/store/catalog";
import type { SiteSettings } from "@/lib/site-settings";

/** Kept for compatibility; settings now come from the local data store. */
export function SiteSettingsProvider({ children }: { value?: SiteSettings; children: ReactNode }) {
  return <>{children}</>;
}

export const useSiteSettings = (): SiteSettings => useCatalog().settings;
