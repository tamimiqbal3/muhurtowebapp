"use client";

import type { Booking } from "@/lib/types";
import { CheckoutSummary } from "./DemoCheckout";
import { PayButton } from "./PayButton";
import { useT } from "../i18n/LanguageProvider";

export function LiveCheckout({ booking, gatewayConfigured, sandbox }: { booking: Booking; gatewayConfigured: boolean; sandbox: boolean }) {
  const t = useT();
  return (
    <CheckoutSummary booking={booking}>
      {booking.status === "pending_payment" ? (
        <PayButton booking={booking} />
      ) : (
        <p className="rounded-xl bg-sand p-4 text-sm">{t("This booking can't be paid in its current state.")}</p>
      )}
    </CheckoutSummary>
  );
}
