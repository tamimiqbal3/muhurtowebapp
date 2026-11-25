"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "../ui/Button";
import { Notice, Spinner } from "../ui/misc";
import { formatBDT } from "@/lib/format";
import { useT } from "../i18n/LanguageProvider";
import { PaymentMethodPicker } from "../payments/PaymentMethodPicker";
import type { PaymentMethodId } from "@/data/payments";

export function PayButton({ bookingId, total, gatewayConfigured, sandbox, demo }: { bookingId: string; total: number; gatewayConfigured: boolean; sandbox: boolean; demo?: boolean }) {
  const t = useT();
  const [method, setMethod] = useState<PaymentMethodId | null>("bkash");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const enabled = gatewayConfigured && !demo;

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
      {demo ? (
        <Notice tone="warning" title={t("Demo mode — no payment taken")}>{t("Payments open once Firebase and the SSLCommerz sandbox are connected. Your booking is saved and nothing has been charged.")}</Notice>
      ) : !gatewayConfigured ? (
        <Notice tone="warning" title={t("Payment gateway not connected")}>{t("SSLCommerz sandbox credentials haven't been added to this deployment, so online payment is disabled. Your booking is saved and no money has been taken.")}</Notice>
      ) : sandbox ? (
        <Notice tone="info" title={t("Sandbox mode")}>{t("Payments run in SSLCommerz test mode. Use sandbox test cards or wallets; no real money moves.")}</Notice>
      ) : null}
      {error && <Notice tone="warning">{error}</Notice>}
      <Button variant="accent" size="lg" className="w-full" disabled={busy || !enabled || !method} onClick={pay}>
        {busy ? <Spinner /> : <><Lock className="h-4 w-4" /> {t("Pay {amount} securely", { amount: formatBDT(total) })}</>}
      </Button>
      <p className="text-center text-xs text-muted">{t("Secured by SSLCommerz. MUHURTO never sees your card or wallet PIN.")}</p>
    </div>
  );
}
