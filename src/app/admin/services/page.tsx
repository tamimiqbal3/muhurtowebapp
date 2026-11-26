"use client";

import { useState } from "react";
import { Database, Pencil, Plus, Trash2 } from "lucide-react";
import { adminCall, useAdmin } from "@/components/admin/useAdmin";
import { AdminTable } from "@/components/admin/AdminShell";
import { ServiceEditor } from "@/components/admin/ServiceEditor";
import { Button } from "@/components/ui/Button";
import { Badge, Notice, Skeleton } from "@/components/ui/misc";
import { CATEGORIES } from "@/data/categories";
import type { Category, Service, Vendor } from "@/lib/types";
import { formatBDT } from "@/lib/format";

export default function AdminServices() {
  const [tab, setTab] = useState<"services" | "categories">("services");
  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-full border border-line bg-paper p-1">
        {(["services", "categories"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`h-9 rounded-full px-4 text-xs font-semibold capitalize ${tab === t ? "bg-ink text-paper" : "text-ink-soft"}`}>{t === "services" ? "Service listings" : "Categories & subsections"}</button>)}
      </div>
      {tab === "services" ? <Services /> : <Categories />}
    </div>
  );
}

function Services() {
  const { data, error, reload } = useAdmin<{ services: Service[]; vendors: Vendor[]; source: string }>("services");
  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const [filter, setFilter] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function seed() {
    setBusy(true);
    try {
      const r = await adminCall("POST", "seed", {});
      setMsg(`Imported ${r.services} services, ${r.vendors} vendors and ${r.reviews} reviews into Firestore.`);
      void reload();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <Notice tone="warning">{error}</Notice>;
  if (!data) return <Skeleton className="h-64" />;
  const list = data.services.filter((s) => !filter || s.categorySlug === filter);
  return (
    <div className="space-y-5">
      {data.source === "demo" && (
        <Notice tone="warning" title="Showing the starter catalogue">
          Import it into your database once to add, edit and remove listings from this dashboard.
          <div className="mt-3"><Button size="sm" onClick={seed} disabled={busy}><Database className="h-4 w-4" /> Import catalogue into Firestore</Button></div>
        </Notice>
      )}
      {msg && <Notice tone="success">{msg}</Notice>}
      <div className="flex flex-wrap items-center gap-3">
        <select className="field h-11 w-auto py-0" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter category"><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <Button size="sm" onClick={() => setEditing("new")} disabled={data.source === "demo"}><Plus className="h-4 w-4" /> New service</Button>
        <span className="text-sm text-muted">{list.length} listings</span>
      </div>
      {editing && <ServiceEditor service={editing === "new" ? undefined : editing} vendors={data.vendors} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); void reload(); }} />}
      <AdminTable head={["Service", "Category", "Price", "Vendor", "Status", ""]}>
        {list.map((s) => (
          <tr key={s.id}>
            <td className="px-4 py-3"><p className="font-medium">{s.name}</p><p className="text-xs text-muted">{s.id}</p></td>
            <td className="px-4 py-3 text-xs">{CATEGORIES.find((c) => c.slug === s.categorySlug)?.name}<br />{CATEGORIES.find((c) => c.slug === s.categorySlug)?.subcategories.find((x) => x.slug === s.subcategorySlug)?.name}</td>
            <td className="px-4 py-3">{formatBDT(s.startingPrice)}/{s.unit}</td>
            <td className="px-4 py-3 text-xs">{data.vendors.find((v) => v.id === s.vendorId)?.name}</td>
            <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{s.active === false ? <Badge tone="danger">Hidden</Badge> : <Badge tone="success">Active</Badge>}{s.featured && <Badge tone="gold">Featured</Badge>}{s.isDemo && <Badge>Demo</Badge>}</div></td>
            <td className="px-4 py-3">
              <div className="flex justify-end gap-1">
                <button className="rounded-full p-2 hover:bg-sand disabled:opacity-30" aria-label="Edit" disabled={data.source === "demo"} onClick={() => setEditing(s)}><Pencil className="h-4 w-4" /></button>
                <button className="rounded-full p-2 text-danger hover:bg-sand disabled:opacity-30" aria-label="Delete" disabled={data.source === "demo"} onClick={async () => { if (confirm(`Delete ${s.name}?`)) { try { await adminCall("DELETE", `services/${s.id}`); void reload(); } catch (e) { setMsg((e as Error).message); } } }}><Trash2 className="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

function Categories() {
  const { data, error, reload } = useAdmin<{ categories: Array<Category & { override: Record<string, unknown> | null }> }>("categories");
  const [msg, setMsg] = useState<string | null>(null);
  if (error) return <Notice tone="warning">{error}</Notice>;
  if (!data) return <Skeleton className="h-64" />;
  return (
    <div className="space-y-4">
      <Notice>Category and subsection names are fixed by the MUHURTO specification and can&apos;t be renamed, removed or merged. You can edit their copy and hero image.</Notice>
      {msg && <Notice tone="success">{msg}</Notice>}
      {data.categories.map((c) => <CategoryForm key={c.slug} c={c} onSaved={() => { setMsg(`${c.name} updated.`); void reload(); }} />)}
    </div>
  );
}

function CategoryForm({ c, onSaved }: { c: Category & { override: Record<string, unknown> | null }; onSaved: () => void }) {
  const o = (c.override ?? {}) as { tagline?: string; description?: string; heroImage?: string; subDescriptions?: Record<string, string> };
  const [f, setF] = useState({ tagline: o.tagline ?? c.tagline, description: o.description ?? c.description, heroImage: o.heroImage ?? "", subDescriptions: { ...Object.fromEntries(c.subcategories.map((s) => [s.slug, s.description])), ...(o.subDescriptions ?? {}) } });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <details className="card p-5">
      <summary className="cursor-pointer font-display text-2xl">{c.name} <span className="bn text-base text-gold">{c.nameBn}</span></summary>
      <div className="mt-4 grid gap-3">
        <label><span className="label">Tagline</span><input className="field" value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></label>
        <label><span className="label">Description</span><textarea className="field min-h-20" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <label><span className="label">Hero image URL (optional, https)</span><input className="field" value={f.heroImage} onChange={(e) => setF({ ...f, heroImage: e.target.value })} /></label>
        {c.subcategories.map((s) => (
          <label key={s.slug}><span className="label">{s.name} — description</span><input className="field" value={f.subDescriptions[s.slug] ?? ""} onChange={(e) => setF({ ...f, subDescriptions: { ...f.subDescriptions, [s.slug]: e.target.value } })} /></label>
        ))}
        {err && <Notice tone="warning">{err}</Notice>}
        <div><Button size="sm" disabled={busy} onClick={async () => { setBusy(true); setErr(null); try { await adminCall("PATCH", `categories/${c.slug}`, f); onSaved(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } }}>Save {c.name}</Button></div>
      </div>
    </details>
  );
}
