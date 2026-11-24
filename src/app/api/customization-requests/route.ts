import { NextResponse } from "next/server";
import { adminDb, COL } from "@/lib/firebase/admin";
import { requireApiUser } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/api";
import { parseEvent, parseItems, priceFromCatalog } from "@/lib/server/bookings";
import { writeNotification } from "@/lib/server/notify";
import { str } from "@/lib/validation";
import type { CustomizationRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const user = await requireApiUser();
  const snap = await adminDb().collection(COL.customizationRequests).where("customerId", "==", user.uid).orderBy("createdAt", "desc").limit(50).get();
  return NextResponse.json({ requests: snap.docs.map((d) => d.data() as CustomizationRequest) });
});

export const POST = handle(async (req: Request) => {
  const user = await requireApiUser();
  const body = await readJson(req);
  const items = parseItems(body.items);
  const event = parseEvent(body.event);
  const specialInstructions = str(body.specialInstructions, "Special instructions", { max: 3000, required: false });
  const { lines, pricing } = await priceFromCatalog(items);
  const db = adminDb();
  const ref = db.collection(COL.customizationRequests).doc();
  const now = new Date().toISOString();
  const doc: CustomizationRequest = {
    id: ref.id,
    customerId: user.uid,
    contact: { name: user.name, email: user.email, phone: user.profile?.phone ?? "" },
    event,
    lines,
    estimate: pricing,
    specialInstructions,
    status: "submitted",
    messages: specialInstructions ? [{ from: "customer", text: specialInstructions, at: now }] : [],
    revisedPlan: null,
    bookingId: null,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(doc);
  await writeNotification(db, { userId: "admins", title: "New customisation request", body: `${user.name} — ${event.categorySlug} on ${event.date} in ${event.city}`, link: "/admin/customizations" });
  return NextResponse.json({ id: ref.id }, { status: 201 });
});
