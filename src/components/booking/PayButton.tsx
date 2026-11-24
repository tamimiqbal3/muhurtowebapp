"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "../ui/Button";
import { Notice, Spinner } from "../ui/misc";
import { formatBDT } from "@/lib/format";

export function PayButton({ bookingId, total, gatewayConfigured, sandbox }: { bookingId: string; total: number; gatewayConfigured: boolean; sandbox: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/init", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId }) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start payment.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start payment.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {!gatewayConfigured && (
        <Notice tone="warning" title="Payment gateway not connected">
          SSLCommerz sandbox credentials haven&apos;t been added to this deployment, so online payment is disabled. Your booking is saved and no money has been taken.
        </Notice>
      )}
      {gatewayConfigured && sandbox && <Notice tone="info" title="Sandbox mode">Payments run in SSLCommerz test mode. Use sandbox test cards or wallets; no real money moves.</Notice>}
      {error && <Notice tone="warning">{error}</Notice>}
      <Button variant="accent" size="lg" className="w-full" disabled={busy || !gatewayConfigured} onClick={pay}>
        {busy ? <Spinner /> : <><Lock className="h-4 w-4" /> Pay {formatBDT(total)} securely</>}
      </Button>
      <p className="text-center text-xs text-muted">bKash · Nagad · Rocket · Visa · Mastercard · Amex · internet banking — via SSLCommerz</p>
    </div>
  );
}
