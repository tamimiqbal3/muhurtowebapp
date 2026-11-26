"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/site-settings";

const Ctx = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SiteSettingsProvider({ value, children }: { value: SiteSettings; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSiteSettings = () => useContext(Ctx);
