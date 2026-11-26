"use client";

import { useMemo, useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { remove, upsert, useCatalog } from "@/lib/store/catalog";
import { Btn, Drawer, Field, ImageInput, PageHead, Pill, Table, bdt, uid } from "@/components/admin/ui";
import type { CustomizationOption, PriceUnit, Service } from "@/lib/types";

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

function blank(cat: string, sub: string, vendor: string): Service {
  return { id: "", categorySlug: cat, subcategorySlug: sub, name: "", nameBn: "", shortDescription: "", shortDescriptionBn: "", description: "", descriptionBn: "", startingPrice: 5000, unit: "per50", minQuantity: 50, vendorId: vendor, city: "Dhaka", serviceAreas: ["Dhaka"], images: [], options: [], themes: [], includes: [], includesBn: [], rating: 4.8, reviewCount: 0, tags: [], featured: false, active: true, isDemo: false };
}

export default function AdminServices() {
  const data = useCatalog();
  const [cat, setCat] = useState("");
  const [sub, setSub] = useState("");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<{ s: Service; isNew: boolean; inc: string; incBn: string; tags: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const catOf = (slug: string) => data.categories.find((c) => c.slug === slug);
  const list = useMemo(() => data.services.filter((s) => (!cat || s.categorySlug === cat) && (!sub || s.subcategorySlug === sub) && (!q || `${s.name} ${s.nameBn} ${s.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()))), [data.services, cat, sub, q]);

  const open = (s: Service, isNew: boolean) => setEdit({ s: structuredClone(s), isNew, inc: s.includes.join("\n"), incBn: (s.includesBn ?? []).join("\n"), tags: s.tags.join(", ") });
  const setS = (patch: Partial<Service>) => edit && setEdit({ ...edit, s: { ...edit.s, ...patch } });
  const setOpt = (i: number, patch: Partial<CustomizationOption>) => edit && setS({ options: edit.s.options.map((o, j) => (j === i ? { ...o, ...patch } : o)) });

  function save() {
    if (!edit) return;
    const s = edit.s;
    if (!s.name.trim()) return setError("Name is required.");
    if (!catOf(s.categorySlug)?.subcategories.some((x) => x.slug === s.subcategorySlug)) return setError("Choose a category and subcategory.");
    if (!(s.startingPrice > 0)) return setError("Enter a price.");
    const id = s.id || uid(s.categorySlug.slice(0, 4));
    const short = s.shortDescription.trim();
    upsert("services", {
      ...s, id, name: s.name.trim(), shortDescription: short, description: s.description.trim() || short,
      descriptionBn: (s.descriptionBn ?? "").trim() || s.shortDescriptionBn, minQuantity: s.unit === "per50" ? 50 : Math.max(1, s.minQuantity),
      includes: lines(edit.inc), includesBn: lines(edit.incBn), tags: edit.tags.split(",").map((x) => x.trim()).filter(Boolean),
      options: s.options.filter((o) => o.label.trim()).map((o) => ({ ...o, id: o.id || uid("opt") })),
      images: s.images.filter((i) => i.src).slice(0, 1).map((i) => ({ src: i.src, alt: s.name })),
    });
    setEdit(null);
    setError(null);
  }

  const editCat = edit ? catOf(edit.s.categorySlug) : undefined;
  return (
    <>
      <PageHead title="Services & packages" subtitle={`${data.services.length} items · prices are per 50 guests unless set otherwise.`} actions={<Btn onClick={() => { const c = data.categories[0]; open(blank(cat || c?.slug || "", sub || c?.subcategories[0]?.slug || "", data.vendors[0]?.id ?? ""), true); }}><Plus className="h-4 w-4" /> New service</Btn>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <select className="field" value={cat} onChange={(e) => { setCat(e.target.value); setSub(""); }}><option value="">All categories</option>{data.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <select className="field" value={sub} onChange={(e) => setSub(e.target.value)} disabled={!cat}><option value="">All subcategories</option>{catOf(cat)?.subcategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select>
        <input className="field" placeholder="Search by name or tag" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Table head={["Service", "Category", "Price", "Status", ""]} empty="No services match.">
        {list.map((s) => {
          const c = catOf(s.categorySlug);
          return (
            <tr key={s.id}>
              <td className="px-4 py-3"><div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {s.images[0]?.src ? <img src={s.images[0].src.includes("pexels") ? `${s.images[0].src}?w=120&cs=srgb` : s.images[0].src} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" /> : <span className="h-10 w-14 shrink-0 rounded-lg bg-sand" />}
                <span className="min-w-0"><span className="block font-semibold">{s.name}</span><span className="block text-xs text-muted">{s.nameBn}</span></span>
              </div></td>
              <td className="px-4 py-3 text-xs">{c?.name ?? s.categorySlug}<br /><span className="text-muted">{c?.subcategories.find((x) => x.slug === s.subcategorySlug)?.name ?? s.subcategorySlug}</span></td>
              <td className="px-4 py-3 whitespace-nowrap">{bdt(s.startingPrice)}<span className="block text-xs text-muted">{s.unit === "per50" ? "per 50 guests" : `per ${s.unit}`}</span></td>
              <td className="px-4 py-3"><button onClick={() => upsert("services", { ...s, active: s.active === false })}>{s.active === false ? <Pill>Hidden</Pill> : <Pill tone="success">Live</Pill>}</button>{s.featured && <span className="ml-1"><Pill tone="brand">Featured</Pill></span>}</td>
              <td className="px-4 py-3"><div className="flex justify-end gap-1">
                <Btn variant="ghost" onClick={() => open(s, false)}><Pencil className="h-4 w-4" /></Btn>
                <Btn variant="ghost" onClick={() => open({ ...s, id: "", name: `${s.name} (copy)` }, true)} ><Copy className="h-4 w-4" /></Btn>
                <Btn variant="ghost" className="text-danger" onClick={() => confirm(`Delete “${s.name}”?`) && remove("services", s.id)}><Trash2 className="h-4 w-4" /></Btn>
              </div></td>
            </tr>
          );
        })}
      </Table>

      <Drawer title={edit?.isNew ? "New service" : "Edit service"} open={!!edit} onClose={() => { setEdit(null); setError(null); }} footer={<><Btn variant="outline" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={save}>Save service</Btn></>}>
        {edit && (
          <div className="space-y-5">
            {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category"><select className="field" value={edit.s.categorySlug} onChange={(e) => setS({ categorySlug: e.target.value, subcategorySlug: catOf(e.target.value)?.subcategories[0]?.slug ?? "" })}>{data.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></Field>
              <Field label="Subcategory"><select className="field" value={edit.s.subcategorySlug} onChange={(e) => setS({ subcategorySlug: e.target.value })}>{editCat?.subcategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></Field>
              <Field label="Name (English)"><input className="field" value={edit.s.name} onChange={(e) => setS({ name: e.target.value })} /></Field>
              <Field label="Name (Bangla)"><input className="field" value={edit.s.nameBn ?? ""} onChange={(e) => setS({ nameBn: e.target.value })} /></Field>
              <Field label="Price (৳)"><input className="field" type="number" min={1} value={edit.s.startingPrice} onChange={(e) => setS({ startingPrice: Math.max(0, Number(e.target.value)) })} /></Field>
              <Field label="Pricing basis"><select className="field" value={edit.s.unit} onChange={(e) => setS({ unit: e.target.value as PriceUnit })}><option value="per50">Per 50 guests</option><option value="event">Per event (flat)</option></select></Field>
              <Field label="Vendor"><select className="field" value={edit.s.vendorId} onChange={(e) => setS({ vendorId: e.target.value })}>{data.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></Field>
              <Field label="Visibility"><div className="flex h-12 items-center gap-5 text-sm">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={edit.s.active !== false} onChange={(e) => setS({ active: e.target.checked })} /> Live</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!edit.s.featured} onChange={(e) => setS({ featured: e.target.checked })} /> Featured</label>
              </div></Field>
              <Field label="Main image (one image is shown on the details page)" wide><ImageInput value={edit.s.images[0]?.src ?? ""} onChange={(src) => setS({ images: src ? [{ src, alt: edit.s.name }] : [] })} /></Field>
              <Field label="Short description (English)" wide><textarea className="field min-h-16" value={edit.s.shortDescription} onChange={(e) => setS({ shortDescription: e.target.value })} /></Field>
              <Field label="Short description (Bangla)" wide><textarea className="field min-h-16" value={edit.s.shortDescriptionBn ?? ""} onChange={(e) => setS({ shortDescriptionBn: e.target.value })} /></Field>
              <Field label="Full description (English)" wide><textarea className="field min-h-24" value={edit.s.description} onChange={(e) => setS({ description: e.target.value })} /></Field>
              <Field label="Full description (Bangla)" wide><textarea className="field min-h-24" value={edit.s.descriptionBn ?? ""} onChange={(e) => setS({ descriptionBn: e.target.value })} /></Field>
              <Field label="What's included (one per line, English)"><textarea className="field min-h-24" value={edit.inc} onChange={(e) => setEdit({ ...edit, inc: e.target.value })} /></Field>
              <Field label="What's included (Bangla)"><textarea className="field min-h-24" value={edit.incBn} onChange={(e) => setEdit({ ...edit, incBn: e.target.value })} /></Field>
              <Field label="Search tags (comma separated)" wide><input className="field" value={edit.tags} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} /></Field>
            </div>
            <div>
              <div className="flex items-center justify-between"><h3 className="font-sans text-sm font-semibold">Add-on options</h3><Btn variant="outline" onClick={() => setS({ options: [...edit.s.options, { id: "", label: "", labelBn: "", priceDelta: 1000 }] })}><Plus className="h-4 w-4" /> Add option</Btn></div>
              <ul className="mt-3 space-y-2">
                {edit.s.options.map((o, i) => (
                  <li key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_1fr_7rem_auto]">
                    <input className="field !py-2 text-sm" placeholder="Option (English)" value={o.label} onChange={(e) => setOpt(i, { label: e.target.value })} />
                    <input className="field !py-2 text-sm" placeholder="Option (Bangla)" value={o.labelBn ?? ""} onChange={(e) => setOpt(i, { labelBn: e.target.value })} />
                    <input className="field !py-2 text-sm" type="number" value={o.priceDelta} onChange={(e) => setOpt(i, { priceDelta: Number(e.target.value) })} aria-label="Extra price" />
                    <Btn variant="ghost" className="text-danger" onClick={() => setS({ options: edit.s.options.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4" /></Btn>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
