import { NextResponse } from "next/server";
import { adminDb, COL } from "@/lib/firebase/admin";
import { ApiError, requireApiUser } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/api";
import { createBookingDoc, parseContact } from "@/lib/server/bookings";
import { writeNotification } from "@/lib/server/notify";
import { futureDate, oneOf, str } from "@/lib/validation";
import type { CustomizationRequest } from "@/lib/types";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

/**
 * Customer actions on their own request:
 *  - message: add a message for the team
 *  - request_changes: ask for another revision
 *  - accept: approve the revised plan → creates a booking priced from the
 *    admin's revised plan (set server-side, never from the client)
 *  - close: withdraw the request
 */
export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireApiUser();
  const { id } = await params;
  const body = await readJson(req);
  const action = oneOf(body.action, "Action", ["message", "request_changes", "accept", "close"] as const);
  const db = adminDb();
  const ref = db.collection(COL.customizationRequests).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new ApiError(404, "Request not found.");
  const r = snap.data() as CustomizationRequest;
  if (r.customerId !== user.uid) throw new ApiError(404, "Request not found.");
  if (r.status === "accepted" || r.status === "closed") throw new ApiError(409, "This request is already closed.");
  const now = new Date().toISOString();

  if (action === "message" || action === "request_changes") {
    const text = str(body.text, "Message", { max: 2000, min: 2 });
    await ref.update({ messages: [...r.messages, { from: "customer", text, at: now }], status: action === "request_changes" ? "changes_requested" : r.status, updatedAt: now });
    await writeNotification(db, { userId: "admins", title: action === "request_changes" ? "Changes requested" : "New customer message", body: text.slice(0, 140), link: "/admin/customizations" });
    return NextResponse.json({ ok: true });
  }
  if (action === "close") {
    await ref.update({ status: "closed", updatedAt: now });
    return NextResponse.json({ ok: true });
  }
  // accept
  if (r.status !== "responded" || !r.revisedPlan) throw new ApiError(409, "There is no updated plan to approve yet.");
  const date = futureDate(r.event.date);
  const contact = parseContact({ name: r.contact.name || user.name, email: r.contact.email || user.email, phone: body.phone ?? r.contact.phone });
  const venue = str(body.venue ?? r.event.venue, "Venue", { max: 200 });
  const booking = await createBookingDoc(user, {
    contact,
    event: { ...r.event, date, venue },
    lines: r.revisedPlan.lines,
    pricing: r.revisedPlan.pricing,
    customizationRequestId: r.id,
  });
  await ref.update({ status: "accepted", bookingId: booking.id, updatedAt: now });
  return NextResponse.json({ ok: true, bookingId: booking.id });
});
