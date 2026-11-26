"use client";

import { useMemo, useState } from "react";
import { Eye, FileText, Trash2 } from "lucide-react";
import { Btn, Drawer, PageHead, Pill, Table, bdt } from "@/components/admin/ui";
import { useLocalOps } from "@/components/admin/useLocal";
import { deleteLocalBooking, updateLocalBooking } from "@/lib/demo/store";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Booking, BookingStatus } from "@/lib/types";

const STATUSES: BookingStatus[] = ["pending_payment", "confirmed", "in_progress", "completed", "cancellation_requested", "cancelled", "rejected"];
const label = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const tone = (s: BookingStatus) => (s === "confirmed" || s === "completed" ? "success" : s === "pending_payment" || s === "in_progress" ? "warning" : s === "cancelled" || s === "rejected" ? "danger" : "neutral") as "success" | "warning" | "danger" | "neutral";

export default function AdminBookings() {
  const { bookings, payments, ready, reload } = useLocalOps();
  const [filter, setFilter] = useState("");
  const [q, setQ] = useState("");
  const [view, setView] = useState<Booking | null>(null);
  const list = useMemo(() => bookings.filter((b) => (!filter || b.status === filter) && (!q || `${b.code} ${b.contact.name} ${b.contact.phone} ${b.contact.email}`.toLowerCase().includes(q.toLowerCase()))), [bookings, filter, q]);
  const pay = (id: string) => payments.find((p) => p.bookingId === id && p.status === "paid");

  return (
    <>
      <PageHead title="Bookings & orders" subtitle={`${bookings.length} bookings on this device`} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <select className="field" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>
        <input className="field" placeholder="Search code, name, phone or email" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Table head={["Booking", "Customer", "Event", "Total", "Status", ""]} empty={ready ? "No bookings yet." : "Loading…"}>
        {list.map((b) => (
          <tr key={b.id}>
            <td className="px-4 py-3"><p className="font-semibold">{b.code}</p><p className="text-xs text-muted">{formatDate(b.createdAt)}</p></td>
            <td className="px-4 py-3"><p>{b.contact.name}</p><p className="text-xs text-muted">{b.contact.phone}</p></td>
            <td className="px-4 py-3 text-xs">{formatDate(b.event.date)} · {b.event.guests} guests<br /><span className="text-muted">{b.event.venue}, {b.event.city}</span></td>
            <td className="px-4 py-3 font-semibold whitespace-nowrap">{bdt(b.pricing.total)}<br />{b.paymentStatus === "paid" ? <Pill tone="success">Paid</Pill> : <Pill tone="warning">Unpaid</Pill>}</td>
            <td className="px-4 py-3">
              <select className="field !py-1.5 text-xs" value={b.status} onChange={(e) => { updateLocalBooking(b.id, { status: e.target.value as BookingStatus }); reload(); }}>
                {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
              </select>
            </td>
            <td className="px-4 py-3"><div className="flex justify-end gap-1">
              <Btn variant="ghost" onClick={() => setView(b)}><Eye className="h-4 w-4" /></Btn>
              {pay(b.id) && <a href={`/invoice/${b.id}`} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center rounded-full px-3 text-ink-soft hover:bg-sand" aria-label="Invoice"><FileText className="h-4 w-4" /></a>}
              <Btn variant="ghost" className="text-danger" onClick={() => { if (confirm(`Delete booking ${b.code}?`)) { deleteLocalBooking(b.id); reload(); } }}><Trash2 className="h-4 w-4" /></Btn>
            </div></td>
          </tr>
        ))}
      </Table>
      <Drawer title={view ? `Booking ${view.code}` : ""} open={!!view} onClose={() => setView(null)}>
        {view && (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2"><Pill tone={tone(view.status)}>{label(view.status)}</Pill>{view.paymentStatus === "paid" ? <Pill tone="success">Paid {view.paidAt && formatDateTime(view.paidAt)}</Pill> : <Pill tone="warning">Unpaid</Pill>}</div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div><dt className="text-xs text-muted">Customer</dt><dd>{view.contact.name}<br />{view.contact.phone}<br />{view.contact.email}</dd></div>
              <div><dt className="text-xs text-muted">Event</dt><dd>{formatDate(view.event.date)} · {view.event.guests} guests<br />{view.event.venue}, {view.event.city}</dd></div>
              {view.event.notes && <div className="sm:col-span-2"><dt className="text-xs text-muted">Notes</dt><dd>{view.event.notes}</dd></div>}
            </dl>
            <ul className="divide-y divide-line rounded-xl border border-line">
              {view.lines.map((l) => <li key={l.serviceId} className="flex justify-between gap-3 p-3"><span>{l.serviceName}<span className="block text-xs text-muted">{l.quantity} guests{l.optionLabels.length ? ` · ${l.optionLabels.join(", ")}` : ""}</span></span><span className="font-medium">{bdt(l.lineTotal)}</span></li>)}
            </ul>
            <dl className="space-y-1">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{bdt(view.pricing.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Platform fee</dt><dd>{bdt(view.pricing.platformFee)}</dd></div>
              <div className="flex justify-between font-semibold"><dt>Total</dt><dd>{bdt(view.pricing.total)}</dd></div>
            </dl>
            {pay(view.id) && <p className="text-xs text-muted">Transaction {pay(view.id)!.id} · {pay(view.id)!.method || pay(view.id)!.cardType} · Invoice {pay(view.id)!.invoiceNo}</p>}
          </div>
        )}
      </Drawer>
    </>
  );
}
