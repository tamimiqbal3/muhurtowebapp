"use client";

import { useAdmin } from "@/components/admin/useAdmin";
import { AdminTable } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/dashboard/Shell";
import { Badge, Notice, Skeleton } from "@/components/ui/misc";
import type { PaymentRecord } from "@/lib/types";
import { formatBDT, formatDateTime, titleCase } from "@/lib/format";

const tone = (s: PaymentRecord["status"]) => ({ paid: "success", initiated: "gold", failed: "danger", cancelled: "neutral", superseded: "neutral", duplicate_refund_required: "danger" } as const)[s];

export default function AdminPayments() {
  const { data, error } = useAdmin<{ payments: PaymentRecord[] }>("payments");
  if (error) return <Notice tone="warning">{error}</Notice>;
  if (!data) return <Skeleton className="h-64" />;
  const paid = data.payments.filter((p) => p.status === "paid");
  const dupes = data.payments.filter((p) => p.status === "duplicate_refund_required");
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Collected" value={formatBDT(paid.reduce((s, p) => s + p.amount, 0))} />
        <StatCard label="Platform fees (2%)" value={formatBDT(paid.reduce((s, p) => s + p.breakdown.platformFee, 0))} />
        <StatCard label="Payable to vendors" value={formatBDT(paid.reduce((s, p) => s + p.breakdown.subtotal, 0))} />
      </div>
      {dupes.length > 0 && <Notice tone="warning" title="Duplicate payments">{dupes.length} payment(s) arrived for already-paid bookings and must be refunded via the SSLCommerz merchant panel.</Notice>}
      <AdminTable head={["Transaction", "Booking", "Services", "Fee", "Total", "Status", "Mode", "Updated"]} min={900}>
        {data.payments.map((p) => (
          <tr key={p.id}>
            <td className="px-4 py-3 font-mono text-xs">{p.id}{p.bankTranId && <><br /><span className="text-muted">{p.bankTranId}</span></>}</td>
            <td className="px-4 py-3">{p.bookingCode}</td>
            <td className="px-4 py-3">{formatBDT(p.breakdown.subtotal)}</td>
            <td className="px-4 py-3">{formatBDT(p.breakdown.platformFee)}</td>
            <td className="px-4 py-3 font-semibold">{formatBDT(p.amount)}</td>
            <td className="px-4 py-3"><Badge tone={tone(p.status)}>{titleCase(p.status)}</Badge>{p.failureReason && <p className="mt-1 text-xs text-muted">{p.failureReason}</p>}</td>
            <td className="px-4 py-3 text-xs">{p.mode}{p.cardType && ` · ${p.cardType}`}</td>
            <td className="px-4 py-3 text-xs">{formatDateTime(p.updatedAt)}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
