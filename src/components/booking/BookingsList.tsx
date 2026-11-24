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

export function useMyBookings() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/bookings", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Could not load bookings.");
        setBookings(d.bookings);
      })
      .catch((e) => setError(e.message));
  }, []);
  return { bookings, error };
}

export function BookingsList({ filter = "all" }: { filter?: "all" | "upcoming" | "past" }) {
  const { bookings, error } = useMyBookings();
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
        {(["upcoming", "past", "all"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("h-9 rounded-full px-4 text-xs font-semibold capitalize", tab === t ? "bg-ink text-paper" : "text-ink-soft")}>
            {t} <span className="opacity-60">({t === "upcoming" ? upcoming.length : t === "past" ? past.length : bookings.length})</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState title={tab === "upcoming" ? "No upcoming events" : "Nothing here yet"} body="When you book services, your events will appear here with payment and monitoring status." action={<ButtonLink href="/event-planner" variant="accent">Plan an event</ButtonLink>} />
      ) : (
        <ul className="space-y-3">
          {list.map((b) => (
            <li key={b.id}>
              <Link href={`/booking/${b.id}`} className="card group flex flex-col gap-4 p-5 transition hover:shadow-[var(--shadow-lift)] sm:flex-row sm:items-center">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-center text-paper" style={{ background: getCategory(b.event.categorySlug)?.accent }}>
                  <span className="font-display text-2xl leading-none">{new Date(`${b.event.date}T00:00:00`).getDate()}<span className="block font-sans text-[0.6rem] font-semibold uppercase">{formatDate(b.event.date, { month: "short" })}</span></span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{getCategory(b.event.categorySlug)?.name} · {b.code}</p>
                    <BookingStatusBadge status={b.status} />
                    <PaymentStatusBadge status={b.paymentStatus} />
                    {b.paymentStatus === "paid" && <MonitoringBadge status={b.monitoring.status} />}
                  </div>
                  <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(b.event.date)}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.event.city}</span>
                    <span>{b.lines.length} services</span>
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
