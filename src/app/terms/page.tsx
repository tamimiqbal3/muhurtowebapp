import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Notice } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHero crumbs={[{ label: "Home", href: "/" }, { label: "Terms & Conditions" }]} title="Terms & Conditions" />
      <article className="container-x max-w-3xl space-y-6 pt-12 text-ink-soft [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:text-ink">
        <Notice tone="warning">Template for review — have these terms checked by a qualified lawyer before launch.</Notice>
        <h2>Bookings</h2>
        <p>A booking is created when you confirm your plan and becomes confirmed only after payment is verified by our payment gateway. Vendor availability is confirmed by MUHURTO after booking; if a vendor is unavailable we will offer an equivalent alternative or a refund for that service.</p>
        <h2>Pricing & platform fee</h2>
        <p>Listing prices are starting prices in Bangladeshi Taka. The total payable is the sum of your selected services plus a 2% platform fee, shown before payment. The fee is charged once per booking.</p>
        <h2>Customisation</h2>
        <p>Customisation requests are reviewed by our team. An updated plan is only binding once you approve it and complete payment.</p>
        <h2>Cancellations & modifications</h2>
        <p>Unpaid bookings can be cancelled at any time. For paid bookings, cancellation or modification requests are reviewed against each vendor&apos;s policy; refunds, where applicable, are returned through the original payment method.</p>
        <h2>Monitoring Agents</h2>
        <p>After payment, MUHURTO assigns a Monitoring Agent to coordinate vendors for your event. The agent acts on MUHURTO&apos;s behalf and is your main point of contact on the day.</p>
      </article>
    </>
  );
}
