import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageUser } from "@/lib/server/auth";
import { loadBookingOr404 } from "@/lib/server/page-data";
import { sslcommerzConfig } from "@/lib/server/payments";
import { PageHero } from "@/components/layout/PageHero";
import { PriceTable } from "@/components/booking/PriceTable";
import { PayButton } from "@/components/booking/PayButton";
import { FirebaseSetupNotice } from "@/components/ui/SetupNotice";
import { getCategory } from "@/data/categories";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ booking?: string }> }) {
  if (!isAdminConfigured()) return <FirebaseSetupNotice feature="Checkout" />;
  const { booking: id } = await searchParams;
  const user = await requirePageUser(`/checkout?booking=${id ?? ""}`);
  const booking = await loadBookingOr404(id, user);
  if (booking.paymentStatus === "paid") redirect(`/booking/${booking.id}`);
  const cfg = sslcommerzConfig();
  const payable = booking.status === "pending_payment";

  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "My bookings", href: "/my-bookings" }, { label: "Checkout" }]} eyebrow={`Step 2 of 2 · Booking ${booking.code}`} title="Confirm & pay" description="Review the final, server-calculated breakdown. The 2% platform fee is included once in the total below." />
      <div className="container-x grid gap-8 pt-10 lg:grid-cols-[1fr_380px]">
        <section className="card p-6">
          <div className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
            <span className="font-semibold text-ink">{getCategory(booking.event.categorySlug)?.name}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDate(booking.event.date)}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {booking.event.venue}, {booking.event.city}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" /> {booking.event.guests} guests</span>
          </div>
          <PriceTable lines={booking.lines} pricing={booking.pricing} />
        </section>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card space-y-4 p-6">
            <p className="eyebrow">Total payable</p>
            <p className="font-display text-5xl font-semibold">৳{booking.pricing.total.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted">Includes ৳{booking.pricing.platformFee.toLocaleString("en-IN")} platform fee (2% of ৳{booking.pricing.subtotal.toLocaleString("en-IN")}).</p>
            {payable ? (
              <PayButton bookingId={booking.id} total={booking.pricing.total} gatewayConfigured={cfg.configured} sandbox={cfg.sandbox} />
            ) : (
              <p className="rounded-xl bg-sand p-4 text-sm">This booking is <strong>{booking.status.replace(/_/g, " ")}</strong> and can&apos;t be paid.</p>
            )}
            <Link href={`/booking/${booking.id}`} className="block text-center text-xs font-semibold text-ink-soft hover:text-ink">View booking details</Link>
          </div>
        </aside>
      </div>
    </>
  );
}
