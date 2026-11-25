import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { BookingReview } from "@/components/booking/BookingReview";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Review & book", robots: { index: false } };

export default async function BookingPage() {
  const { t } = await getT();
  return (
    <>
      <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("Customize"), href: "/customize" }, { label: t("Review & book") }]} eyebrow={t("Step 1 of 2")} title={t("Review your plan")} description={t("Confirm services, event details and contact information. Payment is the next step.")} />
      <div className="container-x pt-10"><BookingReview /></div>
    </>
  );
}
