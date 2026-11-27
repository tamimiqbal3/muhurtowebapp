"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logPageView, startAnalytics } from "@/lib/firebase/client";
import { Presence } from "./Presence";

/** Starts Firebase Analytics after the page is idle and logs each page view. Skips the admin panel. */
export function FirebaseAnalytics() {
  const path = usePathname();
  useEffect(() => {
    if (!path || path.startsWith("/admin") || path.startsWith("/invoice")) return;
    const run = () => void startAnalytics().then(() => logPageView(path));
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(run);
    else setTimeout(run, 1500);
  }, [path]);
  // Visitor presence (Realtime Database) on public pages only.
  return path?.startsWith("/admin") || path?.startsWith("/invoice") ? null : <Presence />;
}
