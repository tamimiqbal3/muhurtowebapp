"use client";

import { PageHead, Table, bdt } from "@/components/admin/ui";
import { useLocalOps } from "@/components/admin/useLocal";
import { formatDate } from "@/lib/format";

export default function AdminCustomers() {
  const { users, bookings, ready } = useLocalOps();
  return (
    <>
      <PageHead title="Customers" subtitle="Accounts created on this device." />
      <Table head={["Customer", "Phone", "Joined", "Bookings", "Paid"]} empty={ready ? "No customers yet." : "Loading…"}>
        {users.map((u) => {
          const mine = bookings.filter((b) => b.customerId === u.uid);
          return (
            <tr key={u.uid}>
              <td className="px-4 py-3"><p className="font-semibold">{u.name}</p><p className="text-xs text-muted">{u.email}</p></td>
              <td className="px-4 py-3 text-xs">{u.phone || "—"}</td>
              <td className="px-4 py-3 text-xs">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3">{mine.length}</td>
              <td className="px-4 py-3">{bdt(mine.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + b.pricing.total, 0))}</td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
