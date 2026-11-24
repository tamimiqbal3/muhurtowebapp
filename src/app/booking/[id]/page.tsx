import type { Metadata } from "next";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageUser } from "@/lib/server/auth";
import { loadBookingOr404 } from "@/lib/server/page-data";
import { PageHero } from "@/components/layout/PageHero";
import { BookingDetail } from "@/components/booking/BookingDetail";
import { FirebaseSetupNotice } from "@/components/ui/SetupNotice";

export const metadata: Metadata = { title: "Booking details", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isAdminConfigured()) return <FirebaseSetupNotice feature="Booking details" />;
  const { id } = await params;
  const user = await requirePageUser(`/booking/${id}`);
  const booking = await loadBookingOr404(id, user);
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "My bookings", href: "/my-bookings" }, { label: booking.code }]} eyebrow={`Booking ${booking.code}`} title="Your event" description="Track payment, your Monitoring Agent, vendor progress and updates in one place." />
      <div className="container-x pt-10"><BookingDetail id={booking.id} /></div>
    </>
  );
}
