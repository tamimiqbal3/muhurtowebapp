"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "../ui/Button";
import { Notice, Spinner } from "../ui/misc";
import { formatBDT } from "@/lib/format";
import { useT } from "../i18n/LanguageProvider";
import { PaymentMethodPicker } from "../payments/PaymentMethodPicker";
import { getPaymentMethod, type PaymentMethodId } from "@/data/payments";

export function PayButton({ bookingId, total, gatewayConfigured, sandbox, demo }: { bookingId: string; total: number; gatewayConfigured: boolean; sandbox: boolean; demo?: boolean }) {
  const t = useT();
  const [method, setMethod] = useState<PaymentMethodId | null>("bkash");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBank = getPaymentMethod(method)?.kind === "bank";
  const enabled = gatewayConfigured && !demo && !isBank;

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/init", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, method }) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start payment.");
      window.location.assign(data.url);
    } catch (e) {
      setError(t(e instanceof Error ? e.message : "Could not start payment."));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <PaymentMethodPicker value={method} onChange={setMethod} />
      {isBank ? (
        <Notice tone="info" title={t("Pay by bank transfer")}>{t("Our team will send the bank account details to your email and phone with your booking code. Your booking is confirmed as soon as the transfer arrives.")}</Notice>
      ) : demo || !gatewayConfigured ? (
        <Notice tone="info" title={t("Online payment opens soon")}>{t("Your booking is saved and nothing has been charged. We will confirm payment options with you directly.")}</Notice>
      ) : sandbox ? (
        <Notice tone="info" title={t("Sandbox mode")}>{t("Payments run in SSLCommerz test mode. Use sandbox test cards or wallets; no real money moves.")}</Notice>
      ) : null}
      {error && <Notice tone="warning">{error}</Notice>}
      {!isBank && <Button variant="accent" size="lg" className="w-full" disabled={busy || !enabled || !method} onClick={pay}>
        {busy ? <Spinner /> : <><Lock className="h-4 w-4" /> {t("Pay {amount} securely", { amount: formatBDT(total) })}</>}
      </Button>}
      <p className="text-center text-xs text-muted">{t("Encrypted payment. MUHURTO never sees your card number or wallet PIN.")}</p>
    </div>
  );
}
