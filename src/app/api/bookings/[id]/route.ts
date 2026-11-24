import { NextResponse } from "next/server";
import { adminDb, COL } from "@/lib/firebase/admin";
import { ApiError, requireApiUser } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/api";
import { getBookingForUser } from "@/lib/server/bookings";
import { writeEventUpdate, writeNotification } from "@/lib/server/notify";
import { oneOf, str } from "@/lib/validation";
import type { Booking, BookingRequest, EventUpdate, MonitoringAssignment, PaymentRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

/** Booking detail with monitoring status, customer-visible updates and payments. */
export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireApiUser();
  const { id } = await params;
  const booking = await getBookingForUser(id, user);
  const db = adminDb();
  const isStaff = user.role === "admin" || (user.role === "agent" && booking.monitoring?.agentId === user.uid);
  const [aSnap, uSnap, pSnap] = await Promise.all([
    db.collection(COL.monitoringAssignments).doc(id).get(),
    db.collection(COL.eventUpdates).where("bookingId", "==", id).orderBy("createdAt", "desc").limit(100).get(),
    db.collection(COL.payments).where("bookingId", "==", id).get(),
  ]);
  const updates = uSnap.docs.map((d) => d.data() as EventUpdate).filter((u) => isStaff || u.visibility === "customer");
  const payments = pSnap.docs.map((d) => d.data() as PaymentRecord).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((p) => ({ id: p.id, status: p.status, amount: p.amount, mode: p.mode, cardType: p.cardType ?? null, createdAt: p.createdAt, paidAt: p.paidAt ?? null }));
  return NextResponse.json({ booking, assignment: aSnap.exists ? (aSnap.data() as MonitoringAssignment) : null, updates, payments });
});

/** Customer cancellation / modification requests (reviewed by admins). */
export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireApiUser();
  const { id } = await params;
  const body = await readJson(req);
  const type = oneOf(body.type, "Request type", ["cancellation", "modification"] as const);
  const message = str(body.message, "Message", { max: 1500, min: 5 });
  const db = adminDb();
  const ref = db.collection(COL.bookings).doc(id);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ApiError(404, "Booking not found.");
    const b = snap.data() as Booking;
    if (b.customerId !== user.uid) throw new ApiError(404, "Booking not found.");
    if (["cancelled", "completed", "rejected"].includes(b.status)) throw new ApiError(409, "This booking can no longer be changed.");
    if (b.requests?.some((r) => r.status === "open" && r.type === type)) throw new ApiError(409, `You already have an open ${type} request.`);
    const now = new Date().toISOString();
    const request: BookingRequest = { type, message, status: "open", createdAt: now };
    tx.update(ref, {
      requests: [...(b.requests ?? []), request],
      ...(type === "cancellation" && b.status !== "pending_payment" ? { status: "cancellation_requested" } : {}),
      ...(type === "cancellation" && b.status === "pending_payment" ? { status: "cancelled" } : {}),
      updatedAt: now,
    });
    writeEventUpdate(db, { bookingId: id, authorId: user.uid, authorName: user.name, type: "status", visibility: "customer", message: type === "cancellation" ? (b.status === "pending_payment" ? "Unpaid booking cancelled by customer." : "Customer requested cancellation.") : `Customer requested a modification: ${message}` }, tx);
    writeNotification(db, { userId: "admins", title: `${type === "cancellation" ? "Cancellation" : "Modification"} request`, body: `${b.code}: ${message.slice(0, 120)}`, link: "/admin/bookings" }, tx);
  });
  return NextResponse.json({ ok: true });
});
