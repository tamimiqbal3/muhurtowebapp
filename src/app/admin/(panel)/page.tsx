"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/store/catalog";
import { Card, PageHead, Pill, Stat, bdt } from "@/components/admin/ui";
import { useLocalOps } from "@/components/admin/useLocal";
import { formatDate } from "@/lib/format";

export default function AdminDashboard() {
  const data = useCatalog();
  const { bookings, payments, users, ready } = useLocalOps();
  const paid = payments.filter((p) => p.status === "paid");
  const revenue = paid.reduce((s, p) => s + p.amount, 0);
  const paidBookings = bookings.filter((b) => b.paymentStatus === "paid");
  const platformFees = paidBookings.reduce((s, b) => s + b.pricing.platformFee, 0);
  const pending = bookings.filter((b) => b.status === "pending_payment").length;
  const avg = paid.length ? revenue / paid.length : 0;
  const byCat = new Map<string, number>();
  for (const b of paidBookings) for (const l of b.lines) byCat.set(l.categorySlug, (byCat.get(l.categorySlug) ?? 0) + l.lineTotal);
  const catRows = data.categories.map((c) => ({ name: c.name, value: byCat.get(c.slug) ?? 0 }));
  const maxCat = Math.max(1, ...catRows.map((r) => r.value));
  const last30 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return { key, label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: paid.filter((p) => p.paidAt.slice(0, 10) === key).reduce((s, p) => s + p.amount, 0) };
  });
  const maxDay = Math.max(1, ...last30.map((d) => d.value));
  const topServices = (() => {
    const m = new Map<string, { name: string; n: number; total: number }>();
    for (const b of paidBookings) for (const l of b.lines) {
      const e = m.get(l.serviceId) ?? { name: l.serviceName, n: 0, total: 0 };
      e.n += 1;
      e.total += l.lineTotal;
      m.set(l.serviceId, e);
    }
    return [...m.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  })();

  return (
    <>
      <PageHead title="Dashboard" subtitle="Business overview from bookings and payments recorded on this device." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total revenue" value={bdt(revenue)} hint={`${paid.length} successful payments`} />
        <Stat label="Platform fees earned" value={bdt(platformFees)} hint="2% of paid bookings" />
        <Stat label="Bookings" value={bookings.length} hint={`${pending} awaiting payment`} />
        <Stat label="Average order" value={bdt(avg)} hint={`${users.length} registered customers`} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Categories" value={data.categories.length} />
        <Stat label="Services & packages" value={data.services.length} hint={`${data.services.filter((s) => s.active !== false).length} live`} />
        <Stat label="Vendors" value={data.vendors.length} />
        <Stat label="Dhaka locations" value={data.locations.filter((l) => l.active).length} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="font-sans text-base font-semibold">Revenue — last 14 days</h2>
          <div className="mt-5 flex h-44 items-end gap-1.5">
            {last30.map((d) => (
              <div key={d.key} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${d.label}: ${bdt(d.value)}`}>
                <div className="rounded-t-md bg-brand/80" style={{ height: `${Math.max(2, (d.value / maxDay) * 100)}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[0.65rem] text-muted"><span>{last30[0].label}</span><span>{last30[13].label}</span></div>
        </Card>
        <Card>
          <h2 className="font-sans text-base font-semibold">Revenue by category</h2>
          <ul className="mt-4 space-y-3">
            {catRows.map((r) => (
              <li key={r.name}>
                <div className="flex justify-between text-xs"><span className="font-medium">{r.name}</span><span className="text-muted">{bdt(r.value)}</span></div>
                <div className="mt-1 h-2 rounded-full bg-sand"><div className="h-2 rounded-full bg-sky" style={{ width: `${(r.value / maxCat) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between"><h2 className="font-sans text-base font-semibold">Recent bookings</h2><Link href="/admin/bookings" className="text-xs font-semibold text-brand">View all</Link></div>
          <ul className="mt-3 divide-y divide-line text-sm">
            {bookings.slice(0, 6).map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="min-w-0"><span className="font-semibold">{b.code}</span> <span className="text-muted">· {b.contact.name} · {formatDate(b.event.date)}</span></span>
                <span className="flex items-center gap-2">{b.paymentStatus === "paid" ? <Pill tone="success">Paid</Pill> : <Pill tone="warning">Unpaid</Pill>}<span className="font-semibold">{bdt(b.pricing.total)}</span></span>
              </li>
            ))}
            {ready && !bookings.length && <li className="py-6 text-center text-muted">No bookings yet.</li>}
          </ul>
        </Card>
        <Card>
          <h2 className="font-sans text-base font-semibold">Top services</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {topServices.map((s) => <li key={s.name} className="flex justify-between gap-2 py-2.5"><span className="min-w-0 truncate">{s.name}</span><span className="shrink-0 text-muted">{bdt(s.total)}</span></li>)}
            {ready && !topServices.length && <li className="py-6 text-center text-muted">No paid bookings yet.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}
