"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAdmin, adminCall } from "@/components/admin/useAdmin";
import { BookingStatusBadge, MonitoringBadge, PaymentStatusBadge } from "@/components/booking/StatusBadge";
import { PriceTable } from "@/components/booking/PriceTable";
import { Button } from "@/components/ui/Button";
import { EmptyState, Notice, Skeleton } from "@/components/ui/misc";
import type { Booking, MonitoringAgent } from "@/lib/types";
import { formatBDT, formatDate, formatDateTime } from "@/lib/format";
import { getCategory } from "@/data/categories";

const STATUSES = ["", "pending_payment", "confirmed", "in_progress", "completed", "cancellation_requested", "cancelled", "rejected"];

export default function Page() {
  return <Suspense fallback={<Skeleton className="h-64" />}><AdminBookings /></Suspense>;
}

function AdminBookings() {
  const sp = useSearchParams();
  const router = useRouter();
  const status = sp.get("status") ?? "";
  const { data, error, reload } = useAdmin<{ bookings: Booking[]; agents: MonitoringAgent[] }>("bookings", status ? `status=${status}` : "");
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <select className="field h-11 w-auto py-0" value={status} onChange={(e) => router.replace(`/admin/bookings${e.target.value ? `?status=${e.target.value}` : ""}`)} aria-label="Filter by status">
          {STATUSES.map((s) => <option key={s} value={s}>{s ? s.replace(/_/g, " ") : "All statuses"}</option>)}
        </select>
        <Button variant="ghost" size="sm" onClick={() => void reload()}>Refresh</Button>
      </div>
      {error && <Notice tone="warning">{error}</Notice>}
      {!data ? <Skeleton className="h-64" /> : data.bookings.length === 0 ? <EmptyState title="No bookings" /> : (
        <ul className="space-y-3">
          {data.bookings.map((b) => (
            <li key={b.id} className="card">
              <button className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left" onClick={() => setOpen(open === b.id ? null : b.id)} aria-expanded={open === b.id}>
                <span>
                  <span className="font-semibold">{b.code}</span> <span className="text-ink-soft">· {b.contact.name} · {getCategory(b.event.categorySlug)?.name}</span>
                  <span className="block text-xs text-muted">{formatDate(b.event.date)} · {b.event.city} · created {formatDateTime(b.createdAt)}</span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <BookingStatusBadge status={b.status} />
                  <PaymentStatusBadge status={b.paymentStatus} />
                  {b.paymentStatus === "paid" && <MonitoringBadge status={b.monitoring.status} />}
                  {b.requests?.some((r) => r.status === "open") && <span className="rounded-full bg-danger px-2 py-0.5 text-[0.65rem] font-bold text-paper">Request</span>}
                  <span className="font-semibold">{formatBDT(b.pricing.total)}</span>
                </span>
              </button>
              {open === b.id && <BookingAdminPanel booking={b} agents={data.agents} onDone={reload} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BookingAdminPanel({ booking: b, agents, onDone }: { booking: Booking; agents: MonitoringAgent[]; onDone: () => void }) {
  const [agentId, setAgentId] = useState(b.monitoring.agentId ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "warning"; text: string } | null>(null);

  async function act(body: Record<string, unknown>, ok: string) {
    setBusy(true);
    setMsg(null);
    try {
      await adminCall("PATCH", `bookings/${b.id}`, body);
      setMsg({ tone: "success", text: ok });
      setNote("");
      onDone();
    } catch (e) {
      setMsg({ tone: "warning", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const active = agents.filter((a) => a.active);
  return (
    <div className="space-y-6 border-t border-line p-5">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="text-sm">
          <p className="eyebrow mb-2">Customer</p>
          <p>{b.contact.name}</p>
          <p className="text-ink-soft">{b.contact.phone} · {b.contact.email}</p>
          <p className="eyebrow mb-2 mt-4">Event</p>
          <p>{b.event.venue}, {b.event.city}</p>
          <p className="text-ink-soft">{b.event.guests} guests{b.event.theme && ` · ${b.event.theme}`}</p>
          {b.event.notes && <p className="mt-2 rounded-lg bg-sand/60 p-2 text-xs">{b.event.notes}</p>}
        </div>
        <div className="lg:col-span-2"><PriceTable lines={b.lines} pricing={b.pricing} /></div>
      </div>

      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line p-4">
          <p className="mb-3 text-sm font-semibold">Monitoring Agent</p>
          {b.paymentStatus !== "paid" ? <p className="text-sm text-muted">Available after payment is verified.</p> : (
            <div className="flex flex-wrap gap-2">
              <select className="field h-10 flex-1 py-0" value={agentId} onChange={(e) => setAgentId(e.target.value)} aria-label="Agent">
                <option value="">Select an active agent</option>
                {active.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.cities.join(", ") || "any city"} · {a.activeAssignments} active</option>)}
              </select>
              <Button size="sm" disabled={busy || !agentId || agentId === b.monitoring.agentId} onClick={() => act({ action: "assign_agent", agentId }, "Agent assigned.")}>Assign</Button>
            </div>
          )}
          {!active.length && <p className="mt-2 text-xs text-muted">No active agents. <Link href="/admin/agents" className="underline">Add one</Link>.</p>}
          {b.monitoring.agentId && <Link href={`/agent/${b.id}`} className="mt-3 inline-block text-xs font-semibold text-sindoor">Open monitoring workspace</Link>}
        </div>
        <div className="rounded-2xl border border-line p-4">
          <p className="mb-3 text-sm font-semibold">Booking actions</p>
          <textarea className="field min-h-16 text-sm" placeholder="Note / reason (shown to the customer)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="primary" disabled={busy || b.paymentStatus !== "paid"} onClick={() => act({ action: "confirm", note }, "Vendor availability confirmed.")}>Confirm vendors</Button>
            <Button size="sm" variant="danger" disabled={busy || note.trim().length < 3} onClick={() => act({ action: "reject", note }, "Booking rejected.")}>Reject</Button>
            <Button size="sm" variant="outline" disabled={busy || b.paymentStatus !== "paid"} onClick={() => act({ action: "set_status", status: "in_progress" }, "Marked in progress.")}>In progress</Button>
            <Button size="sm" variant="outline" disabled={busy || b.paymentStatus !== "paid"} onClick={() => act({ action: "set_status", status: "completed" }, "Marked completed.")}>Completed</Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => act({ action: "set_status", status: "cancelled" }, "Cancelled.")}>Cancel</Button>
            {b.paymentStatus === "refund_pending" && <Button size="sm" variant="outline" disabled={busy} onClick={() => act({ action: "mark_refunded" }, "Refund recorded.")}>Mark refunded</Button>}
          </div>
        </div>
      </div>

      {(b.requests ?? []).map((r, i) => (
        <div key={i} className="rounded-2xl border border-line p-4 text-sm">
          <p className="font-semibold capitalize">{r.type} request · {r.status}</p>
          <p className="mt-1 text-ink-soft">{r.message}</p>
          <p className="text-xs text-muted">{formatDateTime(r.createdAt)}</p>
          {r.status === "open" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" disabled={busy || note.trim().length < 3} onClick={() => act({ action: "resolve_request", index: i, approve: true, resolution: note }, "Request approved.")}>Approve (uses note)</Button>
              <Button size="sm" variant="outline" disabled={busy || note.trim().length < 3} onClick={() => act({ action: "resolve_request", index: i, approve: false, resolution: note }, "Request declined.")}>Decline (uses note)</Button>
            </div>
          ) : <p className="mt-2 text-xs">Resolution: {r.resolution}</p>}
        </div>
      ))}
    </div>
  );
}
