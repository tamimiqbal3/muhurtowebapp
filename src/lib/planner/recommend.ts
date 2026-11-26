import type { CategorySlug, PlannerRecommendationItem, PlannerRequirements, Service } from "../types";
import { servesCity } from "../search";
import { lineAmount, suggestedQuantity } from "../pricing";
import { PLATFORM_FEE_RATE } from "../config";
import { makeT, type TFn } from "../i18n/core";
import { CORE_SUBS, DEFAULT_SUBS, EXTRA_SUBS, FOOD_SUBS, SUB_LABELS, SUB_WEIGHTS } from "./constants";

export interface SubPlan {
  sub: string;
  categorySlug: CategorySlug;
  candidates: Service[];
}

/** Which category each requested sub-service should be drawn from. */
export function resolveSubPlans(req: PlannerRequirements, services: Service[]): SubPlan[] {
  const category: CategorySlug = req.categorySlug ?? "wedding";
  const subs = req.services.length ? req.services : DEFAULT_SUBS[category] ?? DEFAULT_SUBS.wedding;
  const plans: SubPlan[] = [];
  for (const sub of Array.from(new Set(subs))) {
    const cat: CategorySlug = (FOOD_SUBS as readonly string[]).includes(sub) ? "food-culinary" : category === "food-culinary" ? "wedding" : category;
    const all = services.filter((s) => s.active !== false && s.categorySlug === cat && s.subcategorySlug === sub);
    const sized = req.guests ? all.filter((s) => !s.maxGuests || s.maxGuests >= req.guests!) : all;
    const candidates = sized.length ? sized : all;
    if (candidates.length) plans.push({ sub, categorySlug: cat, candidates });
  }
  return plans;
}

function themeMatch(s: Service, theme: string | null): boolean {
  if (!theme) return false;
  const t = theme.toLowerCase();
  return s.themes.some((x) => x.toLowerCase().includes(t) || t.includes(x.toLowerCase()));
}

export function costOf(s: Service, guests: number | null): number {
  return lineAmount(s.unit, s.startingPrice, suggestedQuantity(s, guests));
}

const withFee = (n: number) => n * (1 + PLATFORM_FEE_RATE);

/** Candidates that serve the city; if none do, every candidate (with a note). */
function localPool(plan: SubPlan, city: string | null): { pool: Service[]; local: boolean } {
  const local = plan.candidates.filter((s) => servesCity(s, city));
  return local.length ? { pool: local, local: true } : { pool: plan.candidates, local: !city };
}

function rank(pool: Service[], req: PlannerRequirements): Service[] {
  const score = (s: Service) => s.rating * 10 + (s.featured ? 6 : 0) + (themeMatch(s, req.theme) ? 4 : 0) + (req.city && s.city === req.city ? 2 : 0);
  return [...pool].sort((a, b) => score(b) - score(a));
}

/**
 * Deterministic recommender. Allocates the budget across the core
 * sub-services using typical Bangladeshi spend ratios, picks the best-rated
 * listing that fits each allocation (preferring the city and theme), then
 * adds extra services only while they still fit. Used as the Gemini
 * fallback and as Gemini's baseline. Never invents listings or prices.
 */
export function recommendByRules(req: PlannerRequirements, services: Service[], t: TFn = makeT("en"), cityLabel: (c: string) => string = (c) => c): { items: PlannerRecommendationItem[]; notes: string[] } {
  const label = (sub: string) => t(SUB_LABELS[sub] ?? sub);
  const notes: string[] = [];
  const guests = req.guests ?? null;
  const category: CategorySlug = req.categorySlug ?? "wedding";
  const explicit = req.services.length > 0;
  const coreSubs = explicit ? req.services : req.budget ? CORE_SUBS[category] ?? CORE_SUBS.wedding : DEFAULT_SUBS[category] ?? DEFAULT_SUBS.wedding;
  const extraSubs = explicit || !req.budget ? [] : EXTRA_SUBS[category] ?? [];

  const corePlans = resolveSubPlans({ ...req, services: coreSubs }, services);
  const totalWeight = corePlans.reduce((s, p) => s + (SUB_WEIGHTS[p.sub] ?? 0.05), 0) || 1;

  const picks: Array<{ plan: SubPlan; service: Service; cost: number }> = [];
  for (const plan of corePlans) {
    const { pool, local } = localPool(plan, req.city);
    if (!local) notes.push(t("No {sub} listing currently lists {city} as a service area; the closest option is shown — confirm travel with us.", { sub: label(plan.sub), city: cityLabel(req.city ?? "") }));
    const allocation = req.budget ? (req.budget / (1 + PLATFORM_FEE_RATE)) * ((SUB_WEIGHTS[plan.sub] ?? 0.05) / totalWeight) : Infinity;
    const ranked = rank(pool, req);
    const fitting = ranked.find((s) => costOf(s, guests) <= allocation * 1.15);
    const cheapest = [...pool].sort((a, b) => costOf(a, guests) - costOf(b, guests))[0];
    const service = fitting ?? cheapest;
    picks.push({ plan, service, cost: costOf(service, guests) });
  }

  let total = picks.reduce((s, p) => s + p.cost, 0);
  if (req.budget) {
    // Swap the priciest picks for cheaper local alternatives until within budget.
    for (let guard = 0; withFee(total) > req.budget && guard < 30; guard++) {
      let swapped = false;
      for (const p of [...picks].sort((a, b) => b.cost - a.cost)) {
        const cheaper = localPool(p.plan, req.city)
          .pool.map((s) => ({ s, c: costOf(s, guests) }))
          .filter((x) => x.c < p.cost)
          .sort((a, b) => b.c - a.c)[0];
        if (cheaper) {
          total -= p.cost - cheaper.c;
          Object.assign(p, { service: cheaper.s, cost: cheaper.c });
          swapped = true;
          break;
        }
      }
      if (!swapped) break;
    }
    // Still over: drop the lowest-priority core items the customer didn't ask for explicitly.
    if (!explicit) {
      while (withFee(total) > req.budget && picks.length > 1) {
        const dropped = picks.pop()!;
        total -= dropped.cost;
        const dl = label(dropped.plan.sub);
        for (let i = notes.length - 1; i >= 0; i--) if (notes[i].includes(dl)) notes.splice(i, 1);
        notes.push(t("{sub} was left out to stay within budget — you can still add it to your plan.", { sub: dl }));
      }
    }
    // Add extras that still fit the remaining budget.
    const skipped: string[] = [];
    const chosenSubs = new Set(picks.map((p) => p.plan.sub));
    for (const plan of extraSubs.length ? resolveSubPlans({ ...req, services: extraSubs.filter((x) => !chosenSubs.has(x)) }, services) : []) {
      const remaining = req.budget / (1 + PLATFORM_FEE_RATE) - total;
      const { pool } = localPool(plan, req.city);
      const fit = rank(pool, req).find((s) => costOf(s, guests) <= remaining);
      if (fit) {
        picks.push({ plan, service: fit, cost: costOf(fit, guests) });
        total += costOf(fit, guests);
      } else {
        skipped.push(label(plan.sub));
      }
    }
    if (skipped.length) notes.push(t("Not included to stay within budget: {list}. You can still add them to your plan.", { list: skipped.join(", ") }));
    if (withFee(total) > req.budget) notes.push(t("Even the most affordable combination is above your budget. Consider fewer services or guests, or contact our team for alternatives."));
    else if (withFee(total) < req.budget * 0.7) notes.push(t("This plan leaves room in your budget for upgrades such as fresh flowers, drone coverage or a photo booth."));
  }

  const items: PlannerRecommendationItem[] = picks.map(({ plan, service }) => {
    const bits = [t("rated {r}★ across {n} reviews", { r: service.rating.toFixed(1), n: service.reviewCount })];
    if (themeMatch(service, req.theme)) bits.push(t("matches your chosen theme"));
    if (req.city && servesCity(service, req.city)) bits.push(t("serves {city}", { city: cityLabel(req.city) }));
    return {
      serviceId: service.id,
      quantity: suggestedQuantity(service, guests),
      optionIds: [],
      reason: t("Best-fit {sub}: {bits}.", { sub: label(plan.sub), bits: bits.join(", ") }),
    };
  });
  return { items, notes };
}
