"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { CITIES } from "@/data/categories";
import { cn } from "@/lib/utils";

export function FilterBar({ total, showQuery = true }: { total: number; showQuery?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(sp.get("q") ?? "");
  useEffect(() => setQ(sp.get("q") ?? ""), [sp]);

  function set(patch: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  }

  const active = ["city", "min", "max", "rating", "q"].filter((k) => sp.get(k)).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {showQuery && (
          <form
            className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-paper px-4 sm:max-w-xs"
            onSubmit={(e) => {
              e.preventDefault();
              set({ q: q.trim() || null });
            }}
          >
            <Search className="h-4 w-4 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Refine by keyword" aria-label="Refine by keyword" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </form>
        )}
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className={cn("inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition", open ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink")}>
          <SlidersHorizontal className="h-4 w-4" /> Filters {active > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-sindoor text-[0.65rem] text-paper">{active}</span>}
        </button>
        <label className="ml-auto inline-flex items-center gap-2 text-sm text-ink-soft">
          <span className="hidden sm:inline">Sort</span>
          <select value={sp.get("sort") ?? "relevance"} onChange={(e) => set({ sort: e.target.value === "relevance" ? null : e.target.value })} className="h-11 rounded-full border border-line bg-paper px-4 text-sm font-medium outline-none">
            <option value="relevance">Recommended</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
      {open && (
        <div className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className="label">City / service area</span>
            <select className="field" value={sp.get("city") ?? ""} onChange={(e) => set({ city: e.target.value || null })}>
              <option value="">Anywhere in Bangladesh</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Min starting price (৳)</span>
            <input className="field" inputMode="numeric" defaultValue={sp.get("min") ?? ""} onBlur={(e) => set({ min: e.target.value.replace(/\D/g, "") || null })} placeholder="0" />
          </label>
          <label>
            <span className="label">Max starting price (৳)</span>
            <input className="field" inputMode="numeric" defaultValue={sp.get("max") ?? ""} onBlur={(e) => set({ max: e.target.value.replace(/\D/g, "") || null })} placeholder="Any" />
          </label>
          <label>
            <span className="label">Minimum rating</span>
            <select className="field" value={sp.get("rating") ?? ""} onChange={(e) => set({ rating: e.target.value || null })}>
              <option value="">Any rating</option>
              <option value="4.5">4.5★ and up</option>
              <option value="4.7">4.7★ and up</option>
              <option value="4.8">4.8★ and up</option>
            </select>
          </label>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-soft" aria-live="polite">
        <span className={cn(pending && "opacity-50")}>{total} {total === 1 ? "service" : "services"}</span>
        {active > 0 && (
          <button onClick={() => set({ city: null, min: null, max: null, rating: null, q: null })} className="inline-flex items-center gap-1 rounded-full bg-sand px-3 py-1 text-xs font-medium hover:bg-line">
            <X className="h-3 w-3" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
