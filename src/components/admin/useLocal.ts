"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteLocalBooking, demoBookings, localPayments, localUsers, updateLocalBooking, type DemoUser, type LocalPayment } from "@/lib/demo/store";
import type { Booking, BookingStatus } from "@/lib/types";

type Ops = { bookings: Booking[]; payments: LocalPayment[]; users: DemoUser[]; ready: boolean; cloud: boolean; error: string | null };

/**
 * Bookings, payments and customers for the admin panel — from Firestore when Firebase is connected,
 * otherwise from this browser's local store. Refreshes when the tab regains focus.
 */
export function useLocalOps() {
  const [state, setState] = useState<Ops>({ bookings: [], payments: [], users: [], ready: false, cloud: false, error: null });

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/site/ops", { cache: "no-store", credentials: "same-origin" });
      const body = await res.json();
      if (res.ok && body.configured) {
        setState({ bookings: body.bookings, payments: body.payments, users: body.users, ready: true, cloud: true, error: null });
        return;
      }
      if (res.ok && body.configured === false) {
        setState({ bookings: demoBookings(), payments: localPayments(), users: localUsers(), ready: true, cloud: false, error: null });
        return;
      }
      throw new Error(body.error || "Could not load data from Firebase.");
    } catch (e) {
      setState((s) => ({ ...s, ready: true, error: (e as Error).message }));
    }
  }, []);

  useEffect(() => {
    void reload();
    const on = () => void reload();
    window.addEventListener("storage", on);
    window.addEventListener("focus", on);
    // New bookings and payments from customers show up without a manual refresh.
    const timer = setInterval(() => { if (document.visibilityState === "visible") on(); }, 15_000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", on);
      window.removeEventListener("focus", on);
    };
  }, [reload]);

  const setBookingStatus = useCallback(async (id: string, status: BookingStatus) => {
    if (state.cloud) {
      const res = await fetch("/api/site/ops", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      if (!res.ok) alert((await res.json().catch(() => ({}))).error || "Could not update the booking.");
    } else updateLocalBooking(id, { status });
    await reload();
  }, [state.cloud, reload]);

  const deleteBooking = useCallback(async (id: string) => {
    if (state.cloud) {
      const res = await fetch(`/api/site/ops?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) alert((await res.json().catch(() => ({}))).error || "Could not delete the booking.");
    } else deleteLocalBooking(id);
    await reload();
  }, [state.cloud, reload]);

  return { ...state, reload, setBookingStatus, deleteBooking };
}
