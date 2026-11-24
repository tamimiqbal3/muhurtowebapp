import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/api";
import { initPayment, sslcommerzConfig } from "@/lib/server/payments";
import { str } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = sslcommerzConfig();
  return NextResponse.json({ configured: cfg.configured, sandbox: cfg.sandbox });
}

export const POST = handle(async (req: Request) => {
  const user = await requireApiUser();
  const body = await readJson(req);
  const bookingId = str(body.bookingId, "Booking", { max: 64 });
  const { url } = await initPayment(bookingId, user);
  return NextResponse.json({ url });
});
