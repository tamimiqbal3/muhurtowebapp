"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "../ui/Button";
import { Notice, Spinner } from "../ui/misc";
import { formatBDT } from "@/lib/format";
import { useLang } from "../i18n/LanguageProvider";
import { useSiteSettings } from "../SiteSettingsProvider";
import { PaymentMethodPicker } from "../payments/PaymentMethodPicker";
import { getPaymentMethod, type PaymentMethodId } from "@/data/payments";

export function PayButton({ bookingId, total, gatewayConfigured, demo }: { bookingId: string; total: number; gatewayConfigured: boolean; sandbox: boolean; demo?: boolean }) {
  const { t, lang } = useLang();
  const { bankTransfer, payments } = useSiteSettings();
  const [method, setMethod] = useState<PaymentMethodId | null>(null);
  const chosen = method ?? payments.enabled[0] ?? null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBank = getPaymentMethod(chosen)?.kind === "bank";

  async function pay() {
    setError(null);
    if (demo || !gatewayConfigured) {
      setError(t("Online payment is temporarily unavailable. Please try again shortly or contact our support team."));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/payments/init", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, method: chosen }) });
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
      <PaymentMethodPicker value={chosen} onChange={setMethod} />
      {isBank && <Notice tone="info" title={t("Pay by bank transfer")}>{lang === "bn" ? bankTransfer.instructionsBn : bankTransfer.instructions}</Notice>}
      {error && <Notice tone="warning">{error}</Notice>}
      {!isBank && <Button variant="accent" size="lg" className="w-full" disabled={busy || !chosen} onClick={pay}>
        {busy ? <Spinner /> : <><Lock className="h-4 w-4" /> {t("Pay {amount} securely", { amount: formatBDT(total) })}</>}
      </Button>}
      <p className="text-center text-xs text-muted">{t("Encrypted payment. MUHURTO never sees your card number or wallet PIN.")}</p>
    </div>
  );
}
