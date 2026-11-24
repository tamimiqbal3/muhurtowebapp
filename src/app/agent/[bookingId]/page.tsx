"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import type { Booking, EventUpdate, MilestoneStatus, MonitoringAssignment, VendorProgressStatus } from "@/lib/types";
import { getCategory } from "@/data/categories";
import { formatDate, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Badge, Notice, Skeleton } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

interface Data { assignment: MonitoringAssignment; booking: Booking; updates: EventUpdate[] }
const VENDOR_STATUSES: VendorProgressStatus[] = ["pending", "confirmed", "preparing", "on_site", "completed", "issue"];

export default function AgentEvent({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<"internal" | "customer">("internal");

  const load = useCallback(async () => {
    const r = await fetch(`/api/agent/assignments/${bookingId}`, { cache: "no-store" });
    const d = await r.json();
    if (!r.ok) setError(d.error ?? "Could not load event.");
    else { setData(d); setError(null); }
  }, [bookingId]);
  useEffect(() => { void load(); }, [load]);

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/agent/assignments/${bookingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Update failed.");
      await load();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (!data) return error ? <Notice tone="warning">{error}</Notice> : <Skeleton className="h-96" />;
  const { assignment: a, booking: b } = data;
  const next = (s: MilestoneStatus): MilestoneStatus => (s === "pending" ? "in_progress" : s === "in_progress" ? "done" : "pending");

  return (
    <div className="space-y-6">
      <Link href="/agent" className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> All events</Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{getCategory(b.event.categorySlug)?.name} · {b.code}</p>
          <h1 className="mt-1 text-5xl">{formatDate(b.event.date, { weekday: "short", day: "numeric", month: "long" })}</h1>
          <p className="mt-1 text-ink-soft">{b.event.venue}, {b.event.city} · {b.event.guests} guests{b.event.theme && ` · ${b.event.theme}`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {a.status === "assigned" && <Button variant="accent" disabled={busy} onClick={() => send({ type: "accept" })}>Start monitoring</Button>}
          {b.status === "confirmed" && <Button variant="outline" disabled={busy} onClick={() => send({ type: "status", status: "in_progress" })}>Event is live</Button>}
          {(b.status === "confirmed" || b.status === "in_progress") && <Button variant="primary" disabled={busy} onClick={() => confirm("Mark this event as completed?") && send({ type: "status", status: "completed" })}>Mark completed</Button>}
        </div>
      </div>
      {error && <Notice tone="warning">{error}</Notice>}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5">
          <h2 className="text-2xl">Customer</h2>
          <p className="mt-3 font-medium">{b.contact.name}</p>
          <a href={`tel:${b.contact.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-sindoor"><Phone className="h-4 w-4" /> {b.contact.phone}</a>
          {b.event.notes && <p className="mt-3 rounded-xl bg-sand/60 p-3 text-sm">{b.event.notes}</p>}
        </section>
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-2xl">Milestones</h2>
          <p className="text-xs text-muted">Tap to cycle pending → in progress → done. Progress is shared with the customer.</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {a.milestones.map((m) => (
              <li key={m.key}>
                <button disabled={busy} onClick={() => send({ type: "milestone", key: m.key, status: next(m.status) })} className={cn("flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm transition", m.status === "done" ? "border-success/40 bg-[#e9f3ec]" : m.status === "in_progress" ? "border-warning/40 bg-[#fbf3e4]" : "border-line hover:border-ink")}>
                  <span>{m.label}</span>
                  <Badge tone={m.status === "done" ? "success" : m.status === "in_progress" ? "warning" : "neutral"}>{m.status.replace("_", " ")}</Badge>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card p-5">
        <h2 className="text-2xl">Vendor progress</h2>
        <ul className="mt-4 divide-y divide-line">
          {a.vendorProgress.map((v) => (
            <li key={v.serviceId} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div><p className="font-medium">{v.serviceName}</p><p className="text-xs text-muted">{v.vendorName}{v.updatedAt && ` · updated ${formatDateTime(v.updatedAt)}`}</p></div>
              <select className={cn("field h-10 w-auto py-0 text-sm", v.status === "issue" && "border-danger text-danger")} value={v.status} disabled={busy} onChange={(e) => send({ type: "vendor", serviceId: v.serviceId, status: e.target.value })} aria-label={`Status for ${v.serviceName}`}>
                {VENDOR_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-3 p-5">
          <h2 className="text-2xl">Notes & issues</h2>
          <textarea className="field min-h-28 text-sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write an update, an internal note, or describe a problem…" maxLength={1500} />
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-1.5"><input type="radio" checked={visibility === "internal"} onChange={() => setVisibility("internal")} /> Internal</label>
            <label className="inline-flex items-center gap-1.5"><input type="radio" checked={visibility === "customer"} onChange={() => setVisibility("customer")} /> Share with customer</label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={busy || note.trim().length < 2} onClick={async () => { if (await send({ type: "note", message: note, visibility })) setNote(""); }}>Add note</Button>
            <Button size="sm" variant="danger" disabled={busy || note.trim().length < 2} onClick={async () => { if (await send({ type: "issue", message: note })) setNote(""); }}>Report problem to admins</Button>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-2xl">Activity</h2>
          <ol className="mt-4 max-h-[420px] space-y-4 overflow-y-auto">
            {data.updates.map((u) => (
              <li key={u.id} className="text-sm">
                <p>{u.type === "issue" && <Badge tone="danger" className="mr-1">Issue</Badge>}{u.visibility === "internal" && <Badge className="mr-1">Internal</Badge>}{u.message}</p>
                <p className="text-xs text-muted">{u.authorName} · {formatDateTime(u.createdAt)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
