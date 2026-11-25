import { NextResponse } from "next/server";
import { fail, handle, readJson } from "@/lib/server/api";
import { parseRequirements, recommend, sanitizeRequirements } from "@/lib/server/planner";
import { isGeminiConfigured } from "@/lib/server/gemini";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { getLang } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  return NextResponse.json({ ai: isGeminiConfigured() });
}

export const POST = handle(async (req: Request) => {
  if (!rateLimit(`planner:${clientIp(req)}`, 30, 60_000)) return fail(429, "You're sending requests very quickly — please wait a moment.");
  const body = await readJson<{ mode?: string; text?: string; requirements?: unknown }>(req);
  const current = sanitizeRequirements(body.requirements);
  if (body.mode === "parse") {
    const text = typeof body.text === "string" ? body.text.slice(0, 2000) : "";
    if (!text.trim()) return fail(400, "Please describe your event.");
    const result = await parseRequirements(text, current);
    return NextResponse.json(result);
  }
  if (body.mode === "recommend") {
    if (!current.categorySlug) return fail(400, "Please choose an event category first.");
    const result = await recommend(current, await getLang());
    return NextResponse.json(result);
  }
  return fail(400, "Unknown planner mode.");
});
