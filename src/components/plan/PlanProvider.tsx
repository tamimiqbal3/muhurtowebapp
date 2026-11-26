"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CategorySlug, CustomizationOption, EventDetails, PriceUnit, Service } from "@/lib/types";
import { computeBreakdown, lineAmount } from "@/lib/pricing";
import { useLang } from "../i18n/LanguageProvider";
import { findService, getCatalogSnapshot, useCatalog } from "@/lib/store/catalog";

/** Snapshot used only for on-screen estimates — the server always re-prices. */
export interface PlanItem {
  serviceId: string;
  quantity: number;
  optionIds: string[];
  snapshot: {
    name: string;
    image: string;
    price: number;
    unit: PriceUnit;
    minQuantity: number;
    categorySlug: CategorySlug;
    subcategorySlug: string;
    options: CustomizationOption[];
  };
}

export type PlanEvent = Partial<EventDetails>;

interface PlanState {
  items: PlanItem[];
  event: PlanEvent;
  hydrated: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  add: (service: Service, opts?: { quantity?: number; optionIds?: string[]; openDrawer?: boolean }) => void;
  update: (serviceId: string, patch: Partial<Pick<PlanItem, "quantity" | "optionIds">>) => void;
  remove: (serviceId: string) => void;
  clear: () => void;
  setEvent: (patch: PlanEvent) => void;
  has: (serviceId: string) => boolean;
  estimate: ReturnType<typeof computeBreakdown>;
}

const KEY = "muhurto.plan.v1";
const Ctx = createContext<PlanState | null>(null);

export function lineEstimate(item: PlanItem): number {
  const extra = item.snapshot.options.filter((o) => item.optionIds.includes(o.id)).reduce((s, o) => s + o.priceDelta, 0);
  return lineAmount(item.snapshot.unit, item.snapshot.price + extra, item.quantity);
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [event, setEventState] = useState<PlanEvent>({});
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw) as { items?: PlanItem[]; event?: PlanEvent };
        if (Array.isArray(data.items)) setItems(data.items.filter((i) => i && i.serviceId && i.snapshot));
        if (data.event && typeof data.event === "object") setEventState(data.event);
      }
    } catch {
      // Storage unavailable (private mode) — the plan simply lives in memory.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ items, event }));
    } catch {
      /* ignore */
    }
  }, [items, event, hydrated]);

  const add = useCallback<PlanState["add"]>((service, opts) => {
    setItems((prev) => {
      const qty = Math.max(service.minQuantity, opts?.quantity ?? service.minQuantity);
      const next: PlanItem = {
        serviceId: service.id,
        quantity: qty,
        optionIds: opts?.optionIds ?? [],
        snapshot: {
          // Store the canonical (English) copy; display names are localised on render.
          name: findService(getCatalogSnapshot(), service.id)?.name ?? service.name,
          image: service.images[0]?.src ?? "",
          price: service.startingPrice,
          unit: service.unit,
          minQuantity: service.minQuantity,
          categorySlug: service.categorySlug,
          subcategorySlug: service.subcategorySlug,
          options: findService(getCatalogSnapshot(), service.id)?.options ?? service.options,
        },
      };
      const idx = prev.findIndex((p) => p.serviceId === service.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = next;
        return copy;
      }
      return [...prev, next].slice(0, 25);
    });
    setEventState((e) => (e.categorySlug ? e : { ...e, categorySlug: service.categorySlug === "food-culinary" ? e.categorySlug : service.categorySlug }));
    if (opts?.openDrawer !== false) setDrawerOpen(true);
  }, []);

  const update = useCallback<PlanState["update"]>((serviceId, patch) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.serviceId !== serviceId) return p;
        const quantity = patch.quantity != null ? Math.min(5000, Math.max(p.snapshot.minQuantity, Math.floor(patch.quantity) || p.snapshot.minQuantity)) : p.quantity;
        return { ...p, quantity, optionIds: patch.optionIds ?? p.optionIds };
      }),
    );
  }, []);

  const value = useMemo<PlanState>(() => {
    const subtotal = items.reduce((s, i) => s + lineEstimate(i), 0);
    return {
      items,
      event,
      hydrated,
      drawerOpen,
      setDrawerOpen,
      add,
      update,
      remove: (id) => setItems((prev) => prev.filter((p) => p.serviceId !== id)),
      clear: () => {
        setItems([]);
        setEventState({});
      },
      setEvent: (patch) => setEventState((e) => ({ ...e, ...patch })),
      has: (id) => items.some((i) => i.serviceId === id),
      estimate: computeBreakdown(subtotal),
    };
  }, [items, event, hydrated, drawerOpen, add, update]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlan(): PlanState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlan must be used inside <PlanProvider>");
  return ctx;
}

/** Localised display names for items saved in the plan (snapshots are stored in English). */
export function usePlanItemName() {
  const { lang } = useLang();
  const data = useCatalog();
  return (item: Pick<PlanItem, "serviceId" | "snapshot">) => (lang === "bn" ? findService(data, item.serviceId)?.nameBn || item.snapshot.name : item.snapshot.name);
}

export function usePlanOptionLabel() {
  const { lang } = useLang();
  const data = useCatalog();
  return (serviceId: string, optionId: string, fallback: string) => (lang === "bn" ? findService(data, serviceId)?.options.find((o) => o.id === optionId)?.labelBn || fallback : fallback);
}
