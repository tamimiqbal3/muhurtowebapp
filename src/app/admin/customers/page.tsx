"use client";

import { useState } from "react";
import { adminCall, useAdmin } from "@/components/admin/useAdmin";
import { AdminTable } from "@/components/admin/AdminShell";
import { Notice, Skeleton } from "@/components/ui/misc";
import type { Role, UserProfile } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function AdminCustomers() {
  const { data, error, reload } = useAdmin<{ users: UserProfile[] }>("customers");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<{ tone: "success" | "warning"; text: string } | null>(null);
  if (error) return <Notice tone="warning">{error}</Notice>;
  if (!data) return <Skeleton className="h-64" />;
  const list = data.users.filter((u) => !q || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-5">
      <input className="field max-w-sm" placeholder="Search name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" />
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <AdminTable head={["Name", "Contact", "City", "Joined", "Role"]}>
        {list.map((u) => (
          <tr key={u.uid}>
            <td className="px-4 py-3 font-medium">{u.name}</td>
            <td className="px-4 py-3 text-xs">{u.email}<br />{u.phone}</td>
            <td className="px-4 py-3">{u.city || "—"}</td>
            <td className="px-4 py-3">{formatDate(u.createdAt)}</td>
            <td className="px-4 py-3">
              <select className="field h-9 w-auto py-0 text-xs" value={u.role} aria-label={`Role for ${u.name}`} onChange={async (e) => { try { await adminCall("PATCH", `customers/${u.uid}`, { role: e.target.value as Role }); setMsg({ tone: "success", text: `${u.name} is now ${e.target.value}. They need to sign in again.` }); void reload(); } catch (err) { setMsg({ tone: "warning", text: (err as Error).message }); } }}>
                <option value="customer">customer</option><option value="agent">agent</option><option value="admin">admin</option>
              </select>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
