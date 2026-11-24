"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, MessageSquareHeart, LifeBuoy, Receipt, CalendarClock } from "lucide-react";
import type { AppNotification, CustomizationRequest } from "@/lib/types";
import { getCategory } from "@/data/categories";
import { formatBDT, formatDate, formatDateTime, titleCase } from "@/lib/format";
import { useMyBookings } from "../booking/BookingsList";
import { MonitoringBadge } from "../booking/StatusBadge";
import { PriceTable } from "../booking/PriceTable";
import { StatCard } from "./Shell";
import { Badge, EmptyState, Notice, Skeleton } from "../ui/misc";
import { Button, ButtonLink } from "../ui/Button";
import { ContactForm } from "../ContactForm";
import { cn } from "@/lib/utils";

export function Overview() {
  const { bookings, error } = useMyBookings();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (bookings ?? []).filter((b) => b.event.date >= today && !["cancelled", "rejected", "completed"].includes(b.status)).sort((a, b) => a.event.date.localeCompare(b.event.date));
  const paid = (bookings ?? []).filter((b) => b.paymentStatus === "paid");

  return (
    <div className="space-y-10">
      {error && <Notice tone="warning">{error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Upcoming events" value={bookings ? upcoming.length : "—"} />
        <StatCard label="Total bookings" value={bookings ? bookings.length : "—"} />
        <StatCard label="Paid to date" value={bookings ? formatBDT(paid.reduce((s, b) => s + b.pricing.total, 0)) : "—"} hint="Including platform fees" />
        <StatCard label="Monitored events" value={bookings ? paid.filter((b) => b.monitoring.status === "assigned" || b.monitoring.status === "active").length : "—"} />
      </div>

      <section aria-labelledby="upcoming">
        <h2 id="upcoming" className="mb-4 inline-flex items-center gap-2 text-3xl"><CalendarClock className="h-6 w-6 text-gold" /> Upcoming events & monitoring</h2>
        {!bookings ? <Skeleton className="h-28" /> : upcoming.length === 0 ? (
          <EmptyState title="No upcoming events" body="Plan something wonderful — your events and their monitoring status will appear here." action={<ButtonLink href="/event-planner" variant="accent">Plan an event</ButtonLink>} />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {upcoming.slice(0, 4).map((b) => (
              <li key={b.id}>
                <Link href={`/booking/${b.id}`} className="card block p-5 transition hover:shadow-[var(--shadow-lift)]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{getCategory(b.event.categorySlug)?.name}</p>
                    <span className="text-xs text-muted">{b.code}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{formatDate(b.event.date)} · {b.event.city}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {b.paymentStatus === "paid" ? <MonitoringBadge status={b.monitoring.status} /> : <Badge tone="warning">Awaiting payment</Badge>}
                    {b.monitoring.agentName && <span className="text-xs text-ink-soft">Agent: {b.monitoring.agentName}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CustomizationRequests />

      <section aria-labelledby="payments">
        <h2 id="payments" className="mb-4 inline-flex items-center gap-2 text-3xl"><Receipt className="h-6 w-6 text-gold" /> Payment history</h2>
        {!bookings ? <Skeleton className="h-20" /> : paid.length === 0 ? <p className="text-sm text-ink-soft">No completed payments yet.</p> : (
          <div className="card overflow-x-auto p-2">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="p-3 font-medium">Booking</th><th className="p-3 font-medium">Paid on</th><th className="p-3 text-right font-medium">Services</th><th className="p-3 text-right font-medium">Fee (2%)</th><th className="p-3 text-right font-medium">Total</th></tr></thead>
              <tbody>
                {paid.map((b) => (
                  <tr key={b.id} className="border-t border-line">
                    <td className="p-3"><Link href={`/booking/${b.id}`} className="font-medium hover:text-sindoor">{b.code}</Link></td>
                    <td className="p-3">{formatDate(b.paidAt)}</td>
                    <td className="p-3 text-right">{formatBDT(b.pricing.subtotal)}</td>
                    <td className="p-3 text-right">{formatBDT(b.pricing.platformFee)}</td>
                    <td className="p-3 text-right font-semibold">{formatBDT(b.pricing.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Notifications />

      <section aria-labelledby="support" className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 id="support" className="inline-flex items-center gap-2 text-3xl"><LifeBuoy className="h-6 w-6 text-gold" /> Support</h2>
          <p className="mt-2 text-sm text-ink-soft">Questions about a booking, a vendor or a payment? Send us a message and our support team will reply by email or phone.</p>
        </div>
        <div className="card p-6"><ContactForm compact /></div>
      </section>
    </div>
  );
}

function CustomizationRequests() {
  const router = useRouter();
  const [items, setItems] = useState<CustomizationRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch("/api/customization-requests", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setItems(d.requests);
      })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  async function act(id: string, action: "accept" | "request_changes" | "message" | "close") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/customization-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, text }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Action failed.");
      setText("");
      if (action === "accept" && d.bookingId) router.push(`/checkout?booking=${d.bookingId}`);
      else load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  const tone = (s: CustomizationRequest["status"]) => (s === "responded" ? "success" : s === "accepted" ? "ink" : s === "closed" ? "neutral" : "warning") as "success" | "ink" | "neutral" | "warning";

  return (
    <section id="customizations" aria-labelledby="custom-h" className="scroll-mt-28">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="custom-h" className="inline-flex items-center gap-2 text-3xl"><MessageSquareHeart className="h-6 w-6 text-gold" /> Customisation requests</h2>
        <ButtonLink href="/customize" variant="outline" size="sm">New request</ButtonLink>
      </div>
      {error && <Notice tone="warning" className="mb-3">{error}</Notice>}
      {!items ? <Skeleton className="h-24" /> : items.length === 0 ? <p className="text-sm text-ink-soft">No requests yet. Build a plan on the Customize page and send it to our team.</p> : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="card p-5">
              <button className="flex w-full flex-wrap items-center justify-between gap-2 text-left" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                <span>
                  <span className="font-semibold">{getCategory(r.event.categorySlug)?.name} · {formatDate(r.event.date)} · {r.event.city}</span>
                  <span className="block text-xs text-muted">Sent {formatDateTime(r.createdAt)} · estimate {formatBDT(r.estimate.total)}</span>
                </span>
                <Badge tone={tone(r.status)}>{r.status === "responded" ? "Updated plan ready" : titleCase(r.status)}</Badge>
              </button>
              {open === r.id && (
                <div className="mt-5 space-y-5 border-t border-line pt-5">
                  {r.revisedPlan ? (
                    <div>
                      <p className="eyebrow mb-2">Updated plan from MUHURTO</p>
                      {r.revisedPlan.message && <p className="mb-3 rounded-xl bg-sand/60 p-3 text-sm">{r.revisedPlan.message}</p>}
                      <PriceTable lines={r.revisedPlan.lines} pricing={r.revisedPlan.pricing} />
                    </div>
                  ) : (
                    <div>
                      <p className="eyebrow mb-2">Your requested plan (estimate)</p>
                      <PriceTable lines={r.lines} pricing={r.estimate} />
                    </div>
                  )}
                  {r.messages.length > 0 && (
                    <ul className="space-y-2">
                      {r.messages.map((m, i) => (
                        <li key={i} className={cn("max-w-[85%] rounded-2xl px-4 py-2 text-sm", m.from === "customer" ? "ml-auto bg-ink text-paper" : "bg-sand")}>
                          {m.text}
                          <span className="mt-0.5 block text-[0.65rem] opacity-60">{m.from === "customer" ? "You" : "MUHURTO"} · {formatDateTime(m.at)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!["accepted", "closed"].includes(r.status) && (
                    <div className="space-y-3">
                      <textarea className="field min-h-20 text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message our planning team…" maxLength={2000} />
                      <div className="flex flex-wrap gap-2">
                        {r.status === "responded" && <Button variant="accent" size="sm" disabled={busy} onClick={() => act(r.id, "accept")}>Approve & book</Button>}
                        <Button variant="outline" size="sm" disabled={busy || text.trim().length < 2} onClick={() => act(r.id, r.status === "responded" ? "request_changes" : "message")}>{r.status === "responded" ? "Request changes" : "Send message"}</Button>
                        <Button variant="ghost" size="sm" disabled={busy} onClick={() => act(r.id, "close")}>Withdraw</Button>
                      </div>
                    </div>
                  )}
                  {r.bookingId && <Link href={`/booking/${r.bookingId}`} className="text-sm font-semibold text-sindoor hover:underline">View booking</Link>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Notifications() {
  const [items, setItems] = useState<AppNotification[] | null>(null);
  useEffect(() => {
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(d.notifications ?? []))
      .catch(() => setItems([]));
  }, []);
  async function markAll() {
    if (!items) return;
    const ids = items.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length) return;
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
    setItems(items.map((n) => ({ ...n, read: true })));
  }
  const unread = items?.filter((n) => !n.read).length ?? 0;
  return (
    <section aria-labelledby="notif">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="notif" className="inline-flex items-center gap-2 text-3xl"><Bell className="h-6 w-6 text-gold" /> Notifications {unread > 0 && <Badge tone="sindoor">{unread} new</Badge>}</h2>
        {unread > 0 && <button onClick={markAll} className="text-xs font-semibold text-ink-soft hover:text-ink">Mark all read</button>}
      </div>
      {!items ? <Skeleton className="h-20" /> : items.length === 0 ? <p className="text-sm text-ink-soft">You&apos;re all caught up.</p> : (
        <ul className="card divide-y divide-line">
          {items.slice(0, 10).map((n) => (
            <li key={n.id} className="flex gap-3 p-4">
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-line" : "bg-sindoor")} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-sm text-ink-soft">{n.body}</p>
                <p className="mt-1 text-xs text-muted">{formatDateTime(n.createdAt)}</p>
              </div>
              {n.link && <Link href={n.link} className="self-center text-xs font-semibold text-sindoor">Open</Link>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
