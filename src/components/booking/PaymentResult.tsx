"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { demoBooking, localPayments, recordPayment, type LocalPayment } from "@/lib/demo/store";
import { getCatalogSnapshot } from "@/lib/store/catalog";
import { formatBDT } from "@/lib/format";
import { ButtonLink } from "../ui/Button";
import { Spinner } from "../ui/misc";
import { useT } from "../i18n/LanguageProvider";

type View = { kind: "checking" } | { kind: "paid"; payment: LocalPayment } | { kind: "failed"; bookingId: string; reason: string };

function Inner() {
  const t = useT();
  const sp = useSearchParams();
  const [view, setView] = useState<View>({ kind: "checking" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const status = sp.get("status");
    const valId = sp.get("val_id") ?? "";
    const tranId = sp.get("tran_id") ?? "";
    const bookingId = sp.get("value_a") ?? "";
    const already = localPayments().find((p) => p.id === tranId && p.status === "paid");
    if (already) return setView({ kind: "paid", payment: already });
    if (status !== "success" || !valId) {
      return setView({ kind: "failed", bookingId, reason: status === "cancel" ? t("The payment was cancelled. No money has been taken.") : t("The payment did not go through. No money has been taken — please try again.") });
    }
    (async () => {
      try {
        const res = await fetch(`/api/pay/verify?val_id=${encodeURIComponent(valId)}`);
        const v = await res.json();
        if (!res.ok) throw new Error(v.error);
        const booking = demoBooking(v.bookingId || bookingId);
        if (v.status !== "paid" || !booking || v.amount + 1 < booking.pricing.total) throw new Error(t("We could not confirm this payment. If money was deducted, please contact our support team with your transaction ID."));
        const team = getCatalogSnapshot().settings.supportTeam;
        const support = team[Math.floor(Math.random() * team.length)] ?? { name: "MUHURTO Support", email: "support@muhurto.app", phone: "" };
        const rec = recordPayment({ id: v.tranId || tranId, bookingId: booking.id, amount: v.amount, method: v.method, cardType: v.cardType || v.cardBrand, bankTranId: v.bankTranId, valId, status: "paid", sandbox: Boolean(v.sandbox), paidAt: new Date().toISOString(), support: { name: support.name, email: support.email, phone: support.phone } });
        if (!rec) throw new Error(t("Booking not found."));
        try {
          sessionStorage.removeItem("muhurto.pending-payment");
        } catch {
          /* ignore */
        }
        setView({ kind: "paid", payment: rec });
      } catch (e) {
        setView({ kind: "failed", bookingId, reason: (e as Error).message || t("We could not confirm this payment.") });
      }
    })();
  }, [sp, t]);

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center pt-28 pb-16">
      <div className="card w-full max-w-lg p-7 text-center sm:p-10">
        {view.kind === "checking" && (<><Spinner className="mx-auto h-8 w-8" /><h1 className="mt-5 text-3xl">{t("Confirming your payment")}</h1><p className="mt-2 text-sm text-ink-soft">{t("Please keep this page open for a moment.")}</p></>)}
        {view.kind === "paid" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h1 className="mt-5 text-3xl sm:text-4xl">{t("Payment successful")}</h1>
            <p className="mt-3 text-ink-soft">{t("{amount} received for booking {code}. Your invoice {invoice} is ready.", { amount: formatBDT(view.payment.amount), code: view.payment.bookingCode, invoice: view.payment.invoiceNo })}</p>
            <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
              <ButtonLink href={`/invoice/${view.payment.bookingId}`} variant="accent">{t("View invoice")}</ButtonLink>
              <ButtonLink href="/my-bookings" variant="outline">{t("My bookings")}</ButtonLink>
            </div>
          </>
        )}
        {view.kind === "failed" && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-danger" />
            <h1 className="mt-5 text-3xl sm:text-4xl">{t("Payment not completed")}</h1>
            <p className="mt-3 text-ink-soft">{view.reason}</p>
            <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
              {view.bookingId && <ButtonLink href={`/checkout?booking=${view.bookingId}`} variant="accent">{t("Try again")}</ButtonLink>}
              <ButtonLink href="/contact" variant="outline">{t("Contact support")}</ButtonLink>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function PaymentResult() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
