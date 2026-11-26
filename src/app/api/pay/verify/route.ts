import { NextResponse } from "next/server";
import { handle } from "@/lib/server/api";
import { ApiError } from "@/lib/server/auth";
import { validatePayment } from "@/lib/server/gateway";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: Request) => {
  const valId = new URL(req.url).searchParams.get("val_id")?.slice(0, 80) ?? "";
  if (!valId) throw new ApiError(400, "Missing payment reference.");
  return NextResponse.json(await validatePayment(valId));
});
