import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/server/auth";
import { handle, readJson } from "@/lib/server/api";
import { agentUpdate, getAssignmentDetail } from "@/lib/server/agent";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireApiRole("agent");
  const { id } = await params;
  return NextResponse.json(await getAssignmentDetail(id, user));
});

export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  const user = await requireApiRole("agent");
  const { id } = await params;
  return NextResponse.json(await agentUpdate(id, user, await readJson(req)));
});
