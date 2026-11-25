import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Payment not completed"), robots: { index: false } };
}

export default async function PaymentFailed({ searchParams }: { searchParams: Promise<{ booking?: string; reason?: string }> }) {
  const { t } = await getT();
  const { booking, reason } = await searchParams;
  return (
    <div className="container-x py-36">
      <div className="card mx-auto max-w-2xl p-8 text-center sm:p-12">
        <XCircle className="mx-auto h-14 w-14 text-danger" />
        <h1 className="mt-6 text-5xl">{t("Payment not completed")}</h1>
        <p className="mt-4 text-ink-soft">{reason?.slice(0, 200) || t("The payment didn't go through.")} {t("Your booking is saved, and you have not been charged for this attempt.")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {booking && <ButtonLink href={`/checkout?booking=${encodeURIComponent(booking)}`} variant="accent">{t("Try again")}</ButtonLink>}
          <ButtonLink href="/my-bookings" variant="outline">{t("My bookings")}</ButtonLink>
          <ButtonLink href="/contact" variant="ghost">{t("Contact support")}</ButtonLink>
        </div>
      </div>
    </div>
  );
}
