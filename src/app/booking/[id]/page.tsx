import type { Metadata } from "next";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageUser } from "@/lib/server/auth";
import { loadBookingOr404 } from "@/lib/server/page-data";
import { PageHero } from "@/components/layout/PageHero";
import { BookingDetail } from "@/components/booking/BookingDetail";
import { FirebaseSetupNotice } from "@/components/ui/SetupNotice";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Booking details", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getT();
  const { id } = await params;
  if (!isAdminConfigured()) return <FirebaseSetupNotice feature="Bookings" />;
  const user = await requirePageUser(`/booking/${id}`);
  const code = (await loadBookingOr404(id, user)).code;
  const body = <div className="container-x pt-10"><BookingDetail id={id} /></div>;
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("My bookings"), href: "/my-bookings" }, { label: code || t("Booking") }]} eyebrow={code ? t("Booking {code}", { code }) : t("Booking")} title={t("Your event")} description={t("Track payment, your Monitoring Agent, vendor progress and updates in one place.")} />
      {body}
    </>
  );
}
