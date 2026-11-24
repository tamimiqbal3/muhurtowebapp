import { NextResponse } from "next/server";
import { requireApiRole } from "@/lib/server/auth";
import { handle } from "@/lib/server/api";
import { listAssignments } from "@/lib/server/agent";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const user = await requireApiRole("agent");
  return NextResponse.json({ assignments: await listAssignments(user) });
});
