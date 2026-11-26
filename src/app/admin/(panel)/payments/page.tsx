"use client";

import { FileText } from "lucide-react";
import { PageHead, Pill, Stat, Table, bdt } from "@/components/admin/ui";
import { useLocalOps } from "@/components/admin/useLocal";
import { getPaymentMethod } from "@/data/payments";
import { formatDateTime } from "@/lib/format";

export default function AdminPayments() {
  const { payments, ready } = useLocalOps();
  const paid = payments.filter((p) => p.status === "paid");
  const total = paid.reduce((s, p) => s + p.amount, 0);
  const byMethod = new Map<string, number>();
  for (const p of paid) byMethod.set(p.method || p.cardType || "Other", (byMethod.get(p.method || p.cardType || "Other") ?? 0) + p.amount);
  const top = [...byMethod.entries()].sort((a, b) => b[1] - a[1])[0];
  return (
    <>
      <PageHead title="Payments" subtitle="Every transaction confirmed by SSLCOMMERZ on this device." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Collected" value={bdt(total)} />
        <Stat label="Transactions" value={paid.length} />
        <Stat label="Most used method" value={top ? getPaymentMethod(top[0])?.name ?? top[0] : "—"} />
      </div>
      <Table head={["Transaction", "Booking", "Customer", "Method", "Amount", "Status", "Invoice"]} empty={ready ? "No payments yet." : "Loading…"}>
        {payments.map((p) => (
          <tr key={p.id}>
            <td className="px-4 py-3"><p className="font-mono text-xs">{p.id}</p><p className="text-xs text-muted">{formatDateTime(p.paidAt)}</p></td>
            <td className="px-4 py-3 font-semibold">{p.bookingCode}</td>
            <td className="px-4 py-3">{p.customerName}</td>
            <td className="px-4 py-3 text-xs">{getPaymentMethod(p.method)?.name ?? (p.method || "—")}<br /><span className="text-muted">{p.cardType}</span></td>
            <td className="px-4 py-3 font-semibold">{bdt(p.amount)}</td>
            <td className="px-4 py-3">{p.status === "paid" ? <Pill tone="success">Paid</Pill> : <Pill tone="danger">{p.status}</Pill>}</td>
            <td className="px-4 py-3">{p.status === "paid" && <a className="inline-flex items-center gap-1 text-xs font-semibold text-brand" href={`/invoice/${p.bookingId}`} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" /> {p.invoiceNo}</a>}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
