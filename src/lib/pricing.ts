import { PLATFORM_FEE_RATE } from "./config";
import type { PlanItemInput, PriceBreakdown, PricedLine, Service, Vendor } from "./types";

export const MAX_QUANTITY = 5000;
export const MAX_LINES = 25;

/** 2% platform fee, rounded to the nearest taka. */
export function computeBreakdown(subtotal: number, rate = PLATFORM_FEE_RATE): PriceBreakdown {
  const safeSubtotal = Math.max(0, Math.round(subtotal));
  const platformFee = Math.round(safeSubtotal * rate);
  return { subtotal: safeSubtotal, platformFeeRate: rate, platformFee, total: safeSubtotal + platformFee, currency: "BDT" };
}

export function unitLabel(unit: Service["unit"], qty = 1): string {
  const map: Record<Service["unit"], [string, string]> = {
    per50: ["guest", "guests"],
    event: ["event", "events"],
    guest: ["guest", "guests"],
    plate: ["plate", "plates"],
    cup: ["cup", "cups"],
    hour: ["hour", "hours"],
  };
  return qty === 1 ? map[unit][0] : map[unit][1];
}

/** Price suffix shown next to a listed price. */
export function priceSuffix(unit: Service["unit"]): string {
  return unit === "per50" ? "per 50 guests" : unit === "guest" ? "per person" : `per ${unitLabel(unit)}`;
}

/** Number of 50-guest blocks billed for a guest count. */
export const blocksOf50 = (guests: number) => Math.max(1, Math.ceil(Math.max(0, guests) / 50));

/** Line amount: per-50 services are billed per started block of 50 guests; others per unit. */
export function lineAmount(unit: Service["unit"], unitPrice: number, quantity: number): number {
  return unit === "per50" ? unitPrice * blocksOf50(quantity) : unitPrice * quantity;
}

/** Sensible default quantity for a service given a guest count. */
export function suggestedQuantity(service: Service, guests?: number | null): number {
  const g = guests && guests > 0 ? guests : 0;
  let q = 1;
  if (service.unit === "per50" || service.unit === "guest") q = g || service.minQuantity;
  else if (service.unit === "plate") q = Math.ceil(g * 1.0) || service.minQuantity;
  else if (service.unit === "cup") q = Math.ceil(g * 1.5) || service.minQuantity;
  return Math.min(MAX_QUANTITY, Math.max(service.minQuantity, q));
}

export interface PriceResult {
  lines: PricedLine[];
  pricing: PriceBreakdown;
  errors: string[];
}

/**
 * Prices plan items strictly from catalogue data. Client-supplied prices are
 * never trusted — only service IDs, option IDs and quantities are read.
 */
export function priceItems(
  items: PlanItemInput[],
  getService: (id: string) => Service | undefined,
  getVendor: (id: string) => Vendor | undefined,
): PriceResult {
  const errors: string[] = [];
  const merged = new Map<string, PlanItemInput>();
  for (const item of items.slice(0, MAX_LINES)) {
    if (!item || typeof item.serviceId !== "string") continue;
    merged.set(item.serviceId, item);
  }
  const lines: PricedLine[] = [];
  for (const item of merged.values()) {
    const service = getService(item.serviceId);
    if (!service || service.active === false) {
      errors.push(`Service "${item.serviceId}" is not available.`);
      continue;
    }
    const rawQty = Math.floor(Number(item.quantity));
    const quantity = Number.isFinite(rawQty) ? Math.min(MAX_QUANTITY, Math.max(service.minQuantity, rawQty)) : service.minQuantity;
    const optionIds = Array.isArray(item.optionIds) ? item.optionIds.filter((o) => typeof o === "string") : [];
    const chosen = service.options.filter((o) => optionIds.includes(o.id));
    const unitPrice = service.startingPrice + chosen.reduce((s, o) => s + o.priceDelta, 0);
    lines.push({
      serviceId: service.id,
      serviceName: service.name,
      categorySlug: service.categorySlug,
      subcategorySlug: service.subcategorySlug,
      vendorId: service.vendorId,
      vendorName: getVendor(service.vendorId)?.name ?? "MUHURTO partner",
      unit: service.unit,
      basePrice: service.startingPrice,
      optionIds: chosen.map((o) => o.id),
      optionLabels: chosen.map((o) => o.label),
      unitPrice,
      quantity,
      lineTotal: lineAmount(service.unit, unitPrice, quantity),
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  return { lines, pricing: computeBreakdown(subtotal), errors };
}

/** Re-prices admin-revised lines (trusted, set server-side by an admin). */
export function repriceLines(lines: PricedLine[]): { lines: PricedLine[]; pricing: PriceBreakdown } {
  const clean = lines.map((l) => {
    const quantity = Math.min(MAX_QUANTITY, Math.max(1, Math.floor(l.quantity)));
    const unitPrice = Math.max(0, Math.round(l.unitPrice));
    return { ...l, quantity, unitPrice, lineTotal: lineAmount(l.unit, unitPrice, quantity) };
  });
  return { lines: clean, pricing: computeBreakdown(clean.reduce((s, l) => s + l.lineTotal, 0)) };
}
