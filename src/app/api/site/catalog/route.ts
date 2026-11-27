import { NextResponse } from "next/server";
import { handle } from "@/lib/server/api";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { publicView, readSite } from "@/lib/server/site-store";

export const dynamic = "force-dynamic";

/**
 * The live catalogue and site content from Firestore.
 *  - { configured: false }  → Firebase server access isn't set up yet (the site uses its bundled data)
 *  - { configured: true, data: null } → Firestore is empty (bundled data until the first admin save)
 * Visitors get a CDN-cached public view; the signed-in admin gets everything, uncached.
 */
export const GET = handle(async () => {
  if (!isAdminConfigured()) return NextResponse.json({ configured: false }, { headers: { "Cache-Control": "public, s-maxage=60" } });
  const admin = await isAdminRequest();
  const data = await readSite(admin);
  if (admin) return NextResponse.json({ configured: true, admin: true, data }, { headers: { "Cache-Control": "private, no-store" } });
  return NextResponse.json(
    { configured: true, data: data ? publicView(data) : null },
    { headers: { "Cache-Control": "public, max-age=0, s-maxage=10, stale-while-revalidate=300" } },
  );
});
