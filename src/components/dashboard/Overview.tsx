"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { AppNotification, CustomizationRequest } from "@/lib/types";
import { getCategory } from "@/data/categories";
import { cityName, localizeCategory } from "@/data/i18n-data";
import { formatBDT, formatDate, formatDateTime, titleCase } from "@/lib/format";
import { demoMarkRead, demoNotifications, demoRequests } from "@/lib/demo/store";
import { useMyBookings } from "../booking/BookingsList";
import { MonitoringBadge } from "../booking/StatusBadge";
import { PriceTable } from "../booking/PriceTable";
import { StatCard } from "./Shell";
import { Badge, EmptyState, Notice, Skeleton } from "../ui/misc";
import { Button, ButtonLink } from "../ui/Button";
import { ContactForm } from "../ContactForm";
import { Reveal } from "../motion/Reveal";
import { useAuth } from "../auth/AuthProvider";
import { useLang } from "../i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export function Overview() {
  const { bookings, error } = useMyBookings();
  const { t, lang } = useLang();
  const { demo } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (bookings ?? []).filter((b) => b.event.date >= today && !["cancelled", "rejected", "completed"].includes(b.status)).sort((a, b) => a.event.date.localeCompare(b.event.date));
  const paid = (bookings ?? []).filter((b) => b.paymentStatus === "paid");
  const catName = (slug: string) => { const c = getCategory(slug); return c ? localizeCategory(c, lang).name : slug; };

  return (
    <div className="space-y-10">
      {demo && <Notice title={t("Demo mode")}>{t("Your account, bookings and requests are saved in this browser until Firebase is connected.")}</Notice>}
      {error && <Notice tone="warning">{t(error)}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [t("Upcoming events"), bookings ? upcoming.length : "—", undefined],
          [t("Total bookings"), bookings ? bookings.length : "—", undefined],
          [t("Paid to date"), bookings ? formatBDT(paid.reduce((s, b) => s + b.pricing.total, 0)) : "—", t("Including platform fees")],
          [t("Monitored events"), bookings ? paid.filter((b) => b.monitoring.status === "assigned" || b.monitoring.status === "active").length : "—", undefined],
        ].map(([label, value, hint], i) => (
          <Reveal key={i} variant="tilt" delay={i * 0.07}><StatCard label={String(label)} value={value as string | number} hint={hint as string | undefined} /></Reveal>
        ))}
      </div>

      <section aria-labelledby="upcoming">
        <h2 id="upcoming" className="mb-4 text-3xl">{t("Upcoming events & monitoring")}</h2>
        {!bookings ? <Skeleton className="h-28" /> : upcoming.length === 0 ? (
          <EmptyState title={t("No upcoming events")} body={t("Plan something wonderful — your events and their monitoring status will appear here.")} action={<ButtonLink href="/event-planner" variant="accent">{t("Plan an event")}</ButtonLink>} />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {upcoming.slice(0, 4).map((b, i) => (
              <Reveal as="li" key={b.id} variant="deal" delay={i * 0.08}>
                <Link href={`/booking/${b.id}`} className="card block p-5 transition hover:shadow-[var(--shadow-lift)]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{catName(b.event.categorySlug)}</p>
                    <span className="text-xs text-muted">{b.code}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{formatDate(b.event.date, undefined, lang)} · {cityName(b.event.city, lang)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {b.paymentStatus === "paid" ? <MonitoringBadge status={b.monitoring.status} /> : <Badge tone="warning">{t("Awaiting payment")}</Badge>}
                    {b.monitoring.agentName && <span className="text-xs text-ink-soft">{t("Agent: {name}", { name: b.monitoring.agentName })}</span>}
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </section>

      <CustomizationRequests />

      <section aria-labelledby="payments">
        <h2 id="payments" className="mb-4 text-3xl">{t("Payment history")}</h2>
        {!bookings ? <Skeleton className="h-20" /> : paid.length === 0 ? <p className="text-sm text-ink-soft">{t("No completed payments yet.")}</p> : (
          <div className="card overflow-x-auto p-2">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="text-left text-xs text-muted"><th className="p-3 font-medium">{t("Booking")}</th><th className="p-3 font-medium">{t("Paid on")}</th><th className="p-3 text-right font-medium">{t("Services")}</th><th className="p-3 text-right font-medium">{t("Fee (2%)")}</th><th className="p-3 text-right font-medium">{t("Total")}</th></tr></thead>
              <tbody>
                {paid.map((b) => (
                  <tr key={b.id} className="border-t border-line">
                    <td className="p-3"><Link href={`/booking/${b.id}`} className="font-medium hover:text-sindoor">{b.code}</Link></td>
                    <td className="p-3">{formatDate(b.paidAt, undefined, lang)}</td>
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
          <h2 id="support" className="text-3xl">{t("Support")}</h2>
          <p className="mt-2 text-sm text-ink-soft">{t("Questions about a booking, a vendor or a payment? Send us a message and our support team will reply by email or phone.")}</p>
        </div>
        <div className="card p-6"><ContactForm compact /></div>
      </section>
    </div>
  );
}

function CustomizationRequests() {
  const router = useRouter();
  const { t, lang } = useLang();
  const { demo, user, loading } = useAuth();
  const [items, setItems] = useState<CustomizationRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (loading) return;
    if (demo) {
      setItems(user ? demoRequests(user.uid) : []);
      return;
    }
    fetch("/api/customization-requests", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setItems(d.requests);
      })
      .catch((e) => setError(e.message));
  }, [demo, user, loading]);
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
      setError(t(e instanceof Error ? e.message : "Action failed."));
    } finally {
      setBusy(false);
    }
  }

  const tone = (s: CustomizationRequest["status"]) => (s === "responded" ? "success" : s === "accepted" ? "ink" : s === "closed" ? "neutral" : "warning") as "success" | "ink" | "neutral" | "warning";
  const catName = (slug: string) => { const c = getCategory(slug); return c ? localizeCategory(c, lang).name : slug; };

  return (
    <section id="customizations" aria-labelledby="custom-h" className="scroll-mt-28">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="custom-h" className="text-3xl">{t("Customisation requests")}</h2>
        <ButtonLink href="/customize" variant="outline" size="sm">{t("New request")}</ButtonLink>
      </div>
      {error && <Notice tone="warning" className="mb-3">{t(error)}</Notice>}
      {!items ? <Skeleton className="h-24" /> : items.length === 0 ? <p className="text-sm text-ink-soft">{t("No requests yet. Build a plan on the Customize page and send it to our team.")}</p> : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="card p-5">
              <button className="flex w-full flex-wrap items-center justify-between gap-2 text-left" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                <span>
                  <span className="font-semibold">{catName(r.event.categorySlug)} · {formatDate(r.event.date, undefined, lang)} · {cityName(r.event.city, lang)}</span>
                  <span className="block text-xs text-muted">{t("Sent {when} · estimate {amount}", { when: formatDateTime(r.createdAt, lang), amount: formatBDT(r.estimate.total) })}</span>
                </span>
                <Badge tone={tone(r.status)}>{r.status === "responded" ? t("Updated plan ready") : t(titleCase(r.status))}</Badge>
              </button>
              {open === r.id && (
                <div className="mt-5 space-y-5 border-t border-line pt-5">
                  {r.revisedPlan ? (
                    <div>
                      <p className="eyebrow mb-2">{t("Updated plan from MUHURTO")}</p>
                      {r.revisedPlan.message && <p className="mb-3 rounded-xl bg-sand/60 p-3 text-sm">{r.revisedPlan.message}</p>}
                      <PriceTable lines={r.revisedPlan.lines} pricing={r.revisedPlan.pricing} />
                    </div>
                  ) : (
                    <div>
                      <p className="eyebrow mb-2">{t("Your requested plan (estimate)")}</p>
                      <PriceTable lines={r.lines} pricing={r.estimate} />
                    </div>
                  )}
                  {r.messages.length > 0 && (
                    <ul className="space-y-2">
                      {r.messages.map((m, i) => (
                        <li key={i} className={cn("max-w-[85%] rounded-2xl px-4 py-2 text-sm", m.from === "customer" ? "ml-auto bg-ink text-paper" : "bg-sand")}>
                          {m.text}
                          <span className="mt-0.5 block text-[0.65rem] opacity-60">{m.from === "customer" ? t("You") : "MUHURTO"} · {formatDateTime(m.at, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {demo ? (
                    <p className="text-xs text-muted">{t("In the live version our planning team replies here with an updated plan.")}</p>
                  ) : !["accepted", "closed"].includes(r.status) && (
                    <div className="space-y-3">
                      <textarea className="field min-h-20 text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Message our planning team…")} maxLength={2000} />
                      <div className="flex flex-wrap gap-2">
                        {r.status === "responded" && <Button variant="accent" size="sm" disabled={busy} onClick={() => act(r.id, "accept")}>{t("Approve & book")}</Button>}
                        <Button variant="outline" size="sm" disabled={busy || text.trim().length < 2} onClick={() => act(r.id, r.status === "responded" ? "request_changes" : "message")}>{r.status === "responded" ? t("Request changes") : t("Send message")}</Button>
                        <Button variant="ghost" size="sm" disabled={busy} onClick={() => act(r.id, "close")}>{t("Withdraw")}</Button>
                      </div>
                    </div>
                  )}
                  {r.bookingId && <Link href={`/booking/${r.bookingId}`} className="text-sm font-semibold text-sindoor hover:underline">{t("View booking")}</Link>}
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
  const { t, lang } = useLang();
  const { demo, user, loading } = useAuth();
  const [items, setItems] = useState<AppNotification[] | null>(null);
  useEffect(() => {
    if (loading) return;
    if (demo) {
      setItems(user ? demoNotifications(user.uid) : []);
      return;
    }
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(d.notifications ?? []))
      .catch(() => setItems([]));
  }, [demo, user, loading]);
  async function markAll() {
    if (!items) return;
    const ids = items.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length) return;
    if (demo && user) demoMarkRead(user.uid);
    else await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
    setItems(items.map((n) => ({ ...n, read: true })));
  }
  const unread = items?.filter((n) => !n.read).length ?? 0;
  return (
    <section aria-labelledby="notif">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="notif" className="text-3xl">{t("Notifications")} {unread > 0 && <Badge tone="sindoor">{t("{n} new", { n: unread })}</Badge>}</h2>
        {unread > 0 && <button onClick={markAll} className="text-xs font-semibold text-ink-soft hover:text-ink">{t("Mark all read")}</button>}
      </div>
      {!items ? <Skeleton className="h-20" /> : items.length === 0 ? <p className="text-sm text-ink-soft">{t("You're all caught up.")}</p> : (
        <ul className="card divide-y divide-line">
          {items.slice(0, 10).map((n) => (
            <li key={n.id} className="flex gap-3 p-4">
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-line" : "bg-sindoor")} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t(n.title)}</p>
                <p className="text-sm text-ink-soft">{t(n.body)}</p>
                <p className="mt-1 text-xs text-muted">{formatDateTime(n.createdAt, lang)}</p>
              </div>
              {n.link && <Link href={n.link} className="self-center text-xs font-semibold text-sindoor">{t("Open")}</Link>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
