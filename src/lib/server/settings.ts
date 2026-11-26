import "server-only";
import { cache } from "react";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { DEFAULT_SETTINGS, normalizeSettings, type SiteSettings } from "@/lib/site-settings";

const DOC = ["settings", "site"] as const;

/** Site settings for this request (Firestore `settings/site`, merged over defaults). */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isAdminConfigured()) return DEFAULT_SETTINGS;
  try {
    const snap = await adminDb().collection(DOC[0]).doc(DOC[1]).get();
    return snap.exists ? normalizeSettings(snap.data()) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export async function saveSiteSettings(input: unknown, updatedBy: string): Promise<SiteSettings> {
  const settings = normalizeSettings(input);
  await adminDb().collection(DOC[0]).doc(DOC[1]).set({ ...settings, updatedAt: new Date().toISOString(), updatedBy });
  return settings;
}
