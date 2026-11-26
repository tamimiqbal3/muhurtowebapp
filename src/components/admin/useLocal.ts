"use client";

import { useCallback, useEffect, useState } from "react";
import { demoBookings, localPayments, localUsers, type DemoUser, type LocalPayment } from "@/lib/demo/store";
import type { Booking } from "@/lib/types";

/** Bookings, payments and customers from the local store, refreshed on change. */
export function useLocalOps() {
  const [state, setState] = useState<{ bookings: Booking[]; payments: LocalPayment[]; users: DemoUser[]; ready: boolean }>({ bookings: [], payments: [], users: [], ready: false });
  const reload = useCallback(() => setState({ bookings: demoBookings(), payments: localPayments(), users: localUsers(), ready: true }), []);
  useEffect(() => {
    reload();
    const on = () => reload();
    window.addEventListener("storage", on);
    window.addEventListener("focus", on);
    return () => {
      window.removeEventListener("storage", on);
      window.removeEventListener("focus", on);
    };
  }, [reload]);
  return { ...state, reload };
}
