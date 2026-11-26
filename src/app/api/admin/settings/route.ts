import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/api";
import { getSiteSettings, saveSiteSettings } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

/** Admin-only: read and replace the site settings. */
export const GET = handle(async () => {
  await requireApiRole("admin");
  return NextResponse.json(await getSiteSettings());
});

export const PUT = handle(async (req: Request) => {
  const user = await requireApiRole("admin");
  const body = await readJson(req);
  return NextResponse.json(await saveSiteSettings(body, user.uid));
});
