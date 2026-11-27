"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { getAdminRealtimeDb } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

type FeedItem = { id: string; type: string; title: string; body: string; link: string; amount: number; at: number };
type Visitor = { path: string; at: number; device: string };

const ago = (t: number) => {
  const s = Math.max(1, Math.round((Date.now() - t) / 1000));
  return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.round(s / 60)}m ago` : s < 86400 ? `${Math.round(s / 3600)}h ago` : new Date(t).toLocaleDateString();
};
const taka = (n: number) => (n ? ` · ৳${Math.round(n).toLocaleString("en-IN")}` : "");

/**
 * Live admin header (Firebase Realtime Database): visitors on the site right now, and instant alerts for
 * new bookings, payments and sign-ups — on every device where the admin panel is open.
 */
export function LivePanel() {
  const [visitors, setVisitors] = useState<Visitor[] | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [toast, setToast] = useState<FeedItem | null>(null);
  const [open, setOpen] = useState<"" | "feed" | "visitors">("");
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    let offs: Array<() => void> = [];
    let cancelled = false;
    (async () => {
      try {
        const db = await getAdminRealtimeDb();
        if (!db || cancelled) return;
        const { ref, onValue, query, orderByChild, limitToLast, onChildAdded } = await import("firebase/database");
        offs.push(onValue(ref(db, "presence"), (snap) => {
          const v = (snap.val() ?? {}) as Record<string, Visitor>;
          // Ignore entries older than 6 hours (a tab that closed without saying goodbye).
          setVisitors(Object.values(v).filter((x) => typeof x.at === "number" && Date.now() - x.at < 6 * 3600_000));
        }, (e) => setError(e.message)));
        const q = query(ref(db, "adminFeed"), orderByChild("at"), limitToLast(30));
        offs.push(onChildAdded(q, (snap) => {
          const item = { id: snap.key ?? String(Math.random()), ...(snap.val() as Omit<FeedItem, "id">) };
          setFeed((f) => [item, ...f.filter((x) => x.id !== item.id)].sort((a, b) => b.at - a.at).slice(0, 30));
          if (ready.current) { setToast(item); setUnread((n) => n + 1); }
        }, (e) => setError(e.message)));
        // Events already in the feed on load aren't "new" — only alert for ones that arrive afterwards.
        setTimeout(() => { ready.current = true; }, 1500);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
    return () => { cancelled = true; offs.forEach((o) => o()); offs = []; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  if (error) return <span className="hidden text-[0.68rem] text-muted md:inline" title={error}>Live updates unavailable</span>;

  const pages = Object.entries((visitors ?? []).reduce<Record<string, number>>((m, v) => ({ ...m, [v.path]: (m[v.path] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);

  return (
    <div className="relative flex items-center gap-2">
      <button onClick={() => setOpen(open === "visitors" ? "" : "visitors")} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-semibold hover:border-ink">
        <span className={cn("h-2 w-2 rounded-full", visitors === null ? "bg-muted" : "animate-pulse bg-success")} />
        {visitors === null ? "…" : visitors.length} online
      </button>
      <button onClick={() => { setOpen(open === "feed" ? "" : "feed"); setUnread(0); }} aria-label="Live alerts" className="relative grid h-9 w-9 place-items-center rounded-full border border-line hover:border-ink">
        <Bell className="h-4 w-4" />
        {unread > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[0.6rem] font-bold text-paper">{unread}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(360px,90vw)] overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_24px_60px_-24px_rgb(8_20_48/.45)]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold">{open === "feed" ? "Live alerts" : "Visitors on the site now"}</p>
            <button onClick={() => setOpen("")} aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
          <ul className="max-h-[60vh] divide-y divide-line overflow-y-auto">
            {open === "feed" && (feed.length ? feed.map((f) => (
              <li key={f.id}>
                <Link href={f.link || "/admin"} onClick={() => setOpen("")} className="block px-4 py-3 hover:bg-sand">
                  <p className="text-sm font-semibold">{f.title}{taka(f.amount)}</p>
                  <p className="text-xs text-ink-soft">{f.body}</p>
                  <p className="mt-0.5 text-[0.65rem] text-muted">{ago(f.at)}</p>
                </Link>
              </li>
            )) : <li className="px-4 py-6 text-center text-xs text-muted">New bookings, payments and sign-ups will appear here instantly.</li>)}
            {open === "visitors" && (pages.length ? pages.map(([p, n]) => (
              <li key={p} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="truncate">{p === "/" ? "Homepage" : p}</span><span className="font-semibold">{n}</span>
              </li>
            )) : <li className="px-4 py-6 text-center text-xs text-muted">No visitors right now.</li>)}
          </ul>
        </div>
      )}

      {toast && (
        <Link href={toast.link || "/admin"} onClick={() => setToast(null)} className="fixed bottom-5 right-5 z-[60] w-[min(340px,90vw)] rounded-2xl bg-ink p-4 text-paper shadow-xl">
          <p className="text-sm font-semibold">{toast.title}{taka(toast.amount)}</p>
          <p className="text-xs text-paper/75">{toast.body}</p>
        </Link>
      )}
    </div>
  );
}
