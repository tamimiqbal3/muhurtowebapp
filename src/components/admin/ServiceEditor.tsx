"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import type { Service, Vendor } from "@/lib/types";
import { CATEGORIES } from "@/data/categories";
import { Button } from "../ui/Button";
import { Notice } from "../ui/misc";
import { adminCall } from "./useAdmin";

type Draft = Omit<Partial<Service>, "serviceAreas" | "themes" | "includes" | "tags"> & { serviceAreas: string; themes: string; includes: string; tags: string; imageText: string; optionText: string };

function toDraft(s?: Service): Draft {
  return {
    ...s,
    categorySlug: s?.categorySlug ?? "wedding",
    subcategorySlug: s?.subcategorySlug ?? "decor",
    unit: s?.unit ?? "event",
    minQuantity: s?.minQuantity ?? 1,
    serviceAreas: (s?.serviceAreas ?? []).join(", "),
    themes: (s?.themes ?? []).join(", "),
    includes: (s?.includes ?? []).join(", "),
    tags: (s?.tags ?? []).join(", "),
    imageText: (s?.images ?? []).map((i) => i.src).join("\n"),
    optionText: (s?.options ?? []).map((o) => `${o.label} | ${o.priceDelta}`).join("\n"),
    active: s?.active ?? true,
    featured: s?.featured ?? false,
  };
}

export function ServiceEditor({ service, vendors, onSaved, onCancel }: { service?: Service; vendors: Vendor[]; onSaved: () => void; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(toDraft(service));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cat = CATEGORIES.find((c) => c.slug === d.categorySlug) ?? CATEGORIES[0];
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      set({ imageText: [d.imageText, data.url].filter(Boolean).join("\n") });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const payload = {
        ...d,
        images: d.imageText.split(/\s+/).filter(Boolean).map((src) => ({ src, alt: d.name ?? "" })),
        options: d.optionText.split("\n").map((l) => l.split("|")).filter((p) => p[0]?.trim()).map(([label, price]) => ({ label: label.trim(), priceDelta: Number(price) || 0 })),
      };
      if (service) await adminCall("PATCH", `services/${service.id}`, payload);
      else await adminCall("POST", "services", payload);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card grid gap-4 p-6 md:grid-cols-2">
      <h3 className="text-2xl md:col-span-2">{service ? `Edit · ${service.name}` : "New service"}</h3>
      <label><span className="label">Category</span><select className="field" value={d.categorySlug} onChange={(e) => set({ categorySlug: e.target.value as Service["categorySlug"], subcategorySlug: CATEGORIES.find((c) => c.slug === e.target.value)!.subcategories[0].slug })}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
      <label><span className="label">Subsection</span><select className="field" value={d.subcategorySlug} onChange={(e) => set({ subcategorySlug: e.target.value })}>{cat.subcategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>
      <label className="md:col-span-2"><span className="label">Name</span><input className="field" value={d.name ?? ""} onChange={(e) => set({ name: e.target.value })} /></label>
      <label className="md:col-span-2"><span className="label">Short description</span><input className="field" value={d.shortDescription ?? ""} onChange={(e) => set({ shortDescription: e.target.value })} maxLength={220} /></label>
      <label className="md:col-span-2"><span className="label">Full description</span><textarea className="field min-h-24" value={d.description ?? ""} onChange={(e) => set({ description: e.target.value })} /></label>
      <label><span className="label">Starting price (৳)</span><input className="field" inputMode="numeric" value={d.startingPrice ?? ""} onChange={(e) => set({ startingPrice: Number(e.target.value.replace(/\D/g, "")) })} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label><span className="label">Unit</span><select className="field" value={d.unit} onChange={(e) => set({ unit: e.target.value as Service["unit"] })}>{["event", "guest", "plate", "cup", "hour"].map((u) => <option key={u}>{u}</option>)}</select></label>
        <label><span className="label">Min qty</span><input className="field" inputMode="numeric" value={d.minQuantity ?? 1} onChange={(e) => set({ minQuantity: Number(e.target.value) || 1 })} /></label>
      </div>
      <label><span className="label">Vendor</span><select className="field" value={d.vendorId ?? ""} onChange={(e) => set({ vendorId: e.target.value })}><option value="">Select vendor</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
      <label><span className="label">Base city</span><input className="field" value={d.city ?? ""} onChange={(e) => set({ city: e.target.value })} /></label>
      <label className="md:col-span-2"><span className="label">Service areas (comma-separated, or “Nationwide”)</span><input className="field" value={d.serviceAreas} onChange={(e) => set({ serviceAreas: e.target.value })} /></label>
      <label className="md:col-span-2">
        <span className="label">Image URLs (one per line — https only)</span>
        <textarea className="field min-h-20 font-mono text-xs" value={d.imageText} onChange={(e) => set({ imageText: e.target.value })} />
        <span className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-sindoor"><Upload className="h-3.5 w-3.5" /> Upload image to Firebase Storage<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} /></span>
      </label>
      <label className="md:col-span-2"><span className="label">Customisation options (one per line: Label | price per unit)</span><textarea className="field min-h-20 text-sm" value={d.optionText} onChange={(e) => set({ optionText: e.target.value })} /></label>
      <label><span className="label">Themes</span><input className="field" value={d.themes} onChange={(e) => set({ themes: e.target.value })} /></label>
      <label><span className="label">Included items</span><input className="field" value={d.includes} onChange={(e) => set({ includes: e.target.value })} /></label>
      <label className="md:col-span-2"><span className="label">Search tags</span><input className="field" value={d.tags} onChange={(e) => set({ tags: e.target.value })} /></label>
      <div className="flex gap-5 text-sm md:col-span-2">
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!d.active} onChange={(e) => set({ active: e.target.checked })} /> Active</label>
        <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!d.featured} onChange={(e) => set({ featured: e.target.checked })} /> Featured on homepage</label>
      </div>
      {error && <Notice tone="warning" className="md:col-span-2">{error}</Notice>}
      <div className="flex gap-2 md:col-span-2">
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save service"}</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
