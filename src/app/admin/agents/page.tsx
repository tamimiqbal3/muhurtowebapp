"use client";

import { useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { adminCall, useAdmin } from "@/components/admin/useAdmin";
import { AdminTable } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Badge, Notice, Skeleton } from "@/components/ui/misc";
import type { MonitoringAgent } from "@/lib/types";

export default function AdminAgents() {
  const { data, error, reload } = useAdmin<{ agents: MonitoringAgent[] }>("agents");
  const [f, setF] = useState({ email: "", name: "", phone: "", cities: "" });
  const [msg, setMsg] = useState<{ tone: "success" | "warning"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await adminCall("POST", "agents", f);
      setF({ email: "", name: "", phone: "", cities: "" });
      setMsg({ tone: "success", text: "Agent added. They'll see the Agent workspace after signing in again." });
      void reload();
    } catch (err) {
      setMsg({ tone: "warning", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="card grid gap-3 p-6 md:grid-cols-4">
        <h2 className="text-2xl md:col-span-4">Add a Monitoring Agent</h2>
        <p className="text-sm text-ink-soft md:col-span-4">The person must first register a MUHURTO account. Adding them here gives them the agent role.</p>
        <input className="field" type="email" required placeholder="Registered email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className="field" required placeholder="Display name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="field" required placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <input className="field" placeholder="Cities (comma-separated)" value={f.cities} onChange={(e) => setF({ ...f, cities: e.target.value })} />
        <div className="md:col-span-4"><Button type="submit" size="sm" disabled={busy}><UserPlus className="h-4 w-4" /> Add agent</Button></div>
      </form>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      {error && <Notice tone="warning">{error}</Notice>}
      {!data ? <Skeleton className="h-40" /> : (
        <AdminTable head={["Agent", "Phone", "Cities", "Active events", "Status", ""]}>
          {data.agents.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-3"><p className="font-medium">{a.name}</p><p className="text-xs text-muted">{a.email}</p></td>
              <td className="px-4 py-3">{a.phone}</td>
              <td className="px-4 py-3 text-xs">{a.cities.join(", ") || "Any"}</td>
              <td className="px-4 py-3">{a.activeAssignments ?? 0}</td>
              <td className="px-4 py-3">{a.active ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Inactive</Badge>}</td>
              <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={async () => { await adminCall("PATCH", `agents/${a.id}`, { active: !a.active }); void reload(); }}>{a.active ? "Deactivate" : "Activate"}</Button></td>
            </tr>
          ))}
          {!data.agents.length && <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-muted">No agents yet.</td></tr>}
        </AdminTable>
      )}
    </div>
  );
}
