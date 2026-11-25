import type { Metadata } from "next";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageUser } from "@/lib/server/auth";
import { PageHero } from "@/components/layout/PageHero";
import { BookingsList } from "@/components/booking/BookingsList";
import { DemoGate } from "@/components/auth/DemoGate";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "My bookings", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const { t } = await getT();
  const demo = !isAdminConfigured();
  if (!demo) await requirePageUser("/my-bookings");
  const body = <div className="container-x pt-10"><BookingsList /></div>;
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("My bookings") }]} eyebrow={t("Your events")} title={t("My bookings")} />
      {demo ? <DemoGate>{body}</DemoGate> : body}
    </>
  );
}
