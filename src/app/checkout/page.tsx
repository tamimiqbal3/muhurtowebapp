import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageUser } from "@/lib/server/auth";
import { loadBookingOr404 } from "@/lib/server/page-data";
import { sslcommerzConfig } from "@/lib/server/payments";
import { PageHero } from "@/components/layout/PageHero";
import { DemoCheckout } from "@/components/booking/DemoCheckout";
import { LiveCheckout } from "@/components/booking/LiveCheckout";
import { DemoGate } from "@/components/auth/DemoGate";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ booking?: string }> }) {
  const { t } = await getT();
  const { booking: id } = await searchParams;
  const hero = (code?: string) => (
    <PageHero crumbs={[{ label: t("Home"), href: "/" }, { label: t("My bookings"), href: "/my-bookings" }, { label: t("Checkout") }]} eyebrow={code ? t("Step 2 of 2 · Booking {code}", { code }) : t("Step 2 of 2")} title={t("Confirm & pay")} description={t("Review the final breakdown, choose bKash, Nagad, Rocket, Visa or Mastercard, and pay securely. The 2% platform fee is included once in the total.")} />
  );
  if (!isAdminConfigured()) {
    return (
      <>
        {hero()}
        <div className="container-x pt-10"><DemoGate><DemoCheckout id={id ?? ""} /></DemoGate></div>
      </>
    );
  }
  const user = await requirePageUser(`/checkout?booking=${id ?? ""}`);
  const booking = await loadBookingOr404(id, user);
  if (booking.paymentStatus === "paid") redirect(`/booking/${booking.id}`);
  const cfg = sslcommerzConfig();
  return (
    <>
      {hero(booking.code)}
      <div className="container-x pt-10"><LiveCheckout booking={booking} gatewayConfigured={cfg.configured} sandbox={cfg.sandbox} /></div>
    </>
  );
}
