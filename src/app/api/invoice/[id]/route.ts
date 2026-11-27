import { NextResponse } from "next/server";
import { handle } from "@/lib/server/api";
import { ApiError, getSessionUser } from "@/lib/server/auth";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { getBooking } from "@/lib/server/bookings";
import { paidPaymentFor, toPaymentView } from "@/lib/server/ops";

export const dynamic = "force-dynamic";

/** A booking's invoice data — for its customer or the admin only. */
export const GET = handle(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  if (!isAdminConfigured()) return NextResponse.json({ configured: false });
  const { id } = await params;
  const [admin, user, booking] = await Promise.all([isAdminRequest(), getSessionUser(), getBooking(id.slice(0, 64))]);
  if (!booking || (!admin && (!user || (booking.customerId !== user.uid && user.role !== "admin")))) throw new ApiError(404, "Invoice not found.");
  const payment = await paidPaymentFor(booking.id);
  return NextResponse.json({ configured: true, booking, payment: payment ? toPaymentView(payment) : null }, { headers: { "Cache-Control": "private, no-store" } });
});
