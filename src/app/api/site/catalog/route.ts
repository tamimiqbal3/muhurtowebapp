import { NextResponse } from "next/server";
import { handle } from "@/lib/server/api";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { publicView, readSite } from "@/lib/server/site-store";

export const dynamic = "force-dynamic";

/**
 * The live catalogue and site content from Realtime Database.
 *  - { configured: false }            → Firebase server access isn't set up (the site uses its bundled data)
 *  - { configured: true, data: null } → nothing published yet (bundled data until the first admin save)
 * Browsers call this with ?v=<version> when /site/version changes; a response for the current version is
 * cached by Vercel's CDN for that version, so Realtime Database is read once per change, not per visitor.
 */
export const GET = handle(async (req: Request) => {
  if (!isAdminConfigured()) return NextResponse.json({ configured: false }, { headers: { "Cache-Control": "public, s-maxage=60" } });
  const wanted = Number(new URL(req.url).searchParams.get("v") ?? NaN);
  const admin = new URL(req.url).searchParams.has("admin") && (await isAdminRequest());
  const { version, data } = await readSite();
  if (admin) return NextResponse.json({ configured: true, admin: true, version, data }, { headers: { "Cache-Control": "private, no-store" } });
  const cache = wanted === version && version > 0 ? "public, max-age=0, s-maxage=31536000, immutable" : "public, max-age=0, s-maxage=5, stale-while-revalidate=60";
  return NextResponse.json({ configured: true, version, data: data ? publicView(data) : null }, { headers: { "Cache-Control": cache } });
});
