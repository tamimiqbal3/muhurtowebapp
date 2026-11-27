import { NextResponse } from "next/server";
import { handle, readJson } from "@/lib/server/api";
import { ApiError } from "@/lib/server/auth";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { removeItem, saveSiteSettings, seedData, SITE_COLLECTIONS, upsertItem, writeAll, type SiteCollection, type SiteData } from "@/lib/server/site-store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Admin changes to the catalogue and site content. Every request is checked against the admin session. */
export const POST = handle(async (req: Request) => {
  if (!(await isAdminRequest())) throw new ApiError(401, "Your admin session has ended. Please sign in again.");
  if (!isAdminConfigured()) throw new ApiError(503, "Firebase server access is not set up yet.");
  const b = await readJson<Record<string, unknown>>(req);
  const collection = b.collection as SiteCollection;
  const needCollection = () => { if (!SITE_COLLECTIONS.includes(collection)) throw new ApiError(400, "Unknown collection."); };

  switch (b.op) {
    case "upsert": {
      needCollection();
      if (!b.item || typeof b.item !== "object") throw new ApiError(400, "Missing item.");
      const item = await upsertItem(collection, b.item as Record<string, unknown>, typeof b.previousKey === "string" ? b.previousKey : undefined);
      return NextResponse.json({ ok: true, item });
    }
    case "remove":
      needCollection();
      await removeItem(collection, String(b.key ?? ""));
      return NextResponse.json({ ok: true });
    case "settings":
      return NextResponse.json({ ok: true, settings: await saveSiteSettings(b.settings) });
    case "replace": {
      const d = b.data as SiteData | undefined;
      if (!d || !SITE_COLLECTIONS.every((c) => Array.isArray(d[c]))) throw new ApiError(400, "Incomplete catalogue.");
      await writeAll(d);
      return NextResponse.json({ ok: true });
    }
    case "reset":
      await writeAll(seedData());
      return NextResponse.json({ ok: true });
    default:
      throw new ApiError(400, "Unknown operation.");
  }
});
