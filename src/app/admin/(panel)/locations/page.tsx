"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { remove, upsert, useCatalog } from "@/lib/store/catalog";
import { Btn, Card, PageHead, Pill, Table, slugify } from "@/components/admin/ui";

export default function AdminLocations() {
  const data = useCatalog();
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  function add() {
    const id = slugify(name);
    if (!id || data.locations.some((l) => l.id === id)) return;
    upsert("locations", { id, name: name.trim(), nameBn: nameBn.trim() || name.trim(), active: true });
    setName("");
    setNameBn("");
  }
  return (
    <>
      <PageHead title="Locations" subtitle="Customers can only choose these Dhaka areas for their events." />
      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input className="field" placeholder="Area name (English), e.g. Wari" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="field" placeholder="Area name (Bangla)" value={nameBn} onChange={(e) => setNameBn(e.target.value)} />
          <Btn onClick={add} disabled={!name.trim()}><Plus className="h-4 w-4" /> Add area</Btn>
        </div>
      </Card>
      <Table head={["Area", "Bangla", "Status", ""]}>
        {data.locations.map((l) => (
          <tr key={l.id}>
            <td className="px-4 py-3 font-medium">{l.name}<span className="ml-1 text-xs text-muted">Dhaka</span></td>
            <td className="px-4 py-3"><input className="field !py-1.5 text-sm" value={l.nameBn} onChange={(e) => upsert("locations", { ...l, nameBn: e.target.value })} /></td>
            <td className="px-4 py-3"><button onClick={() => upsert("locations", { ...l, active: !l.active })}>{l.active ? <Pill tone="success">Available</Pill> : <Pill>Hidden</Pill>}</button></td>
            <td className="px-4 py-3 text-right"><Btn variant="ghost" className="text-danger" onClick={() => confirm(`Remove ${l.name}?`) && remove("locations", l.id)}><Trash2 className="h-4 w-4" /></Btn></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
