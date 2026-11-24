import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/auth";
import { adminDb, COL, isAdminConfigured } from "@/lib/firebase/admin";
import { handle, readJson } from "@/lib/server/api";
import { requireApiUser } from "@/lib/server/auth";
import { bdPhone, str } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json(
    {
      configured: isAdminConfigured(),
      user: user ? { uid: user.uid, email: user.email, name: user.name, role: user.role, phone: user.profile?.phone ?? "", city: user.profile?.city ?? "" } : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export const PATCH = handle(async (req: Request) => {
  const user = await requireApiUser();
  const body = await readJson(req);
  const patch = {
    name: str(body.name, "Name", { max: 100 }),
    phone: body.phone ? bdPhone(body.phone) : "",
    city: str(body.city, "City", { max: 60, required: false }),
    updatedAt: new Date().toISOString(),
  };
  await adminDb().collection(COL.users).doc(user.uid).set(patch, { merge: true });
  return NextResponse.json({ ok: true });
});
