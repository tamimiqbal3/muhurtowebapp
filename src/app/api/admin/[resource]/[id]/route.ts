import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/api";
import { deleteResource, updateResource } from "@/lib/server/admin";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ resource: string; id: string }> };

export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireApiRole("admin");
  const { resource, id } = await params;
  return NextResponse.json(await updateResource(resource, id, await readJson(req), user));
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  await requireApiRole("admin");
  const { resource, id } = await params;
  return NextResponse.json(await deleteResource(resource, id));
});
