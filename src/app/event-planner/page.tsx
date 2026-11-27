import { redirect } from "next/navigation";

/** The planner is now Ayojon, the floating chat on every page. */
export default function EventPlannerPage() {
  redirect("/?chat=1");
}
