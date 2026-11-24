import { NextResponse } from "next/server";
import { adminDb, COL, isAdminConfigured } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/server/auth";
import { fail, handle, readJson } from "@/lib/server/api";
import { writeNotification } from "@/lib/server/notify";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { email, str } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Contact form & support requests → supportRequests collection. */
export const POST = handle(async (req: Request) => {
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000)) return fail(429, "Too many messages — please try again later.");
  const body = await readJson(req);
  if (typeof body.website === "string" && body.website) return NextResponse.json({ ok: true }); // honeypot
  const data = {
    name: str(body.name, "Name", { max: 100 }),
    email: email(body.email),
    phone: str(body.phone, "Phone", { max: 20, required: false }),
    subject: str(body.subject, "Subject", { max: 120 }),
    message: str(body.message, "Message", { max: 3000, min: 10 }),
  };
  if (!isAdminConfigured()) return fail(503, "Our contact inbox isn't connected yet. Please email hello@muhurto.app or call us instead.");
  const user = await getSessionUser();
  const db = adminDb();
  const ref = db.collection(COL.supportRequests).doc();
  await ref.set({ ...data, id: ref.id, userId: user?.uid ?? null, status: "open", createdAt: new Date().toISOString() });
  await writeNotification(db, { userId: "admins", title: "New support request", body: `${data.subject} — ${data.name}`, link: "/admin" });
  return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
});
