"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { Booking } from "@/lib/types";
import { demoBooking } from "@/lib/demo/store";
import { getCategory } from "@/data/categories";
import { cityName, localizeCategory } from "@/data/i18n-data";
import { formatBDT, formatDate } from "@/lib/format";
import { useAuth } from "../auth/AuthProvider";
import { useLang } from "../i18n/LanguageProvider";
import { PriceTable } from "./PriceTable";
import { PayButton } from "./PayButton";
import { EmptyState, Skeleton } from "../ui/misc";
import { ButtonLink } from "../ui/Button";

export function CheckoutSummary({ booking, children }: { booking: Booking; children: ReactNode }) {
  const { t, lang } = useLang();
  const cat = getCategory(booking.event.categorySlug);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <section className="card p-6">
        <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
          <span className="font-semibold text-ink">{cat ? localizeCategory(cat, lang).name : ""}</span>
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDate(booking.event.date, undefined, lang)}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {booking.event.venue}, {cityName(booking.event.city, lang)}</span>
          <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {t("{n} guests", { n: booking.event.guests })}</span>
        </div>
        <PriceTable lines={booking.lines} pricing={booking.pricing} />
      </section>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card space-y-4 p-6">
          <p className="eyebrow">{t("Total payable")}</p>
          <p className="font-display text-4xl font-semibold sm:text-5xl">{formatBDT(booking.pricing.total)}</p>
          <p className="text-xs text-muted">{t("Includes {fee} platform fee (2% of {sub}).", { fee: formatBDT(booking.pricing.platformFee), sub: formatBDT(booking.pricing.subtotal) })}</p>
          {children}
          <Link href={`/booking/${booking.id}`} className="block text-center text-xs font-semibold text-ink-soft hover:text-ink">{t("View booking details")}</Link>
        </div>
      </aside>
    </div>
  );
}

export function DemoCheckout({ id }: { id: string }) {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const [booking, setBooking] = useState<Booking | null | undefined>(undefined);
  useEffect(() => {
    if (loading) return;
    const b = demoBooking(id);
    setBooking(b && b.customerId === user?.uid ? b : null);
  }, [id, user, loading]);
  if (booking === undefined) return <Skeleton className="h-80" />;
  if (!booking) return <EmptyState title={t("Booking not found")} body={t("This booking doesn't exist on this device.")} action={<ButtonLink href="/my-bookings" variant="accent">{t("My bookings")}</ButtonLink>} />;
  return (
    <CheckoutSummary booking={booking}>
      {booking.status === "pending_payment" ? <PayButton bookingId={booking.id} total={booking.pricing.total} gatewayConfigured={false} sandbox demo /> : <p className="rounded-xl bg-sand p-4 text-sm">{t("This booking can't be paid in its current state.")}</p>}
    </CheckoutSummary>
  );
}
