"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { remove, updateCatalog, upsert, useCatalog } from "@/lib/store/catalog";
import { Btn, Drawer, Field, ImageInput, PageHead, Table, slugify } from "@/components/admin/ui";
import type { Category, Subcategory } from "@/lib/types";

const blank = (): Category => ({ slug: "", name: "", nameBn: "", tagline: "", taglineBn: "", description: "", descriptionBn: "", accent: "#015fff", route: "", hero: { src: "", alt: "" }, card: { src: "", alt: "" }, subcategories: [] });

export default function AdminCategories() {
  const data = useCatalog();
  const [edit, setEdit] = useState<{ cat: Category; isNew: boolean; originalSlug?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const count = (slug: string, sub?: string) => data.services.filter((s) => s.categorySlug === slug && (!sub || s.subcategorySlug === sub)).length;

  function save() {
    if (!edit) return;
    const c = edit.cat;
    const slug = edit.isNew ? slugify(c.slug || c.name) : c.slug;
    if (!c.name.trim() || !slug) return setError("Name is required.");
    if (edit.isNew && data.categories.some((x) => x.slug === slug)) return setError("A category with this address already exists.");
    const subs = c.subcategories.filter((s) => s.name.trim()).map((s) => ({ ...s, slug: s.slug || slugify(s.name) }));
    if (new Set(subs.map((s) => s.slug)).size !== subs.length) return setError("Two subcategories have the same address.");
    upsert("categories", { ...c, slug, route: c.route || `/services/${slug}`, nameBn: c.nameBn || c.name, hero: { ...c.hero, alt: c.name }, card: { ...(c.card.src ? c.card : c.hero), alt: c.name }, subcategories: subs.map((s) => ({ ...s, nameBn: s.nameBn || s.name })) }, edit.originalSlug);
    setEdit(null);
    setError(null);
  }

  function del(c: Category) {
    const n = count(c.slug);
    if (!confirm(`Delete “${c.name}”${n ? ` and its ${n} services` : ""}? This cannot be undone.`)) return;
    updateCatalog((d) => ({ ...d, services: d.services.filter((s) => s.categorySlug !== c.slug) }));
    remove("categories", c.slug);
  }

  const setCat = (patch: Partial<Category>) => edit && setEdit({ ...edit, cat: { ...edit.cat, ...patch } });
  const setSub = (i: number, patch: Partial<Subcategory>) => edit && setCat({ subcategories: edit.cat.subcategories.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  return (
    <>
      <PageHead title="Categories & subcategories" subtitle="Add, rename or remove event categories and the sections inside them." actions={<Btn onClick={() => setEdit({ cat: blank(), isNew: true })}><Plus className="h-4 w-4" /> New category</Btn>} />
      <Table head={["Category", "Subcategories", "Services", ""]}>
        {data.categories.map((c) => (
          <tr key={c.slug}>
            <td className="px-4 py-3"><p className="font-semibold">{c.name}</p><p className="text-xs text-muted">{c.nameBn} · {c.route || `/services/${c.slug}`}</p></td>
            <td className="px-4 py-3 text-xs text-ink-soft">{c.subcategories.map((s) => `${s.name} (${count(c.slug, s.slug)})`).join(" · ")}</td>
            <td className="px-4 py-3">{count(c.slug)}</td>
            <td className="px-4 py-3"><div className="flex justify-end gap-1">
              <Btn variant="ghost" onClick={() => setEdit({ cat: structuredClone(c), isNew: false, originalSlug: c.slug })}><Pencil className="h-4 w-4" /> Edit</Btn>
              <Btn variant="ghost" className="text-danger" onClick={() => del(c)}><Trash2 className="h-4 w-4" /></Btn>
            </div></td>
          </tr>
        ))}
      </Table>

      <Drawer title={edit?.isNew ? "New category" : `Edit ${edit?.cat.name ?? ""}`} open={!!edit} onClose={() => { setEdit(null); setError(null); }} footer={<><Btn variant="outline" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={save}>Save category</Btn></>}>
        {edit && (
          <div className="space-y-6">
            {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name (English)"><input className="field" value={edit.cat.name} onChange={(e) => setCat({ name: e.target.value })} /></Field>
              <Field label="Name (Bangla)"><input className="field" value={edit.cat.nameBn} onChange={(e) => setCat({ nameBn: e.target.value })} /></Field>
              {edit.isNew && <Field label="Web address" hint={`/services/${slugify(edit.cat.slug || edit.cat.name) || "…"}`}><input className="field" value={edit.cat.slug} placeholder="e.g. engagement" onChange={(e) => setCat({ slug: e.target.value })} /></Field>}
              <Field label="Accent colour"><input type="color" className="field h-12 !p-1" value={edit.cat.accent} onChange={(e) => setCat({ accent: e.target.value })} /></Field>
              <Field label="Tagline (English)" wide><input className="field" value={edit.cat.tagline} onChange={(e) => setCat({ tagline: e.target.value })} /></Field>
              <Field label="Tagline (Bangla)" wide><input className="field" value={edit.cat.taglineBn ?? ""} onChange={(e) => setCat({ taglineBn: e.target.value })} /></Field>
              <Field label="Description (English)" wide><textarea className="field min-h-20" value={edit.cat.description} onChange={(e) => setCat({ description: e.target.value })} /></Field>
              <Field label="Description (Bangla)" wide><textarea className="field min-h-20" value={edit.cat.descriptionBn ?? ""} onChange={(e) => setCat({ descriptionBn: e.target.value })} /></Field>
              <Field label="Banner image" wide><ImageInput value={edit.cat.hero.src} onChange={(src) => setCat({ hero: { src, alt: edit.cat.name } })} /></Field>
              <Field label="Card image" wide><ImageInput value={edit.cat.card.src} onChange={(src) => setCat({ card: { src, alt: edit.cat.name } })} /></Field>
            </div>
            <div>
              <div className="flex items-center justify-between"><h3 className="font-sans text-sm font-semibold">Subcategories</h3><Btn variant="outline" onClick={() => setCat({ subcategories: [...edit.cat.subcategories, { slug: "", name: "", nameBn: "", description: "" }] })}><Plus className="h-4 w-4" /> Add</Btn></div>
              <ul className="mt-3 space-y-3">
                {edit.cat.subcategories.map((s, i) => (
                  <li key={i} className="rounded-xl border border-line p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input className="field !py-2 text-sm" placeholder="Name (English)" value={s.name} onChange={(e) => setSub(i, { name: e.target.value })} />
                      <input className="field !py-2 text-sm" placeholder="Name (Bangla)" value={s.nameBn} onChange={(e) => setSub(i, { nameBn: e.target.value })} />
                      <input className="field !py-2 text-sm sm:col-span-2" placeholder="Short description" value={s.description} onChange={(e) => setSub(i, { description: e.target.value })} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span>{s.slug ? `Address: ${s.slug} · ${count(edit.cat.slug, s.slug)} services` : "New subcategory"}</span>
                      <Btn variant="ghost" className="text-danger" onClick={() => { if (!s.slug || !count(edit.cat.slug, s.slug) || confirm("Services in this subcategory will stay but will no longer be listed. Remove it?")) setCat({ subcategories: edit.cat.subcategories.filter((_, j) => j !== i) }); }}><Trash2 className="h-4 w-4" /> Remove</Btn>
                    </div>
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
