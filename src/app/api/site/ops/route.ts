import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/server/api";
import { ApiError } from "@/lib/server/auth";
import { adminDb, COL, isAdminConfigured } from "@/lib/firebase/admin";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { listOps } from "@/lib/server/ops";

export const dynamic = "force-dynamic";

const STATUSES = ["pending_payment", "confirmed", "in_progress", "completed", "cancellation_requested", "cancelled", "rejected"];

async function guard() {
  if (!(await isAdminRequest())) throw new ApiError(401, "Your admin session has ended. Please sign in again.");
}

/** Bookings, payments and customers for the admin panel (Firestore). */
export const GET = handle(async () => {
  if (!isAdminConfigured()) return NextResponse.json({ configured: false });
  await guard();
  return NextResponse.json({ configured: true, ...(await listOps()) }, { headers: { "Cache-Control": "private, no-store" } });
});

/** Change a booking's status. */
export const PATCH = handle(async (req: Request) => {
  await guard();
  if (!isAdminConfigured()) throw new ApiError(503, "Firebase server access is not set up yet.");
  const b = await readJson<{ id?: string; status?: string }>(req);
  if (!b.id || !/^[\w-]{1,64}$/.test(b.id)) throw new ApiError(400, "Unknown booking.");
  if (!b.status || !STATUSES.includes(b.status)) throw new ApiError(400, "Unknown status.");
  await adminDb().collection(COL.bookings).doc(b.id).update({ status: b.status, updatedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
});

/** Delete a booking (its payment records are kept for accounting). */
export const DELETE = handle(async (req: Request) => {
  await guard();
  if (!isAdminConfigured()) throw new ApiError(503, "Firebase server access is not set up yet.");
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[\w-]{1,64}$/.test(id)) throw new ApiError(400, "Unknown booking.");
  await adminDb().collection(COL.bookings).doc(id).delete();
  return NextResponse.json({ ok: true });
});
