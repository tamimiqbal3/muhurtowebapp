"use client";

import { useState } from "react";
import { BadgeCheck, Pencil, Plus, Trash2 } from "lucide-react";
import { adminCall, useAdmin } from "@/components/admin/useAdmin";
import { AdminTable } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Badge, Notice, Skeleton } from "@/components/ui/misc";
import { CATEGORIES } from "@/data/categories";
import type { CategorySlug, Vendor } from "@/lib/types";

const blank: Partial<Vendor> = { name: "", tagline: "", city: "Dhaka", address: "", since: new Date().getFullYear(), phone: "", email: "", verified: false, specialties: [], active: true };

export default function AdminVendors() {
  const { data, error, reload } = useAdmin<{ vendors: Vendor[]; source: string }>("vendors");
  const [edit, setEdit] = useState<Partial<Vendor> | null>(null);
  const [msg, setMsg] = useState<{ tone: "success" | "warning"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!edit) return;
    setBusy(true);
    setMsg(null);
    try {
      if (edit.id) await adminCall("PATCH", `vendors/${edit.id}`, edit);
      else await adminCall("POST", "vendors", edit);
      setEdit(null);
      setMsg({ tone: "success", text: "Vendor saved." });
      void reload();
    } catch (e) {
      setMsg({ tone: "warning", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  if (error) return <Notice tone="warning">{error}</Notice>;
  if (!data) return <Skeleton className="h-64" />;
  const demo = data.source === "demo";
  return (
    <div className="space-y-5">
      {demo && <Notice tone="warning">Vendors are bundled demo data. Import the catalogue (Admin → Services) to manage vendors.</Notice>}
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <Button size="sm" disabled={demo} onClick={() => setEdit({ ...blank })}><Plus className="h-4 w-4" /> New vendor</Button>
      {edit && (
        <div className="card grid gap-3 p-6 md:grid-cols-2">
          <label><span className="label">Name</span><input className="field" value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
          <label><span className="label">Tagline</span><input className="field" value={edit.tagline ?? ""} onChange={(e) => setEdit({ ...edit, tagline: e.target.value })} /></label>
          <label><span className="label">City</span><input className="field" value={edit.city ?? ""} onChange={(e) => setEdit({ ...edit, city: e.target.value })} /></label>
          <label><span className="label">Address</span><input className="field" value={edit.address ?? ""} onChange={(e) => setEdit({ ...edit, address: e.target.value })} /></label>
          <label><span className="label">Phone</span><input className="field" value={edit.phone ?? ""} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></label>
          <label><span className="label">Email</span><input className="field" value={edit.email ?? ""} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></label>
          <label><span className="label">Operating since</span><input className="field" inputMode="numeric" value={edit.since ?? ""} onChange={(e) => setEdit({ ...edit, since: Number(e.target.value) })} /></label>
          <fieldset className="text-sm"><legend className="label">Specialties</legend><div className="flex flex-wrap gap-3">{CATEGORIES.map((c) => <label key={c.slug} className="inline-flex items-center gap-1.5"><input type="checkbox" checked={edit.specialties?.includes(c.slug) ?? false} onChange={(e) => setEdit({ ...edit, specialties: e.target.checked ? [...(edit.specialties ?? []), c.slug] : (edit.specialties ?? []).filter((x: CategorySlug) => x !== c.slug) })} />{c.name}</label>)}</div></fieldset>
          <div className="flex gap-5 text-sm md:col-span-2">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!edit.verified} onChange={(e) => setEdit({ ...edit, verified: e.target.checked })} /> Verified</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={edit.active !== false} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Active</label>
          </div>
          <div className="flex gap-2 md:col-span-2"><Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save vendor"}</Button><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button></div>
        </div>
      )}
      <AdminTable head={["Vendor", "City", "Specialties", "Status", ""]}>
        {data.vendors.map((v) => (
          <tr key={v.id}>
            <td className="px-4 py-3"><p className="inline-flex items-center gap-1 font-medium">{v.name}{v.verified && <BadgeCheck className="h-4 w-4 text-success" />}</p><p className="text-xs text-muted">{v.tagline}</p></td>
            <td className="px-4 py-3">{v.city}</td>
            <td className="px-4 py-3 text-xs">{v.specialties.map((s) => CATEGORIES.find((c) => c.slug === s)?.name).join(", ")}</td>
            <td className="px-4 py-3"><div className="flex gap-1">{v.active === false ? <Badge tone="danger">Inactive</Badge> : <Badge tone="success">Active</Badge>}{v.isDemo && <Badge>Demo</Badge>}</div></td>
            <td className="px-4 py-3"><div className="flex justify-end gap-1">
              <button className="rounded-full p-2 hover:bg-sand disabled:opacity-30" disabled={demo} aria-label="Edit" onClick={() => setEdit(v)}><Pencil className="h-4 w-4" /></button>
              <button className="rounded-full p-2 text-danger hover:bg-sand disabled:opacity-30" disabled={demo} aria-label="Delete" onClick={async () => { if (!confirm(`Delete ${v.name}?`)) return; try { await adminCall("DELETE", `vendors/${v.id}`); void reload(); } catch (e) { setMsg({ tone: "warning", text: (e as Error).message }); } }}><Trash2 className="h-4 w-4" /></button>
            </div></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
