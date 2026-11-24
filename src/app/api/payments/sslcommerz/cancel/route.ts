import { markPaymentClosed } from "@/lib/server/payments";
import { readGatewayForm, redirectTo } from "@/lib/server/gateway-callback";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const f = await readGatewayForm(req);
  const bookingId = f.tran_id ? await markPaymentClosed(f.tran_id, "cancelled", "Cancelled by customer").catch(() => null) : null;
  return redirectTo(`/payment/failed?${new URLSearchParams({ booking: bookingId ?? "", reason: "You cancelled the payment. No money was taken." })}`);
}

export const GET = POST;
