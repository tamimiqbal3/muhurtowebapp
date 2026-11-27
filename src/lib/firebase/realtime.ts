"use client";

import { getFirebaseApp } from "./client";

/**
 * Live subscription to the website's catalogue and content in Firestore. Every browser keeps these
 * listeners open, so an admin change appears on every device within about a second — no refresh.
 *
 * Calls `onData(null)` while Firestore has no published catalogue yet (the built-in one is shown).
 */
export type LiveSite = {
  categories: unknown[]; services: unknown[]; vendors: unknown[]; locations: unknown[]; reviews: unknown[];
  settings: unknown; updatedAt: string | null;
};

const COLS = ["categories", "services", "vendors", "locations", "reviews"] as const;

export async function subscribeSite(onData: (d: LiveSite | null) => void, onError: (e: Error) => void): Promise<() => void> {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured.");
  const { getFirestore, collection, doc, onSnapshot } = await import("firebase/firestore");
  const db = getFirestore(app);
  const parts: Partial<Record<(typeof COLS)[number] | "settings" | "meta", unknown>> = {};
  const unsubs: Array<() => void> = [];
  const strip = (o: Record<string, unknown>) => { const { _order, ...rest } = o; void _order; return rest; };

  const emit = () => {
    if (!("meta" in parts) || !("settings" in parts) || COLS.some((c) => !(c in parts))) return; // wait for the first full picture
    const meta = parts.meta as { updatedAt?: string } | null;
    if (!meta) return onData(null);
    onData({
      categories: parts.categories as unknown[], services: parts.services as unknown[], vendors: parts.vendors as unknown[],
      locations: parts.locations as unknown[], reviews: parts.reviews as unknown[], settings: parts.settings ?? {}, updatedAt: meta.updatedAt ?? null,
    });
  };
  const fail = (e: Error) => onError(e);

  for (const c of COLS) {
    unsubs.push(onSnapshot(collection(db, c), (snap) => {
      parts[c] = snap.docs
        .map((d) => d.data() as Record<string, unknown>)
        .sort((a, b) => Number(a._order ?? 0) - Number(b._order ?? 0))
        .map(strip);
      emit();
    }, fail));
  }
  unsubs.push(onSnapshot(doc(db, "site", "settings"), (snap) => { parts.settings = snap.exists() ? snap.data() : {}; emit(); }, fail));
  unsubs.push(onSnapshot(doc(db, "site", "meta"), (snap) => { parts.meta = snap.exists() ? snap.data() : null; emit(); }, fail));
  return () => unsubs.forEach((u) => u());
}
