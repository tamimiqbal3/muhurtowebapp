import "server-only";
import { adminRtdb, isAdminConfigured } from "../firebase/admin";

export type LiveEventType = "booking" | "payment" | "signup" | "request";

/**
 * Pushes an instant alert to the admin panel through Firebase Realtime Database (/adminFeed).
 * Never throws: a live alert must not break the booking or payment it describes.
 */
export async function pushAdminEvent(e: { type: LiveEventType; title: string; body: string; link?: string; amount?: number }) {
  if (!isAdminConfigured()) return;
  try {
    const feed = adminRtdb().ref("adminFeed");
    await feed.push({ ...e, link: e.link ?? "", amount: e.amount ?? 0, at: Date.now() });
    // Keep the feed small: drop anything beyond the newest 200 alerts.
    const old = await feed.orderByChild("at").limitToFirst(1).once("value");
    const count = (await feed.once("value")).numChildren();
    if (count > 200) old.forEach((c) => { void c.ref.remove(); return true; });
  } catch (err) {
    console.error("[live] could not push admin event", (err as Error).message);
  }
}
