"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { adminCall, useAdmin } from "@/components/admin/useAdmin";
import { PriceTable } from "@/components/booking/PriceTable";
import { Button } from "@/components/ui/Button";
import { Badge, EmptyState, Notice, Skeleton } from "@/components/ui/misc";
import type { CustomizationRequest, Service, Vendor } from "@/lib/types";
import { getCategory } from "@/data/categories";
import { formatBDT, formatDate, formatDateTime, titleCase } from "@/lib/format";
import { computeBreakdown } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface Data { requests: CustomizationRequest[]; services: Service[]; vendors: Vendor[] }

export default function AdminCustomizations() {
  const { data, error, reload } = useAdmin<Data>("customizations");
  const [open, setOpen] = useState<string | null>(null);
  if (error) return <Notice tone="warning">{error}</Notice>;
  if (!data) return <Skeleton className="h-64" />;
  if (!data.requests.length) return <EmptyState title="No customisation requests yet" />;
  return (
    <ul className="space-y-3">
      {data.requests.map((r) => (
        <li key={r.id} className="card">
          <button className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
            <span>
              <span className="font-semibold">{r.contact.name}</span> <span className="text-ink-soft">· {getCategory(r.event.categorySlug)?.name} · {formatDate(r.event.date)} · {r.event.city} · {r.event.guests} guests</span>
              <span className="block text-xs text-muted">Received {formatDateTime(r.createdAt)} · estimate {formatBDT(r.estimate.total)}</span>
            </span>
            <Badge tone={["submitted", "changes_requested"].includes(r.status) ? "warning" : r.status === "responded" ? "success" : "neutral"}>{titleCase(r.status)}</Badge>
          </button>
          {open === r.id && <Responder r={r} services={data.services} onDone={reload} />}
        </li>
      ))}
    </ul>
  );
}

interface Line { serviceId: string; quantity: number; unitPrice: string; optionIds: string[] }

function Responder({ r, services, onDone }: { r: CustomizationRequest; services: Service[]; onDone: () => void }) {
  const base = r.revisedPlan?.lines ?? r.lines;
  const [lines, setLines] = useState<Line[]>(base.map((l) => ({ serviceId: l.serviceId, quantity: l.quantity, unitPrice: String(l.unitPrice), optionIds: l.optionIds })));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "warning"; text: string } | null>(null);
  const [add, setAdd] = useState("");
  const svc = (id: string) => services.find((s) => s.id === id);
  const subtotal = lines.reduce((s, l) => s + (Number(l.unitPrice) || 0) * l.quantity, 0);
  const est = computeBreakdown(subtotal);

  async function act(body: Record<string, unknown>, ok: string) {
    setBusy(true);
    setMsg(null);
    try {
      await adminCall("PATCH", `customizations/${r.id}`, body);
      setMsg({ tone: "success", text: ok });
      setMessage("");
      onDone();
    } catch (e) {
      setMsg({ tone: "warning", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 border-t border-line p-5">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-2">Customer&apos;s plan</p>
          <PriceTable lines={r.lines} pricing={r.estimate} />
          {r.specialInstructions && <p className="mt-3 rounded-xl bg-sand/60 p-3 text-sm">{r.specialInstructions}</p>}
          <p className="mt-3 text-xs text-muted">{r.contact.email} · {r.contact.phone || "no phone"} · venue: {r.event.venue} · theme: {r.event.theme || "—"}</p>
        </div>
        <div>
          <p className="eyebrow mb-2">Conversation</p>
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {r.messages.map((m, i) => (
              <li key={i} className={cn("max-w-[90%] rounded-2xl px-3 py-2 text-sm", m.from === "admin" ? "ml-auto bg-ink text-paper" : "bg-sand")}>{m.text}<span className="block text-[0.65rem] opacity-60">{m.from} · {formatDateTime(m.at)}</span></li>
            ))}
            {!r.messages.length && <li className="text-sm text-muted">No messages.</li>}
          </ul>
        </div>
      </div>

      <div>
        <p className="eyebrow mb-3">Revised plan</p>
        <div className="space-y-2">
          {lines.map((l, i) => {
            const s = svc(l.serviceId);
            return (
              <div key={l.serviceId} className="grid items-center gap-2 rounded-xl border border-line p-3 text-sm md:grid-cols-[1fr_110px_140px_auto]">
                <div>
                  <p className="font-medium">{s?.name ?? l.serviceId}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s?.options.map((o) => {
                      const on = l.optionIds.includes(o.id);
                      return <button key={o.id} type="button" onClick={() => setLines(lines.map((x, j) => (j === i ? { ...x, optionIds: on ? x.optionIds.filter((y) => y !== o.id) : [...x.optionIds, o.id] } : x)))} className={cn("rounded-full border px-2 py-0.5 text-[0.65rem]", on ? "border-ink bg-ink text-paper" : "border-line")}>{o.label}</button>;
                    })}
                  </div>
                </div>
                <label className="text-xs">Qty<input className="field h-9 py-0" inputMode="numeric" value={l.quantity} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value.replace(/\D/g, "")) || 1 } : x)))} /></label>
                <label className="text-xs">Unit price ৳<input className="field h-9 py-0" inputMode="numeric" value={l.unitPrice} onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, unitPrice: e.target.value.replace(/\D/g, "") } : x)))} /></label>
                <button type="button" aria-label="Remove line" className="justify-self-end p-2 text-danger" onClick={() => setLines(lines.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="field h-10 flex-1 py-0" value={add} onChange={(e) => setAdd(e.target.value)} aria-label="Add service">
            <option value="">Add a service…</option>
            {services.filter((s) => !lines.some((l) => l.serviceId === s.id)).map((s) => <option key={s.id} value={s.id}>{getCategory(s.categorySlug)?.name} · {s.name} ({formatBDT(s.startingPrice)}/{s.unit})</option>)}
          </select>
          <Button size="sm" variant="outline" disabled={!add} onClick={() => { const s = svc(add)!; setLines([...lines, { serviceId: s.id, quantity: s.minQuantity, unitPrice: String(s.startingPrice), optionIds: [] }]); setAdd(""); }}><Plus className="h-4 w-4" /> Add</Button>
        </div>
        <p className="mt-3 text-sm">Subtotal {formatBDT(est.subtotal)} · fee {formatBDT(est.platformFee)} · <strong>total {formatBDT(est.total)}</strong></p>
        <p className="text-xs text-muted">Unit prices default to the catalogue price (including selected options). Override only for negotiated quotes; the server recalculates totals.</p>
      </div>

      <textarea className="field min-h-20 text-sm" placeholder="Message to the customer" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} />
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <div className="flex flex-wrap gap-2">
        <Button variant="accent" size="sm" disabled={busy || !lines.length} onClick={() => act({ action: "respond", message, lines: lines.map((l) => ({ ...l, unitPrice: l.unitPrice === "" ? null : Number(l.unitPrice) })) }, "Updated plan sent to the customer.")}>Send updated plan</Button>
        <Button variant="outline" size="sm" disabled={busy || message.trim().length < 2} onClick={() => act({ action: "message", text: message }, "Message sent.")}>Send message only</Button>
        {r.status === "submitted" && <Button variant="ghost" size="sm" disabled={busy} onClick={() => act({ action: "in_review" }, "Marked in review.")}>Mark in review</Button>}
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => act({ action: "close" }, "Request closed.")}>Close</Button>
      </div>
    </div>
  );
}
