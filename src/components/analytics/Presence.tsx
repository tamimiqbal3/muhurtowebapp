"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getRealtimeDb } from "@/lib/firebase/client";

/**
 * Tells Firebase Realtime Database that this visitor is on the site and which page they're on, so the
 * admin panel can show "people online now". The entry is removed automatically when the tab closes.
 * Anonymous: only a random session id, the page path and the time — nothing personal.
 */
export function Presence() {
  const path = usePathname();
  const ref = useRef<{ set: (path: string) => void } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const db = await getRealtimeDb();
        if (!db || cancelled) return;
        const { ref: dbRef, set, onDisconnect, serverTimestamp } = await import("firebase/database");
        let sid = "";
        try { sid = sessionStorage.getItem("mh.sid") ?? ""; } catch { /* ignore */ }
        if (!sid) {
          sid = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
          try { sessionStorage.setItem("mh.sid", sid); } catch { /* ignore */ }
        }
        const me = dbRef(db, `presence/${sid}`);
        await onDisconnect(me).remove();
        const mobile = window.matchMedia("(max-width: 767px)").matches;
        ref.current = { set: (p: string) => void set(me, { path: p.slice(0, 180), at: serverTimestamp(), device: mobile ? "mobile" : "desktop" }).catch(() => undefined) };
        ref.current.set(window.location.pathname);
      } catch {
        /* presence is optional */
      }
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => void start());
    else setTimeout(() => void start(), 2000);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (path && !path.startsWith("/admin")) ref.current?.set(path);
  }, [path]);

  return null;
}
