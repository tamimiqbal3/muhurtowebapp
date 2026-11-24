import { markPaymentClosed } from "@/lib/server/payments";
import { readGatewayForm, redirectTo } from "@/lib/server/gateway-callback";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const f = await readGatewayForm(req);
  const bookingId = f.tran_id ? await markPaymentClosed(f.tran_id, "failed", f.error || "Payment failed at gateway").catch(() => null) : null;
  return redirectTo(`/payment/failed?${new URLSearchParams({ booking: bookingId ?? "", reason: "The payment was declined or failed." })}`);
}

export const GET = POST;
