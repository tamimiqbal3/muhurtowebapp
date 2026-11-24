import "server-only";
import { adminDb, COL } from "../firebase/admin";
import { CATEGORY_SLUGS } from "../../data/categories";
import { priceItems } from "../pricing";
import type { Booking, ContactDetails, EventDetails, PlanItemInput, PricedLine, PriceBreakdown } from "../types";
import { bdPhone, email, futureDate, int, oneOf, str, ValidationError } from "../validation";
import { ApiError, type SessionUser } from "./auth";
import { getCatalogLookups } from "./catalog";
import { writeNotification } from "./notify";

export function bookingCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `MH-${s}`;
}

export function parseEvent(raw: unknown): EventDetails {
  const e = (raw ?? {}) as Record<string, unknown>;
  return {
    categorySlug: oneOf(e.categorySlug, "Event category", CATEGORY_SLUGS),
    date: futureDate(e.date),
    city: str(e.city, "City", { max: 60 }),
    venue: str(e.venue, "Venue", { max: 200 }),
    guests: int(e.guests, "Guests", 1, 10000),
    theme: str(e.theme, "Theme", { max: 80, required: false }),
    notes: str(e.notes, "Notes", { max: 2000, required: false }),
  };
}

export function parseContact(raw: unknown): ContactDetails {
  const c = (raw ?? {}) as Record<string, unknown>;
  return { name: str(c.name, "Name", { max: 100 }), phone: bdPhone(c.phone), email: email(c.email) };
}

export function parseItems(raw: unknown): PlanItemInput[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new ValidationError("Select at least one service.");
  return raw.slice(0, 25).map((i) => {
    const o = (i ?? {}) as Record<string, unknown>;
    return { serviceId: String(o.serviceId ?? ""), quantity: Number(o.quantity ?? 1), optionIds: Array.isArray(o.optionIds) ? o.optionIds.map(String) : [] };
  });
}

/** Prices items from the catalogue (never from the client). */
export async function priceFromCatalog(items: PlanItemInput[]) {
  const { getService, getVendor } = await getCatalogLookups();
  const result = priceItems(items, getService, getVendor);
  if (result.errors.length) throw new ValidationError(result.errors.join(" "));
  if (!result.lines.length) throw new ValidationError("Select at least one available service.");
  return result;
}

export async function createBookingDoc(user: SessionUser, args: { contact: ContactDetails; event: EventDetails; lines: PricedLine[]; pricing: PriceBreakdown; customizationRequestId?: string | null }): Promise<Booking> {
  const db = adminDb();
  const ref = db.collection(COL.bookings).doc();
  const now = new Date().toISOString();
  const booking: Booking = {
    id: ref.id,
    code: bookingCode(),
    customerId: user.uid,
    contact: args.contact,
    event: args.event,
    lines: args.lines,
    pricing: args.pricing,
    status: "pending_payment",
    paymentStatus: "unpaid",
    monitoring: { status: "not_started", agentId: null, agentName: null, agentPhone: null },
    requests: [],
    customizationRequestId: args.customizationRequestId ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(booking);
  await writeNotification(db, { userId: user.uid, title: "Booking created", body: `Booking ${booking.code} is awaiting payment.`, link: `/checkout?booking=${ref.id}` });
  return booking;
}

export async function getBooking(id: string): Promise<Booking | null> {
  const snap = await adminDb().collection(COL.bookings).doc(id).get();
  return snap.exists ? (snap.data() as Booking) : null;
}

/** Owner, admin, or the assigned monitoring agent may read a booking. */
export async function getBookingForUser(id: string, user: SessionUser): Promise<Booking> {
  const booking = await getBooking(id);
  if (!booking) throw new ApiError(404, "Booking not found.");
  const allowed = booking.customerId === user.uid || user.role === "admin" || (user.role === "agent" && booking.monitoring?.agentId === user.uid);
  if (!allowed) throw new ApiError(404, "Booking not found.");
  return booking;
}
