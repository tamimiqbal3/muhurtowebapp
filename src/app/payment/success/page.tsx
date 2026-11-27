import type { Metadata } from "next";
import { CheckCircle2, Radar } from "lucide-react";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageUser } from "@/lib/server/auth";
import { loadBookingOr404 } from "@/lib/server/page-data";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/misc";
import { FirebaseSetupNotice } from "@/components/ui/SetupNotice";
import { formatBDT, formatDate } from "@/lib/format";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Payment successful"), robots: { index: false } };
}
export const dynamic = "force-dynamic";

export default async function PaymentSuccess({ searchParams }: { searchParams: Promise<{ booking?: string; duplicate?: string }> }) {
  const { t, lang } = await getT();
  if (!isAdminConfigured()) return <FirebaseSetupNotice feature={t("Payments")} />;
  const { booking: id, duplicate } = await searchParams;
  const user = await requirePageUser(`/payment/success?booking=${id ?? ""}`);
  const booking = await loadBookingOr404(id, user);
  const paid = booking.paymentStatus === "paid";

  return (
    <div className="container-x py-24 lg:py-36">
      <div className="card mx-auto max-w-2xl p-8 text-center sm:p-12">
        {paid ? <CheckCircle2 className="mx-auto h-14 w-14 text-success" /> : <Radar className="mx-auto h-14 w-14 text-warning" />}
        <h1 className="mt-6 text-4xl sm:text-5xl">{paid ? t("Payment received") : t("Verifying your payment")}</h1>
        <p className="mt-5 text-ink-soft">
          {paid
            ? t("Booking {code} for {date} is confirmed. You paid {amount}, including the 2% platform fee.", { code: booking.code, date: formatDate(booking.event.date, undefined, lang), amount: formatBDT(booking.pricing.total) })
            : t("We haven't received confirmation from the gateway yet. This page will update as soon as the payment is confirmed — there is no need to pay again.")}
        </p>
        {duplicate && <Notice tone="warning" className="mt-6 text-left">{t("This booking was already paid. The second payment has been flagged for a refund by our team.")}</Notice>}
        {paid && (
          <div className="mt-8 rounded-2xl bg-sand p-5 text-left text-sm">
            <p className="font-semibold">{t("What happens next")}</p>
            <p className="mt-1 text-ink-soft">
              {booking.monitoring.status === "assigned" && booking.monitoring.agentName
                ? t("{name} has been assigned as your Monitoring Agent.", { name: booking.monitoring.agentName })
                : t("Your Monitoring Agent assignment is pending. You'll be notified as soon as an agent is confirmed.")}{" "}
              {t("Follow preparation milestones and vendor progress from your booking page.")}
            </p>
          </div>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {paid && <ButtonLink href={`/invoice/${booking.id}`} variant="accent">{t("View invoice")}</ButtonLink>}
          <ButtonLink href={`/booking/${booking.id}`} variant={paid ? "outline" : "accent"}>{t("Track your event")}</ButtonLink>
          <ButtonLink href="/dashboard" variant="outline">{t("Go to dashboard")}</ButtonLink>
        </div>
      </div>
    </div>
  );
}
