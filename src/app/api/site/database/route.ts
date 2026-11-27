import { NextResponse } from "next/server";
import { databaseURL, isAdminConfigured } from "@/lib/firebase/admin";
import { firebaseClientConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

/** The project's real Realtime Database address, for browsers (cached by the CDN for an hour). */
export async function GET() {
  const url = isAdminConfigured() ? await databaseURL().catch(() => firebaseClientConfig.databaseURL) : firebaseClientConfig.databaseURL;
  return NextResponse.json({ url }, { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" } });
}
