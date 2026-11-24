import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { BookingReview } from "@/components/booking/BookingReview";

export const metadata: Metadata = { title: "Review & book", robots: { index: false } };

export default function BookingPage() {
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "Customize", href: "/customize" }, { label: "Review & book" }]} eyebrow="Step 1 of 2" title="Review your plan" description="Confirm services, event details and contact information. Payment is the next step." />
      <div className="container-x pt-10"><BookingReview /></div>
    </>
  );
}
