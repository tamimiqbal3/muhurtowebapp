import "server-only";
import { notFound } from "next/navigation";
import { ApiError, type SessionUser } from "./auth";
import { getBookingForUser } from "./bookings";

export async function loadBookingOr404(id: string | undefined, user: SessionUser) {
  if (!id) notFound();
  try {
    return await getBookingForUser(id, user);
  } catch (e) {
    if (e instanceof ApiError) notFound();
    throw e;
  }
}
