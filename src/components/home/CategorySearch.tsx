"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ChevronDown, ArrowUpRight, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { SEARCH_SUGGESTIONS } from "@/lib/search";
import type { CategorySlug } from "@/lib/types";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Hit {
  id: string;
  name: string;
  categorySlug: CategorySlug;
  subcategory: string;
  startingPrice: number;
  image: string;
  city: string;
}

export function CategorySearch({ className, initialCategory = "", initialQuery = "", compact }: { className?: string; initialCategory?: string; initialQuery?: string; compact?: boolean }) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [q, setQ] = useState(initialQuery);
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: q.trim(), limit: "6" });
        if (category) params.set("category", category);
        const res = await fetch(`/api/search?${params}`, { signal: ctrl.signal });
        const data = (await res.json()) as { results: Hit[] };
        setHits(data.results);
        setActive(-1);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, category]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (active >= 0 && hits?.[active]) {
      router.push(`/service/${hits[active].id}`);
      return;
    }
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    router.push(`/search${params.size ? `?${params}` : ""}`);
  }

  const suggestions = SEARCH_SUGGESTIONS[(category || "all") as CategorySlug | "all"];
  const showPanel = focused && (q.trim().length >= 2 || !compact);

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <form onSubmit={submit} role="search" className="card flex flex-col gap-2 p-2 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2">
        <label className="relative flex items-center sm:w-56 sm:shrink-0">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-12 w-full cursor-pointer appearance-none rounded-full bg-sand/70 pl-5 pr-10 text-sm font-semibold text-ink outline-none transition hover:bg-sand focus:ring-2 focus:ring-ink/10"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 h-4 w-4 text-muted" />
        </label>
        <div className="flex flex-1 items-center gap-2 sm:pl-3">
          <Search className="ml-3 h-5 w-5 shrink-0 text-muted sm:ml-1" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if (!hits?.length) return;
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(hits.length - 1, a + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
              if (e.key === "Escape") setFocused(false);
            }}
            placeholder={category ? `Search ${CATEGORIES.find((c) => c.slug === category)?.name} services…` : "Search décor, kacchi, photographers, fuchka…"}
            className="h-12 min-w-0 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-muted/80"
            aria-label="Search services"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
        </div>
        <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-7 text-sm font-semibold text-paper transition hover:bg-sindoor">
          <Search className="h-4 w-4" /> Search
        </button>
      </form>

      {showPanel && (
        <div id={listId} className="card absolute inset-x-0 top-full z-30 mt-2 max-h-[70vh] overflow-y-auto p-3 text-left">
          {q.trim().length >= 2 && hits && hits.length > 0 && (
            <ul role="listbox" aria-label="Matching services">
              {hits.map((h, i) => (
                <li key={h.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link href={`/service/${h.id}`} className={cn("flex items-center gap-3 rounded-xl p-2 transition", i === active ? "bg-sand" : "hover:bg-sand/60")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${h.image}?auto=compress&cs=tinysrgb&w=120`} alt="" className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{h.name}</p>
                      <p className="truncate text-xs text-muted">{CATEGORIES.find((c) => c.slug === h.categorySlug)?.name} · {h.subcategory} · {h.city}</p>
                    </div>
                    <span className="text-xs font-semibold text-ink-soft">from {formatBDT(h.startingPrice)}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button onClick={() => submit()} className="mt-1 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold text-sindoor hover:bg-sand/60">
                  See all results <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </li>
            </ul>
          )}
          {q.trim().length >= 2 && hits && hits.length === 0 && !loading && (
            <div className="px-2 py-4 text-sm">
              <p className="font-semibold">No services match “{q}”{category && ` in ${CATEGORIES.find((c) => c.slug === category)?.name}`}.</p>
              <p className="mt-1 text-ink-soft">Try a broader word, another category, or one of these:</p>
            </div>
          )}
          {(q.trim().length < 2 || (hits && hits.length === 0)) && (
            <div className="px-2 pb-1">
              <p className="eyebrow mb-2">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => setQ(s)} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition hover:border-ink hover:text-ink">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
