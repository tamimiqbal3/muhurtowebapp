"use client";

import { Trash2 } from "lucide-react";
import { remove, upsert, useCatalog } from "@/lib/store/catalog";
import { Btn, PageHead, Pill, Table } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";

export default function AdminReviews() {
  const data = useCatalog();
  const name = (id: string) => data.services.find((s) => s.id === id)?.name ?? id;
  return (
    <>
      <PageHead title="Reviews" subtitle="Hide or remove customer reviews shown on service pages." />
      <Table head={["Review", "Service", "Rating", "Date", "Status", ""]} empty="No reviews yet.">
        {data.reviews.map((r) => (
          <tr key={r.id}>
            <td className="max-w-md px-4 py-3"><p>{r.comment}</p><p className="text-xs text-muted">{r.author}</p></td>
            <td className="px-4 py-3 text-xs">{name(r.serviceId)}</td>
            <td className="px-4 py-3">{r.rating}/5</td>
            <td className="px-4 py-3 text-xs">{formatDate(r.date)}</td>
            <td className="px-4 py-3"><button onClick={() => upsert("reviews", { ...r, hidden: !r.hidden })}>{r.hidden ? <Pill>Hidden</Pill> : <Pill tone="success">Visible</Pill>}</button></td>
            <td className="px-4 py-3 text-right"><Btn variant="ghost" className="text-danger" onClick={() => confirm("Delete this review?") && remove("reviews", r.id)}><Trash2 className="h-4 w-4" /></Btn></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
