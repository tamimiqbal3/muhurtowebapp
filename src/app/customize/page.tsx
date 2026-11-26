import { redirect } from "next/navigation";

/** Custom planning now happens in the conversational planner. */
export default function CustomizePage() {
  redirect("/event-planner");
}
