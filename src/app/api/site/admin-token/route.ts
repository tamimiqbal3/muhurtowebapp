import { NextResponse } from "next/server";
import { handle } from "@/lib/server/api";
import { ApiError } from "@/lib/server/auth";
import { adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { isAdminRequest } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

/**
 * Lets the signed-in admin panel sign into Firebase as "muhurto-admin" (custom claim admin:true),
 * so it can read the admin-only parts of Realtime Database (live alerts, visitors online).
 * Issued only after the admin session cookie is verified on the server.
 */
export const POST = handle(async () => {
  if (!(await isAdminRequest())) throw new ApiError(401, "Admin session required.");
  if (!isAdminConfigured()) throw new ApiError(503, "Firebase server access is not set up yet.");
  const token = await adminAuth().createCustomToken("muhurto-admin", { admin: true });
  return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
});
