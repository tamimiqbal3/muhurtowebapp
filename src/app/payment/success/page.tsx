import type { Metadata } from "next";
import { CheckCircle2, Radar } from "lucide-react";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { requirePageUser } from "@/lib/server/auth";
import { loadBookingOr404 } from "@/lib/server/page-data";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/misc";
import { FirebaseSetupNotice } from "@/components/ui/SetupNotice";
import { formatBDT, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Payment successful", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PaymentSuccess({ searchParams }: { searchParams: Promise<{ booking?: string; duplicate?: string }> }) {
  if (!isAdminConfigured()) return <FirebaseSetupNotice feature="Payments" />;
  const { booking: id, duplicate } = await searchParams;
  const user = await requirePageUser(`/payment/success?booking=${id ?? ""}`);
  const booking = await loadBookingOr404(id, user);
  const paid = booking.paymentStatus === "paid";

  return (
    <div className="container-x py-36">
      <div className="card mx-auto max-w-2xl p-8 text-center sm:p-12">
        {paid ? <CheckCircle2 className="mx-auto h-14 w-14 text-success" /> : <Radar className="mx-auto h-14 w-14 text-warning" />}
        <h1 className="mt-6 text-5xl">{paid ? "Payment received" : "Verifying your payment"}</h1>
        <p className="bn mt-2 text-gold">{paid ? "ধন্যবাদ! আপনার বুকিং নিশ্চিত হয়েছে।" : "অনুগ্রহ করে অপেক্ষা করুন"}</p>
        <p className="mt-5 text-ink-soft">
          {paid
            ? `Booking ${booking.code} for ${formatDate(booking.event.date)} is confirmed. You paid ${formatBDT(booking.pricing.total)}, including the 2% platform fee.`
            : "We haven't received confirmation from the gateway yet. This page will reflect the final status once SSLCommerz confirms it — no need to pay again."}
        </p>
        {duplicate && <Notice tone="warning" className="mt-6 text-left">This booking was already paid. The second payment has been flagged for a refund by our team.</Notice>}
        {paid && (
          <div className="mt-8 rounded-2xl bg-sand p-5 text-left text-sm">
            <p className="font-semibold">What happens next</p>
            <p className="mt-1 text-ink-soft">
              {booking.monitoring.status === "assigned" && booking.monitoring.agentName
                ? `${booking.monitoring.agentName} has been assigned as your Monitoring Agent.`
                : "Your Monitoring Agent assignment is pending. You'll be notified as soon as an agent is confirmed."}{" "}
              Follow preparation milestones and vendor progress from your booking page.
            </p>
          </div>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={`/booking/${booking.id}`} variant="accent">Track your event</ButtonLink>
          <ButtonLink href="/dashboard" variant="outline">Go to dashboard</ButtonLink>
        </div>
      </div>
    </div>
  );
}
