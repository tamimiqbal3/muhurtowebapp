import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/server/api";
import { ApiError } from "@/lib/server/auth";
import { startPayment } from "@/lib/server/gateway";
import { getPaymentMethod } from "@/data/payments";

export const dynamic = "force-dynamic";

const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export const POST = handle(async (req: Request) => {
  const b = await readJson(req);
  const amount = Math.round(Number(b.amount) * 100) / 100;
  if (!Number.isFinite(amount) || amount < 10 || amount > 50_000_000) throw new ApiError(400, "The payment amount is not valid.");
  const bookingId = s(b.bookingId, 64), bookingCode = s(b.bookingCode, 20);
  if (!bookingId || !/^MH-[A-Z0-9]{4,10}$/.test(bookingCode)) throw new ApiError(400, "Booking not found.");
  const method = getPaymentMethod(s(b.method, 30));
  if (method?.kind === "bank") throw new ApiError(400, "Bank transfers are arranged by our team — choose another method to pay online.");
  const c = (b.customer ?? {}) as Record<string, unknown>;
  const customer = { name: s(c.name, 60) || "MUHURTO customer", email: s(c.email, 80), phone: s(c.phone, 20), area: s(c.area, 60) };
  if (!/^\S+@\S+\.\S+$/.test(customer.email)) throw new ApiError(400, "A valid email address is required for the payment receipt.");
  if (customer.phone.replace(/\D/g, "").length < 10) throw new ApiError(400, "A valid phone number is required for payment.");
  const origin = new URL(req.url).origin;
  const { url, tranId } = await startPayment({ bookingId, bookingCode, amount, method: method?.id ?? null, gatewayCode: method?.gatewayCode, customer, description: `MUHURTO booking ${bookingCode}` }, origin);
  return NextResponse.json({ url, tranId });
});
