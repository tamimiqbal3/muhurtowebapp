"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import type { Booking } from "@/lib/types";
import { getCategory } from "@/data/categories";
import { formatBDT, formatDate } from "@/lib/format";
import { BookingStatusBadge, MonitoringBadge, PaymentStatusBadge } from "./StatusBadge";
import { EmptyState, Notice, Skeleton } from "../ui/misc";
import { ButtonLink } from "../ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "../auth/AuthProvider";
import { useLang } from "../i18n/LanguageProvider";
import { demoBookings } from "@/lib/demo/store";
import { localizeCategory } from "@/data/i18n-data";
import { cityName } from "@/data/i18n-data";

export function useMyBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { demo, user, loading } = useAuth();
  useEffect(() => {
    if (loading) return;
    if (demo) {
      setBookings(user ? demoBookings(user.uid) : []);
      return;
    }
    fetch("/api/bookings", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Could not load bookings.");
        setBookings(d.bookings);
      })
      .catch((e) => setError(e.message));
  }, [demo, user, loading]);
  return { bookings, error };
}

export function BookingsList({ filter = "all" }: { filter?: "all" | "upcoming" | "past" }) {
  const { bookings, error } = useMyBookings();
  const { t, lang } = useLang();
  const catName = (slug: string) => { const c = getCategory(slug); return c ? localizeCategory(c, lang).name : slug; };
  const [tab, setTab] = useState<"upcoming" | "past" | "all">(filter === "all" ? "upcoming" : filter);
  if (error) return <Notice tone="warning">{error}</Notice>;
  if (!bookings) return <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.event.date >= today && !["cancelled", "rejected", "completed"].includes(b.status));
  const past = bookings.filter((b) => !upcoming.includes(b));
  const list = tab === "upcoming" ? upcoming : tab === "past" ? past : bookings;

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full border border-line bg-paper p-1" role="tablist">
        {(["upcoming", "past", "all"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn("h-9 rounded-full px-4 text-xs font-semibold", tab === k ? "bg-ink text-paper" : "text-ink-soft")}>
            {t(k === "upcoming" ? "Upcoming" : k === "past" ? "Past" : "All")} <span className="opacity-60">({k === "upcoming" ? upcoming.length : k === "past" ? past.length : bookings.length})</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState title={tab === "upcoming" ? t("No upcoming events") : t("Nothing here yet")} body={t("When you book services, your events will appear here with payment and monitoring status.")} action={<ButtonLink href="/event-planner" variant="accent">{t("Plan an event")}</ButtonLink>} />
      ) : (
        <ul className="space-y-3">
          {list.map((b) => (
            <li key={b.id}>
              <Link href={`/booking/${b.id}`} className="card group flex flex-col gap-4 p-5 transition hover:shadow-[var(--shadow-lift)] sm:flex-row sm:items-center">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-center text-paper" style={{ background: getCategory(b.event.categorySlug)?.accent }}>
                  <span className="font-display text-2xl leading-none">{new Date(`${b.event.date}T00:00:00`).getDate()}<span className="block font-sans text-[0.6rem] font-semibold uppercase">{formatDate(b.event.date, { month: "short" }, lang)}</span></span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{catName(b.event.categorySlug)} · {b.code}</p>
                    <BookingStatusBadge status={b.status} />
                    <PaymentStatusBadge status={b.paymentStatus} />
                    {b.paymentStatus === "paid" && <MonitoringBadge status={b.monitoring.status} />}
                  </div>
                  <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(b.event.date, undefined, lang)}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {cityName(b.event.city, lang)}</span>
                    <span>{t("{n} services", { n: b.lines.length })}</span>
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="font-display text-2xl font-semibold">{formatBDT(b.pricing.total)}</p>
                  <ArrowUpRight className="h-5 w-5 text-muted group-hover:text-sindoor" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
