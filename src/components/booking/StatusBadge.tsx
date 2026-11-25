"use client";

import type { BookingStatus, MonitoringStatus, PaymentStatus } from "@/lib/types";
import { Badge } from "../ui/misc";
import { useT } from "../i18n/LanguageProvider";

const BOOKING: Record<BookingStatus, { label: string; tone: "neutral" | "gold" | "success" | "warning" | "danger" | "ink" }> = {
  pending_payment: { label: "Awaiting payment", tone: "warning" },
  confirmed: { label: "Confirmed", tone: "success" },
  in_progress: { label: "In progress", tone: "ink" },
  completed: { label: "Completed", tone: "neutral" },
  cancellation_requested: { label: "Cancellation requested", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "danger" },
  rejected: { label: "Rejected", tone: "danger" },
};
const PAYMENT: Record<PaymentStatus, { label: string; tone: "neutral" | "gold" | "success" | "warning" | "danger" }> = {
  unpaid: { label: "Unpaid", tone: "neutral" },
  processing: { label: "Payment started", tone: "gold" },
  paid: { label: "Paid", tone: "success" },
  failed: { label: "Payment failed", tone: "danger" },
  refund_pending: { label: "Refund pending", tone: "warning" },
  refunded: { label: "Refunded", tone: "neutral" },
};
const MONITORING: Record<MonitoringStatus, { label: string; tone: "neutral" | "gold" | "success" | "warning" | "ink" }> = {
  not_started: { label: "Starts after payment", tone: "neutral" },
  pending_assignment: { label: "Agent assignment pending", tone: "warning" },
  assigned: { label: "Agent assigned", tone: "success" },
  active: { label: "Monitoring live", tone: "ink" },
  completed: { label: "Monitoring complete", tone: "neutral" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = BOOKING[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={s.tone}>{useT()(s.label)}</Badge>;
}
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const s = PAYMENT[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={s.tone}>{useT()(s.label)}</Badge>;
}
export function MonitoringBadge({ status }: { status: MonitoringStatus }) {
  const s = MONITORING[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={s.tone}>{useT()(s.label)}</Badge>;
}
