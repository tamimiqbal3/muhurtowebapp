"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { demoBooking, localPaymentForBooking, type LocalPayment } from "@/lib/demo/store";
import { getPaymentMethod } from "@/data/payments";
import { findCategory, useCatalog } from "@/lib/store/catalog";
import { blocksOf50 } from "@/lib/pricing";
import { formatBDT, formatDate, formatDateTime } from "@/lib/format";
import type { Booking } from "@/lib/types";
import { useLang } from "../i18n/LanguageProvider";
import { localizeCategory } from "@/data/i18n-data";
import { TAGLINE } from "../layout/Logo";

/** Formal invoice issued after a confirmed payment. Printable / savable as PDF from the browser. */
export function Invoice({ bookingId }: { bookingId: string }) {
  const { t, lang } = useLang();
  const data = useCatalog();
  const [state, setState] = useState<{ booking: Booking | null; payment: LocalPayment | null } | null>(null);
  useEffect(() => setState({ booking: demoBooking(bookingId), payment: localPaymentForBooking(bookingId) }), [bookingId]);

  if (!state) return <div className="min-h-dvh" />;
  const { booking, payment } = state;
  if (!booking || !payment) {
    return (
      <div className="grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <h1 className="text-3xl">{t("Invoice not available")}</h1>
          <p className="mt-2 text-ink-soft">{t("An invoice is issued once the payment for a booking is confirmed.")}</p>
          <Link href="/my-bookings" className="mt-6 inline-block font-semibold text-brand">{t("My bookings")}</Link>
        </div>
      </div>
    );
  }
  const cat = findCategory(data, booking.event.categorySlug);
  const method = getPaymentMethod(payment.method);
  const { contact } = data.settings;

  return (
    <div className="min-h-dvh bg-[#eef2f8] px-3 py-6 print:bg-paper print:p-0 sm:px-6 sm:py-10">
      <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href={`/booking/${booking.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> {t("Back to booking")}</Link>
        <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-paper hover:bg-brand/90"><Printer className="h-4 w-4" /> {t("Print or save as PDF")}</button>
      </div>

      <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-paper shadow-[0_30px_60px_-40px_rgb(8_20_48/.45)] print:max-w-none print:rounded-none print:shadow-none">
        <header className="bg-[linear-gradient(120deg,#015fff,#00befe)] px-6 py-7 text-paper sm:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/muhurto-logo-384.png" alt="" className="h-16 w-16 rounded-full bg-paper p-1 sm:h-20 sm:w-20" />
              <div>
                <p className="font-display text-3xl font-semibold tracking-[0.14em] sm:text-4xl">MUHURTO</p>
                <p className="text-sm text-paper/85">{TAGLINE.en} <span className="bn">· {TAGLINE.bn}</span></p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-paper/80">{t("Invoice")}</p>
              <p className="mt-1 text-xl font-semibold">{payment.invoiceNo}</p>
              <p className="text-sm text-paper/85">{formatDate(payment.paidAt, undefined, lang)}</p>
            </div>
          </div>
        </header>

        <div className="space-y-8 px-6 py-8 sm:px-10">
          <div className="grid gap-6 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t("Billed to")}</p>
              <p className="mt-2 font-semibold">{booking.contact.name}</p>
              <p className="text-ink-soft break-words">{booking.contact.email}</p>
              <p className="text-ink-soft">{booking.contact.phone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t("Event")}</p>
              <p className="mt-2 font-semibold">{cat ? localizeCategory(cat, lang).name : ""}</p>
              <p className="text-ink-soft">{formatDate(booking.event.date, undefined, lang)} · {t("{n} guests", { n: booking.event.guests })}</p>
              <p className="text-ink-soft break-words">{booking.event.venue}, {booking.event.city}</p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t("Booking")}</p>
              <p className="mt-2 font-semibold">{booking.code}</p>
              <p className="inline-flex rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">{t("Paid")}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="border-b-2 border-ink text-left text-xs tracking-wide text-muted uppercase"><th className="py-2 pr-3 font-semibold">{t("Service")}</th><th className="py-2 pr-3 font-semibold">{t("Guests")}</th><th className="py-2 pr-3 text-right font-semibold">{t("Rate")}</th><th className="py-2 text-right font-semibold">{t("Amount")}</th></tr></thead>
              <tbody className="divide-y divide-line">
                {booking.lines.map((l) => (
                  <tr key={l.serviceId}>
                    <td className="py-3 pr-3"><p className="font-medium">{l.serviceName}</p>{l.optionLabels.length > 0 && <p className="text-xs text-muted">{l.optionLabels.join(", ")}</p>}</td>
                    <td className="py-3 pr-3">{l.quantity}</td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">{formatBDT(l.unitPrice)}{l.unit === "per50" && <span className="block text-xs text-muted">× {blocksOf50(l.quantity)} · {t("per 50 guests")}</span>}</td>
                    <td className="py-3 text-right font-medium whitespace-nowrap">{formatBDT(l.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <dl className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-soft">{t("Subtotal")}</dt><dd>{formatBDT(booking.pricing.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-soft">{t("Platform fee (2%)")}</dt><dd>{formatBDT(booking.pricing.platformFee)}</dd></div>
              <div className="flex justify-between border-t-2 border-ink pt-2 text-base font-semibold"><dt>{t("Total paid")}</dt><dd>{formatBDT(payment.amount)}</dd></div>
            </dl>
          </div>

          <div className="grid gap-6 rounded-xl bg-sand/60 p-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t("Payment details")}</p>
              <dl className="mt-2 space-y-1">
                <div><dt className="inline text-ink-soft">{t("Method")}: </dt><dd className="inline font-medium">{method ? (lang === "bn" ? method.nameBn : method.name) : payment.cardType || "SSLCOMMERZ"}{payment.cardType && method && ` (${payment.cardType})`}</dd></div>
                <div><dt className="inline text-ink-soft">{t("Transaction ID")}: </dt><dd className="inline font-mono text-xs break-all">{payment.id}</dd></div>
                {payment.bankTranId && <div><dt className="inline text-ink-soft">{t("Bank reference")}: </dt><dd className="inline font-mono text-xs break-all">{payment.bankTranId}</dd></div>}
                <div><dt className="inline text-ink-soft">{t("Paid on")}: </dt><dd className="inline">{formatDateTime(payment.paidAt, lang)}</dd></div>
              </dl>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t("MUHURTO Support Team")}</p>
              <p className="mt-2 font-semibold">{payment.support.name}</p>
              <p className="text-ink-soft break-words">{payment.support.email}</p>
              <p className="text-ink-soft">{payment.support.phone}</p>
              <p className="mt-2 text-xs text-muted">{t("Your dedicated contact for this booking.")}</p>
            </div>
          </div>

          <footer className="border-t border-line pt-5 text-xs text-muted">
            <p>{t("Thank you for choosing MUHURTO. This is a computer-generated invoice and does not require a signature.")}</p>
            <p className="mt-1">MUHURTO · {lang === "bn" ? contact.addressBn : contact.address} · {contact.phone} · {contact.email}</p>
          </footer>
        </div>
      </article>
    </div>
  );
}
