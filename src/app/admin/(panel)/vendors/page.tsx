"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { remove, upsert, useCatalog } from "@/lib/store/catalog";
import { Btn, Drawer, Field, PageHead, Pill, Table, slugify } from "@/components/admin/ui";
import type { Vendor } from "@/lib/types";

const blank = (): Vendor => ({ id: "", name: "", tagline: "", city: "Dhaka", address: "", since: new Date().getFullYear(), verified: true, phone: "", email: "", specialties: [], isDemo: false, active: true });

export default function AdminVendors() {
  const data = useCatalog();
  const [edit, setEdit] = useState<{ v: Vendor; isNew: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = (p: Partial<Vendor>) => edit && setEdit({ ...edit, v: { ...edit.v, ...p } });
  const used = (id: string) => data.services.filter((s) => s.vendorId === id).length;
  function save() {
    if (!edit) return;
    const v = edit.v;
    if (!v.name.trim()) return setError("Name is required.");
    const id = v.id || slugify(v.name) || `vendor-${Date.now()}`;
    if (edit.isNew && data.vendors.some((x) => x.id === id)) return setError("A vendor with this name already exists.");
    upsert("vendors", { ...v, id, city: "Dhaka" });
    setEdit(null);
    setError(null);
  }
  return (
    <>
      <PageHead title="Vendors" subtitle="Dhaka-based partners who deliver your services." actions={<Btn onClick={() => setEdit({ v: blank(), isNew: true })}><Plus className="h-4 w-4" /> New vendor</Btn>} />
      <Table head={["Vendor", "Area", "Contact", "Services", "Status", ""]}>
        {data.vendors.map((v) => (
          <tr key={v.id}>
            <td className="px-4 py-3"><p className="font-semibold">{v.name}</p><p className="text-xs text-muted">{v.tagline}</p></td>
            <td className="px-4 py-3 text-xs">{v.address}</td>
            <td className="px-4 py-3 text-xs">{v.phone}<br /><span className="text-muted">{v.email}</span></td>
            <td className="px-4 py-3">{used(v.id)}</td>
            <td className="px-4 py-3"><button onClick={() => upsert("vendors", { ...v, active: v.active === false })}>{v.active === false ? <Pill>Inactive</Pill> : <Pill tone="success">Active</Pill>}</button></td>
            <td className="px-4 py-3"><div className="flex justify-end gap-1">
              <Btn variant="ghost" onClick={() => setEdit({ v: { ...v }, isNew: false })}><Pencil className="h-4 w-4" /></Btn>
              <Btn variant="ghost" className="text-danger" onClick={() => { if (used(v.id)) return alert("Move this vendor's services to another vendor before deleting it."); if (confirm(`Delete ${v.name}?`)) remove("vendors", v.id); }}><Trash2 className="h-4 w-4" /></Btn>
            </div></td>
          </tr>
        ))}
      </Table>
      <Drawer title={edit?.isNew ? "New vendor" : "Edit vendor"} open={!!edit} onClose={() => setEdit(null)} footer={<><Btn variant="outline" onClick={() => setEdit(null)}>Cancel</Btn><Btn onClick={save}>Save vendor</Btn></>}>
        {edit && (
          <div className="grid gap-4 sm:grid-cols-2">
            {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger sm:col-span-2">{error}</p>}
            <Field label="Business name" wide><input className="field" value={edit.v.name} onChange={(e) => set({ name: e.target.value })} /></Field>
            <Field label="Tagline" wide><input className="field" value={edit.v.tagline} onChange={(e) => set({ tagline: e.target.value })} /></Field>
            <Field label="Area in Dhaka"><select className="field" value={edit.v.address.replace(/, Dhaka$/, "")} onChange={(e) => set({ address: `${e.target.value}, Dhaka` })}><option value="">Choose…</option>{data.locations.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}{!data.locations.some((l) => `${l.name}, Dhaka` === edit.v.address) && edit.v.address && <option value={edit.v.address.replace(/, Dhaka$/, "")}>{edit.v.address}</option>}</select></Field>
            <Field label="Working since"><input className="field" type="number" value={edit.v.since} onChange={(e) => set({ since: Number(e.target.value) })} /></Field>
            <Field label="Phone"><input className="field" value={edit.v.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
            <Field label="Email"><input className="field" type="email" value={edit.v.email} onChange={(e) => set({ email: e.target.value })} /></Field>
            <Field label="Categories served" wide><div className="flex flex-wrap gap-3 text-sm">{data.categories.map((c) => <label key={c.slug} className="inline-flex items-center gap-2"><input type="checkbox" checked={edit.v.specialties.includes(c.slug)} onChange={(e) => set({ specialties: e.target.checked ? [...edit.v.specialties, c.slug] : edit.v.specialties.filter((x) => x !== c.slug) })} />{c.name}</label>)}</div></Field>
            <Field label="Status" wide><div className="flex gap-5 text-sm"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={edit.v.verified} onChange={(e) => set({ verified: e.target.checked })} /> Verified</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={edit.v.active !== false} onChange={(e) => set({ active: e.target.checked })} /> Active</label></div></Field>
          </div>
        )}
      </Drawer>
    </>
  );
}
