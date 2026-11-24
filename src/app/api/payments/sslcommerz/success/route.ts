import { finalizePayment } from "@/lib/server/payments";
import { readGatewayForm, redirectTo } from "@/lib/server/gateway-callback";

export const dynamic = "force-dynamic";

/** Browser redirect from SSLCommerz after payment. Never trusted on its own — we re-validate server-to-server. */
export async function POST(req: Request) {
  const f = await readGatewayForm(req);
  if (!f.val_id || !f.tran_id) return redirectTo(`/payment/failed?reason=${encodeURIComponent("Missing payment reference")}`);
  const outcome = await finalizePayment(f.val_id, f.tran_id);
  if (outcome.ok) return redirectTo(`/payment/success?booking=${outcome.bookingId}${outcome.duplicate ? "&duplicate=1" : ""}`);
  return redirectTo(`/payment/failed?${new URLSearchParams({ booking: outcome.bookingId ?? "", reason: outcome.reason })}`);
}

export const GET = POST;
