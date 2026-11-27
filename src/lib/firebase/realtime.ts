"use client";

import { getRealtimeDb } from "./client";

/**
 * Live sync through Firebase Realtime Database.
 *
 * Every open browser listens to ONE tiny value — /site/version — which the server bumps on every admin
 * change. When it changes, the page fetches the new catalogue (served from Vercel's CDN, cached per
 * version). So a change reaches every device within about a second, while each visitor downloads only a
 * few bytes from Realtime Database instead of the whole catalogue — well inside the free (Spark) plan.
 *
 * To stay under the free plan's limit of 100 simultaneous connections, a tab that has been in the
 * background for a minute disconnects, and reconnects (catching up instantly) when it's shown again.
 */
export async function subscribeVersion(onVersion: (v: number) => void, onError: (e: Error) => void): Promise<() => void> {
  const db = await getRealtimeDb();
  if (!db) throw new Error("Firebase is not configured.");
  const { ref, onValue, goOffline, goOnline } = await import("firebase/database");
  const off = onValue(
    ref(db, "site/version"),
    (snap) => { const v = snap.val(); onVersion(typeof v === "number" ? v : 0); },
    (e) => onError(e),
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  const onVis = () => {
    clearTimeout(timer);
    if (document.hidden) timer = setTimeout(() => goOffline(db), 60_000);
    else goOnline(db);
  };
  document.addEventListener("visibilitychange", onVis);
  return () => { off(); clearTimeout(timer); document.removeEventListener("visibilitychange", onVis); };
}
