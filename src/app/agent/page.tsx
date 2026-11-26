"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MonitoringAssignment } from "@/lib/types";
import { getCategory } from "@/data/categories";
import { formatDate, titleCase } from "@/lib/format";
import { Badge, EmptyState, Notice, Skeleton } from "@/components/ui/misc";

export default function AgentHome() {
  const [items, setItems] = useState<MonitoringAssignment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/agent/assignments", { cache: "no-store" })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setItems(d.assignments); })
      .catch((e) => setError(e.message));
  }, []);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div>
      <p className="eyebrow">Monitoring Agent</p>
      <h1 className="mt-1 text-4xl sm:text-5xl">Assigned events</h1>
      <div className="mt-8">
        {error && <Notice tone="warning">{error}</Notice>}
        {!items ? <Skeleton className="h-40" /> : items.length === 0 ? <EmptyState title="No events assigned yet" body="When an admin assigns you to a paid booking, it will appear here." /> : (
          <ul className="grid gap-3 md:grid-cols-2">
            {items.map((a) => {
              const done = a.milestones.filter((m) => m.status === "done").length;
              return (
                <li key={a.id}>
                  <Link href={`/agent/${a.bookingId}`} className="card group block p-5 transition hover:shadow-[var(--shadow-lift)]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{a.bookingCode} · {getCategory(a.categorySlug)?.name}</p>
                      <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-sindoor" />
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{formatDate(a.eventDate)} · {a.city} {a.eventDate === today && <Badge tone="sindoor">Today</Badge>}</p>
                    <div className="mt-3 h-1.5 rounded-full bg-sand"><div className="h-1.5 rounded-full bg-success" style={{ width: `${(done / a.milestones.length) * 100}%` }} /></div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <Badge tone={a.status === "completed" ? "neutral" : a.status === "active" ? "ink" : "warning"}>{titleCase(a.status)}</Badge>
                      {a.vendorProgress.some((v) => v.status === "issue") && <Badge tone="danger">Vendor issue</Badge>}
                      {!a.agentId && <Badge tone="warning">Unassigned</Badge>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
