"use client";

import { CheckCircle2, Circle, CircleDot, Phone, UserRoundCheck, Clock } from "lucide-react";
import type { Booking, EventUpdate, MonitoringAssignment, VendorProgressStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { Badge } from "../ui/misc";
import { MonitoringBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import { useLang } from "../i18n/LanguageProvider";

const VP: Record<VendorProgressStatus, { label: string; tone: "neutral" | "gold" | "success" | "warning" | "danger" | "ink" }> = {
  pending: { label: "Pending", tone: "neutral" },
  confirmed: { label: "Confirmed", tone: "gold" },
  preparing: { label: "Preparing", tone: "warning" },
  on_site: { label: "On site", tone: "ink" },
  completed: { label: "Completed", tone: "success" },
  issue: { label: "Issue reported", tone: "danger" },
};

export function MonitoringPanel({ booking, assignment, updates }: { booking: Booking; assignment: MonitoringAssignment | null; updates: EventUpdate[] }) {
  const agentAssigned = Boolean(assignment?.agentId && booking.monitoring?.agentName);
  const { t, lang } = useLang();
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl">{t("Event monitoring")}</h2>
          <MonitoringBadge status={booking.monitoring?.status ?? "not_started"} />
        </div>
        {booking.paymentStatus !== "paid" ? (
          <p className="mt-3 text-sm text-ink-soft">{t("A Monitoring Agent is assigned after your payment is verified. They will coordinate every vendor so you don't have to.")}</p>
        ) : agentAssigned ? (
          <div className="mt-5 flex items-center gap-4 rounded-2xl bg-sand/70 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-paper"><UserRoundCheck className="h-5 w-5" /></span>
            <div className="flex-1">
              <p className="text-xs text-muted">{t("Your Monitoring Agent")}</p>
              <p className="font-semibold">{booking.monitoring.agentName}</p>
            </div>
            {booking.monitoring.agentPhone && (
              <a href={`tel:${booking.monitoring.agentPhone}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-paper px-4 text-sm font-semibold hover:bg-ink hover:text-paper"><Phone className="h-4 w-4" /> {t("Call")}</a>
            )}
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-warning/40 bg-[#fbf3e4] p-4 text-sm">
            <Clock className="h-5 w-5 text-warning" />
            <p>{t("Assignment pending — we're matching an available agent to your event. You'll be notified once it's confirmed.")}</p>
          </div>
        )}

        {assignment && (
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <p className="eyebrow mb-4">{t("Preparation status")}</p>
              <ol className="space-y-3">
                {assignment.milestones.map((m) => (
                  <li key={m.key} className="flex items-start gap-3 text-sm">
                    {m.status === "done" ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : m.status === "in_progress" ? <CircleDot className="h-5 w-5 shrink-0 text-warning" /> : <Circle className="h-5 w-5 shrink-0 text-line" />}
                    <div>
                      <p className={cn(m.status === "pending" && "text-muted")}>{t(m.label)}</p>
                      {m.updatedAt && m.status !== "pending" && <p className="text-xs text-muted">{formatDateTime(m.updatedAt, lang)}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="eyebrow mb-4">{t("Vendor progress")}</p>
              <ul className="space-y-2.5">
                {assignment.vendorProgress.map((v) => (
                  <li key={v.serviceId} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{v.serviceName}</p>
                      <p className="truncate text-xs text-muted">{v.vendorName}</p>
                    </div>
                    <Badge tone={VP[v.status].tone}>{t(VP[v.status].label)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-3xl">{t("Event timeline")}</h2>
        {updates.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">{t("Updates from MUHURTO and your Monitoring Agent will appear here.")}</p>
        ) : (
          <ol className="relative mt-6 space-y-6 border-l border-line pl-6">
            {updates.map((u) => (
              <li key={u.id} className="relative">
                <span className={cn("absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-paper", u.type === "issue" ? "bg-danger" : u.type === "milestone" ? "bg-success" : "bg-gold")} />
                <p className="text-sm">{t(u.message)}</p>
                <p className="mt-1 text-xs text-muted">{u.authorName} · {formatDateTime(u.createdAt, lang)}{u.visibility === "internal" && ` · ${t("internal")}`}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
