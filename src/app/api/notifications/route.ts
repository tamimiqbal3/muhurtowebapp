import { NextResponse } from "next/server";
import { adminDb, COL } from "@/lib/firebase/admin";
import { requireApiUser } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/api";
import type { AppNotification } from "@/lib/types";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const user = await requireApiUser();
  const db = adminDb();
  const ids = user.role === "admin" ? [user.uid, "admins"] : [user.uid];
  const snap = await db.collection(COL.notifications).where("userId", "in", ids).orderBy("createdAt", "desc").limit(40).get();
  return NextResponse.json({ notifications: snap.docs.map((d) => d.data() as AppNotification) });
});

export const PATCH = handle(async (req: Request) => {
  const user = await requireApiUser();
  const body = await readJson<{ ids?: string[] }>(req);
  const db = adminDb();
  const ids = Array.isArray(body.ids) ? body.ids.slice(0, 50).map(String) : [];
  const batch = db.batch();
  for (const id of ids) {
    const ref = db.collection(COL.notifications).doc(id);
    const snap = await ref.get();
    const n = snap.data() as AppNotification | undefined;
    if (n && (n.userId === user.uid || (n.userId === "admins" && user.role === "admin"))) batch.update(ref, { read: true });
  }
  await batch.commit();
  return NextResponse.json({ ok: true });
});
