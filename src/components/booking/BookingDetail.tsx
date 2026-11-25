"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Users, RefreshCw, Palette, FlaskConical } from "lucide-react";
import type { Booking, EventUpdate, MonitoringAssignment } from "@/lib/types";
import { getCategory } from "@/data/categories";
import { cityName, localizeCategory, themeName } from "@/data/i18n-data";
import { formatDate, formatDateTime, formatBDT, titleCase } from "@/lib/format";
import { demoBooking, demoRequestChange } from "@/lib/demo/store";
import { PriceTable } from "./PriceTable";
import { MonitoringPanel } from "./MonitoringPanel";
import { BookingStatusBadge, PaymentStatusBadge } from "./StatusBadge";
import { Button, ButtonLink } from "../ui/Button";
import { EmptyState, Notice, Skeleton } from "../ui/misc";
import { useAuth } from "../auth/AuthProvider";
import { useLang } from "../i18n/LanguageProvider";

interface Data {
  booking: Booking;
  assignment: MonitoringAssignment | null;
  updates: EventUpdate[];
  payments: Array<{ id: string; status: string; amount: number; mode: string; cardType: string | null; createdAt: string; paidAt: string | null }>;
}

export function BookingDetail({ id }: { id: string }) {
  const { demo, user, loading: authLoading } = useAuth();
  const { t, lang } = useLang();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reqType, setReqType] = useState<"cancellation" | "modification" | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (authLoading) return;
    if (demo) {
      const b = demoBooking(id);
      if (!b || b.customerId !== user?.uid) setMissing(true);
      else setData({ booking: b, assignment: null, updates: [{ id: "created", bookingId: id, authorId: "system", authorName: "MUHURTO", type: "system", visibility: "customer", message: "Booking created and waiting for payment.", createdAt: b.createdAt }], payments: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Could not load booking.");
      setData(d);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load booking.");
    } finally {
      setLoading(false);
    }
  }, [id, demo, user, authLoading]);

  useEffect(() => {
    void load();
    if (demo) return;
    const timer = setInterval(() => document.visibilityState === "visible" && void load(), 60_000);
    return () => clearInterval(timer);
  }, [load, demo]);

  async function sendRequest() {
    if (!reqType) return;
    setSending(true);
    try {
      if (demo) demoRequestChange(id, reqType, message);
      else {
        const res = await fetch(`/api/bookings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: reqType, message }) });
        const d = await res.json();
        if (!res.ok) throw new Error(d.error ?? "Could not send request.");
      }
      setSent(reqType === "cancellation" ? t("Cancellation request sent. Our team will review it against vendor policies and reply here.") : t("Modification request sent. We'll reply with an updated plan."));
      setReqType(null);
      setMessage("");
      void load();
    } catch (e) {
      setError(t(e instanceof Error ? e.message : "Could not send request."));
    } finally {
      setSending(false);
    }
  }

  if (missing) return <EmptyState title={t("Booking not found")} body={t("This booking doesn't exist on this device.")} action={<ButtonLink href="/my-bookings" variant="accent">{t("My bookings")}</ButtonLink>} />;
  if (!data && !error) return <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-72" /></div>;
  if (!data) return <Notice tone="warning">{t(error ?? "")}</Notice>;
  const { booking } = data;
  const cat = getCategory(booking.event.categorySlug);
  const openRequests = booking.requests?.filter((r) => r.status === "open") ?? [];
  const canRequest = !["cancelled", "completed", "rejected"].includes(booking.status);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {demo && <Notice title={t("Demo booking")}>{t("This booking is saved in your browser. In the live version it's stored securely and payment opens through SSLCommerz.")}</Notice>}
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2"><BookingStatusBadge status={booking.status} /><PaymentStatusBadge status={booking.paymentStatus} /></div>
            {!demo && <button onClick={() => void load()} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink" aria-label={t("Refresh")}><RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} /> {t("Refresh")}</button>}
          </div>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <p className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" /> {formatDate(booking.event.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }, lang)}</p>
            <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {booking.event.venue}, {cityName(booking.event.city, lang)}</p>
            <p className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-gold" /> {t("{n} guests", { n: booking.event.guests })} · {cat ? localizeCategory(cat, lang).name : ""}</p>
            {booking.event.theme && <p className="inline-flex items-center gap-2"><Palette className="h-4 w-4 text-gold" /> {themeName(booking.event.theme, lang)}</p>}
          </div>
          {booking.event.notes && <p className="mt-4 rounded-xl bg-sand/60 p-3 text-sm text-ink-soft">{booking.event.notes}</p>}
          {booking.adminNote && <Notice className="mt-4" title={t("Note from MUHURTO")}>{booking.adminNote}</Notice>}
        </div>
        <MonitoringPanel booking={booking} assignment={data.assignment} updates={data.updates} />
        <div className="card p-6">
          <h2 className="mb-4 text-3xl">{t("Services & pricing")}</h2>
          <PriceTable lines={booking.lines} pricing={booking.pricing} />
        </div>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        {booking.status === "pending_payment" && (
          <div className="card p-6">
            <p className="eyebrow">{t("Payment due")}</p>
            <p className="mt-1 font-display text-4xl font-semibold">{formatBDT(booking.pricing.total)}</p>
            <ButtonLink href={`/checkout?booking=${booking.id}`} variant="accent" className="mt-4 w-full">{t("Pay now")}</ButtonLink>
          </div>
        )}
        <div className="card p-6">
          <p className="eyebrow mb-3">{t("Payment history")}</p>
          {data.payments.length === 0 ? <p className="text-sm text-ink-soft">{t("No payment attempts yet.")}</p> : (
            <ul className="space-y-2 text-sm">
              {data.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span><span className="font-medium">{t(titleCase(p.status))}</span><span className="block text-xs text-muted">{formatDateTime(p.paidAt ?? p.createdAt, lang)}{p.mode === "sandbox" && ` · ${t("sandbox")}`}{p.cardType && ` · ${p.cardType}`}</span></span>
                  <span className="font-semibold">{formatBDT(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card p-6">
          <p className="eyebrow mb-3">{t("Need a change?")}</p>
          {sent && <Notice tone="success" className="mb-3">{sent}</Notice>}
          {openRequests.map((r, i) => <p key={i} className="mb-2 rounded-xl bg-sand/60 p-3 text-xs">{t(r.type === "cancellation" ? "Open cancellation request" : "Open modification request")} · {formatDateTime(r.createdAt, lang)}</p>)}
          {canRequest ? (
            reqType ? (
              <div className="space-y-3">
                <textarea className="field min-h-24 text-sm" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={reqType === "cancellation" ? t("Tell us why you'd like to cancel") : t("What would you like to change?")} maxLength={1500} />
                <div className="flex gap-2">
                  <Button size="sm" variant={reqType === "cancellation" ? "danger" : "primary"} disabled={sending || message.trim().length < 5} onClick={sendRequest}>{sending ? t("Sending…") : t("Send request")}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setReqType(null)}>{t("Cancel")}</Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <Button size="sm" variant="outline" onClick={() => setReqType("modification")}>{t("Request modification")}</Button>
                <Button size="sm" variant="ghost" className="text-danger" onClick={() => setReqType("cancellation")}>{booking.status === "pending_payment" ? t("Cancel booking") : t("Request cancellation")}</Button>
              </div>
            )
          ) : (
            <p className="text-sm text-ink-soft">{t("This booking is closed.")}</p>
          )}
          <Link href="/contact" className="mt-4 block text-xs font-semibold text-ink-soft hover:text-ink">{t("Contact support")}</Link>
        </div>
        {demo && <p className="flex items-center gap-2 text-xs text-muted"><FlaskConical className="h-3.5 w-3.5" /> {t("Demo mode")}</p>}
      </aside>
    </div>
  );
}
