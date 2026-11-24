import type { Metadata } from "next";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageUser } from "@/lib/server/auth";
import { PageHero } from "@/components/layout/PageHero";
import { BookingsList } from "@/components/booking/BookingsList";
import { FirebaseSetupNotice } from "@/components/ui/SetupNotice";

export const metadata: Metadata = { title: "My bookings", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  if (!isAdminConfigured()) return <FirebaseSetupNotice feature="My bookings" />;
  await requirePageUser("/my-bookings");
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "My bookings" }]} eyebrow="Your events" title="My bookings" bn="আমার বুকিং" />
      <div className="container-x pt-10"><BookingsList /></div>
    </>
  );
}
