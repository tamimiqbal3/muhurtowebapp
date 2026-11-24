import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/api";
import { createResource, listResource } from "@/lib/server/admin";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ resource: string }> };

/** Every admin endpoint verifies the session and admin role on the server. */
export const GET = handle(async (req: Request, { params }: Ctx) => {
  await requireApiRole("admin");
  const { resource } = await params;
  return NextResponse.json(await listResource(resource, new URL(req.url)));
});

export const POST = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireApiRole("admin");
  const { resource } = await params;
  const body = resource === "upload" ? {} : await readJson(req);
  return NextResponse.json(await createResource(resource, body, user, req), { status: 201 });
});
