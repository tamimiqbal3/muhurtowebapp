import "server-only";
import { CATEGORY_SLUGS } from "../../data/categories";
import { emptyRequirements, parseRequirementsFallback } from "../planner/parse";
import { recommendByRules, resolveSubPlans } from "../planner/recommend";
import { EVENT_SUBS, FOOD_SUBS, SUB_LABELS } from "../planner/constants";
import { priceItems, suggestedQuantity } from "../pricing";
import { servesCity } from "../search";
import type { CategorySlug, PlannerRecommendationItem, PlannerRequirements, PlannerResult } from "../types";
import { getCatalogLookups } from "./catalog";
import { geminiJSON, isGeminiConfigured } from "./gemini";

const ALL_SUBS = [...EVENT_SUBS, ...FOOD_SUBS] as string[];

export function sanitizeRequirements(raw: unknown): PlannerRequirements {
  const r = (raw ?? {}) as Record<string, unknown>;
  const num = (v: unknown, max: number) => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) && n > 0 ? Math.min(max, Math.round(n)) : null;
  };
  const s = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
  const date = s(r.date, 10);
  return {
    categorySlug: CATEGORY_SLUGS.includes(r.categorySlug as CategorySlug) ? (r.categorySlug as CategorySlug) : null,
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
    city: s(r.city, 60),
    budget: num(r.budget, 1_000_000_000),
    guests: num(r.guests, 20000),
    theme: s(r.theme, 80),
    services: Array.isArray(r.services) ? Array.from(new Set(r.services.filter((x): x is string => typeof x === "string" && ALL_SUBS.includes(x)))) : [],
    preferences: s(r.preferences, 1000),
  };
}

const PARSE_SYSTEM = `You extract event-planning requirements for MUHURTO, a Bangladeshi event platform.
Return ONLY JSON with keys: categorySlug (one of ${CATEGORY_SLUGS.join(", ")} or null), date (YYYY-MM-DD or null), city (Bangladeshi city name in English or null),
budget (number in BDT or null; "3 lakh" = 300000), guests (number or null), theme (short string or null),
services (array of zero or more of: ${ALL_SUBS.join(", ")}), preferences (short string or null).
Never invent values the user did not state. Today's date is ${new Date().toISOString().slice(0, 10)}.`;

/** Extracts requirements from free text with Gemini, falling back to rules. */
export async function parseRequirements(text: string, current: PlannerRequirements): Promise<{ requirements: PlannerRequirements; source: "gemini" | "rules" }> {
  const fallback = parseRequirementsFallback(text, current);
  if (!isGeminiConfigured()) return { requirements: fallback, source: "rules" };
  try {
    const raw = await geminiJSON<Record<string, unknown>>(PARSE_SYSTEM, `Current known requirements: ${JSON.stringify(current)}\nCustomer message: """${text.slice(0, 2000)}"""`);
    const g = sanitizeRequirements(raw);
    const merged: PlannerRequirements = {
      categorySlug: g.categorySlug ?? fallback.categorySlug,
      date: g.date ?? fallback.date,
      city: g.city ?? fallback.city,
      budget: g.budget ?? fallback.budget,
      guests: g.guests ?? fallback.guests,
      theme: g.theme ?? fallback.theme,
      services: g.services.length ? Array.from(new Set([...current.services, ...g.services])) : fallback.services,
      preferences: g.preferences ?? current.preferences,
    };
    return { requirements: merged, source: "gemini" };
  } catch (err) {
    console.error("[planner] Gemini parse failed, using rules", err);
    return { requirements: fallback, source: "rules" };
  }
}

const RECOMMEND_SYSTEM = `You are MUHURTO's event planning assistant for Bangladesh.
You may ONLY recommend services from the provided catalogue, using their exact "id" and option ids.
Never invent vendors, prices, availability or bookings. Prices are computed by the server, not by you.
Choose at most one service per requested sub-service unless the customer clearly needs more.
Respect the budget where possible and prefer services that serve the event city and match the theme.
Return ONLY JSON: {"summary": string (2-4 sentences, friendly, may include a short Bangla phrase),
"items": [{"serviceId": string, "optionIds": string[], "reason": string (one sentence)}],
"notes": string[] (practical tips, max 3)}.`;

export async function recommend(requirements: PlannerRequirements): Promise<PlannerResult> {
  const req = { ...emptyRequirements(), ...requirements };
  const { services, getService, getVendor } = await getCatalogLookups();
  const baseline = recommendByRules(req, services);
  let source: PlannerResult["source"] = "rules";
  let items: PlannerRecommendationItem[] = baseline.items;
  let notes = baseline.notes;
  let summary = buildRuleSummary(req);

  if (isGeminiConfigured()) {
    try {
      const plans = resolveSubPlans(req, services);
      const candidates = plans.flatMap((p) =>
        p.candidates
          .filter((s) => servesCity(s, req.city) || !p.candidates.some((c) => servesCity(c, req.city)))
          .map((s) => ({
            id: s.id, sub: p.sub, name: s.name, startingPriceBDT: s.startingPrice, unit: s.unit, minQuantity: s.minQuantity,
            estimatedCostForThisEvent: s.startingPrice * suggestedQuantity(s, req.guests),
            rating: s.rating, city: s.city, serviceAreas: s.serviceAreas, themes: s.themes,
            options: s.options.map((o) => ({ id: o.id, label: o.label, priceDeltaPerUnit: o.priceDelta })),
            summary: s.shortDescription,
          })),
      );
      const g = await geminiJSON<{ summary?: string; items?: Array<{ serviceId?: string; optionIds?: string[]; reason?: string }>; notes?: string[] }>(
        RECOMMEND_SYSTEM,
        `Customer requirements: ${JSON.stringify(req)}\nRequested sub-services: ${plans.map((p) => SUB_LABELS[p.sub]).join(", ")}\nRule-based baseline (valid fallback): ${JSON.stringify(baseline.items.map((i) => i.serviceId))}\nCatalogue: ${JSON.stringify(candidates)}`,
      );
      const allowed = new Map(candidates.map((c) => [c.id, c]));
      const chosen: PlannerRecommendationItem[] = [];
      for (const it of g.items ?? []) {
        if (!it.serviceId || !allowed.has(it.serviceId) || chosen.some((c) => c.serviceId === it.serviceId)) continue;
        const svc = getService(it.serviceId)!;
        chosen.push({
          serviceId: svc.id,
          quantity: suggestedQuantity(svc, req.guests),
          optionIds: (it.optionIds ?? []).filter((o) => svc.options.some((x) => x.id === o)),
          reason: (it.reason ?? "").slice(0, 300) || `Recommended ${SUB_LABELS[svc.subcategorySlug] ?? ""} option.`,
        });
      }
      if (chosen.length) {
        items = chosen;
        source = "gemini";
        summary = (g.summary ?? summary).slice(0, 800);
        notes = [...(g.notes ?? []).filter((n) => typeof n === "string").slice(0, 3).map((n) => n.slice(0, 300))];
      }
    } catch (err) {
      console.error("[planner] Gemini recommend failed, using rules", err);
    }
  }

  const priced = priceItems(items, getService, getVendor);
  const enriched = items
    .map((i) => ({ ...i, line: priced.lines.find((l) => l.serviceId === i.serviceId)! }))
    .filter((i) => i.line);
  const withinBudget = req.budget ? priced.pricing.total <= req.budget : null;
  if (req.budget && !withinBudget && source === "gemini") notes.push("The estimated total is above your stated budget — remove an option or ask us for a customised quote.");
  return { source, summary, items: enriched, estimate: priced.pricing, budget: req.budget, withinBudget, notes };
}

function buildRuleSummary(r: PlannerRequirements): string {
  const parts = [
    r.categorySlug ? `a ${r.categorySlug.replace("-", " ")}` : "your event",
    r.city ? `in ${r.city}` : "",
    r.guests ? `for about ${r.guests} guests` : "",
    r.budget ? `with a budget of ৳${r.budget.toLocaleString("en-IN")}` : "",
  ].filter(Boolean);
  return `Here is a starting plan for ${parts.join(" ")}. Each pick is a real MUHURTO listing chosen for rating, location${r.theme ? ", your theme" : ""} and budget fit. Prices below are estimates until you confirm a booking.`;
}
