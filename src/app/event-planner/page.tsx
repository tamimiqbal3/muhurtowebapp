import { redirect } from "next/navigation";

/** The planner is now Shubho, the floating chat on every page. */
export default function EventPlannerPage() {
  redirect("/?chat=1");
}
