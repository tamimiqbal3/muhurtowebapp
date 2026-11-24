"use client";

import { adminCall, useAdmin } from "@/components/admin/useAdmin";
import { AdminTable } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Badge, Notice, Skeleton } from "@/components/ui/misc";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function AdminReviews() {
  const { data, error, reload } = useAdmin<{ reviews: Review[] }>("reviews");
  if (error) return <Notice tone="warning">{error}</Notice>;
  if (!data) return <Skeleton className="h-64" />;
  return (
    <div className="space-y-4">
      {!data.reviews.length && <Notice>No reviews in Firestore yet. Import the catalogue from Admin → Services to load demo reviews.</Notice>}
      <AdminTable head={["Review", "Service", "Rating", "Date", "Status", ""]}>
        {data.reviews.map((r) => (
          <tr key={r.id}>
            <td className="max-w-md px-4 py-3"><p>{r.comment}</p><p className="text-xs text-muted">{r.author} · {r.city}</p></td>
            <td className="px-4 py-3 text-xs">{r.serviceId}</td>
            <td className="px-4 py-3">{r.rating}★</td>
            <td className="px-4 py-3 text-xs">{formatDate(r.date)}</td>
            <td className="px-4 py-3"><div className="flex gap-1">{r.hidden ? <Badge tone="danger">Hidden</Badge> : <Badge tone="success">Visible</Badge>}{r.isDemo && <Badge>Demo</Badge>}</div></td>
            <td className="px-4 py-3"><div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={async () => { await adminCall("PATCH", `reviews/${r.id}`, { hidden: !r.hidden }); void reload(); }}>{r.hidden ? "Show" : "Hide"}</Button>
              <Button size="sm" variant="ghost" className="text-danger" onClick={async () => { if (confirm("Delete this review?")) { await adminCall("DELETE", `reviews/${r.id}`); void reload(); } }}>Delete</Button>
            </div></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
