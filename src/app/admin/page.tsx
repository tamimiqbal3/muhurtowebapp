"use client";

import Link from "next/link";
import { useAdmin } from "@/components/admin/useAdmin";
import { StatCard } from "@/components/dashboard/Shell";
import { BookingStatusBadge } from "@/components/booking/StatusBadge";
import { Notice, Skeleton } from "@/components/ui/misc";
import type { AppNotification, Booking } from "@/lib/types";
import { formatBDT, formatDate, formatDateTime, titleCase } from "@/lib/format";

interface Stats {
  totalBookings: number;
  byStatus: Record<string, number>;
  revenue: number;
  platformFees: number;
  serviceValue: number;
  pendingAssignments: number;
  openCustomizations: number;
  customers: number;
  activeAgents: number;
  recent: Booking[];
  notifications: AppNotification[];
}

export default function AdminOverview() {
  const { data, error } = useAdmin<Stats>("stats");
  if (error) return <Notice tone="warning">{error}</Notice>;
  if (!data) return <div className="grid gap-4 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;
  const max = Math.max(1, ...Object.values(data.byStatus));
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total bookings" value={data.totalBookings} />
        <StatCard label="Revenue collected" value={formatBDT(data.revenue)} hint="Verified payments" />
        <StatCard label="Platform fees (2%)" value={formatBDT(data.platformFees)} hint={`On ${formatBDT(data.serviceValue)} of services`} />
        <StatCard label="Awaiting agent" value={data.pendingAssignments} hint="Paid bookings without an agent" />
        <StatCard label="Open customisations" value={data.openCustomizations} />
        <StatCard label="Registered users" value={data.customers} />
        <StatCard label="Active agents" value={data.activeAgents} />
      </div>
      {data.pendingAssignments > 0 && <Notice tone="warning" title="Action needed">{data.pendingAssignments} paid booking(s) need a Monitoring Agent. <Link href="/admin/bookings?status=confirmed" className="font-semibold underline">Assign now</Link></Notice>}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-2xl">Bookings by status</h2>
          <ul className="mt-5 space-y-3">
            {Object.entries(data.byStatus).map(([k, v]) => (
              <li key={k} className="text-sm">
                <div className="mb-1 flex justify-between"><span>{titleCase(k)}</span><span className="font-semibold">{v}</span></div>
                <div className="h-2 rounded-full bg-sand"><div className="h-2 rounded-full bg-sindoor" style={{ width: `${(v / max) * 100}%` }} /></div>
              </li>
            ))}
            {!Object.keys(data.byStatus).length && <li className="text-sm text-muted">No bookings yet.</li>}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-2xl">Alerts</h2>
          <ul className="mt-4 divide-y divide-line">
            {data.notifications.map((n) => (
              <li key={n.id} className="py-3 text-sm">
                <p className="font-semibold">{n.title}</p>
                <p className="text-ink-soft">{n.body}</p>
                <p className="text-xs text-muted">{formatDateTime(n.createdAt)}{n.link && <> · <Link href={n.link} className="text-sindoor">open</Link></>}</p>
              </li>
            ))}
            {!data.notifications.length && <li className="py-3 text-sm text-muted">No alerts.</li>}
          </ul>
        </div>
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between"><h2 className="text-2xl">Recent bookings</h2><Link href="/admin/bookings" className="text-sm font-semibold text-sindoor">All bookings</Link></div>
        <ul className="mt-4 divide-y divide-line">
          {data.recent.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span><span className="font-semibold">{b.code}</span> · {b.contact.name} · {formatDate(b.event.date)} · {b.event.city}</span>
              <span className="flex items-center gap-3"><BookingStatusBadge status={b.status} /><span className="font-semibold">{formatBDT(b.pricing.total)}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
