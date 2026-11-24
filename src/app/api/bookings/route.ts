import { NextResponse } from "next/server";
import { adminDb, COL } from "@/lib/firebase/admin";
import { requireApiUser } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/api";
import { createBookingDoc, parseContact, parseEvent, parseItems, priceFromCatalog } from "@/lib/server/bookings";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const user = await requireApiUser();
  const snap = await adminDb().collection(COL.bookings).where("customerId", "==", user.uid).orderBy("createdAt", "desc").limit(100).get();
  return NextResponse.json({ bookings: snap.docs.map((d) => d.data() as Booking) });
});

/** Creates a booking. Prices come only from the server-side catalogue. */
export const POST = handle(async (req: Request) => {
  const user = await requireApiUser();
  const body = await readJson(req);
  const items = parseItems(body.items);
  const event = parseEvent(body.event);
  const contact = parseContact(body.contact);
  const { lines, pricing } = await priceFromCatalog(items);
  const booking = await createBookingDoc(user, { contact, event, lines, pricing });
  return NextResponse.json({ id: booking.id, code: booking.code, pricing: booking.pricing }, { status: 201 });
});
