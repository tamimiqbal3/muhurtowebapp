import { NextResponse } from "next/server";
import { finalizePayment, markPaymentClosed } from "@/lib/server/payments";
import { readGatewayForm } from "@/lib/server/gateway-callback";

export const dynamic = "force-dynamic";

/**
 * Instant Payment Notification (server-to-server webhook). Configure this URL
 * in the SSLCommerz merchant panel. Idempotent with the success redirect.
 */
export async function POST(req: Request) {
  const f = await readGatewayForm(req);
  if (!f.tran_id) return NextResponse.json({ ok: false, error: "missing tran_id" }, { status: 400 });
  if ((f.status === "VALID" || f.status === "VALIDATED") && f.val_id) {
    const outcome = await finalizePayment(f.val_id, f.tran_id);
    return NextResponse.json({ ok: outcome.ok });
  }
  if (f.status === "FAILED" || f.status === "CANCELLED" || f.status === "UNATTEMPTED" || f.status === "EXPIRED") {
    await markPaymentClosed(f.tran_id, f.status === "CANCELLED" ? "cancelled" : "failed", `IPN: ${f.status}`).catch(() => null);
  }
  return NextResponse.json({ ok: true });
}
