/* Grants a role to a registered user (stored in Realtime Database).
   Usage: npm run set-role -- someone@example.com admin|agent|customer [phone] [city,city] */
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { initAdmin } from "./_admin";

async function main() {
  const [email, role, phone = "", cities = ""] = process.argv.slice(2);
  if (!email || !["admin", "agent", "customer"].includes(role)) {
    console.error("Usage: npm run set-role -- <email> <admin|agent|customer> [phone] [city,city]");
    process.exit(1);
  }
  initAdmin();
  const user = await getAuth().getUserByEmail(email);
  const db = getDatabase();
  const name = user.displayName ?? email.split("@")[0];
  await getAuth().setCustomUserClaims(user.uid, { role });
  await db.ref(`users/${user.uid}`).update({ uid: user.uid, email, name, role, updatedAt: new Date().toISOString() });
  if (role === "agent") {
    const list = cities.split(",").map((c) => c.trim()).filter(Boolean);
    const agent = db.ref(`monitoringAgents/${user.uid}`);
    const existing = (await agent.once("value")).val() as { activeAssignments?: number; createdAt?: string } | null;
    await agent.update({ id: user.uid, name, email, phone, cities: list.length ? list : "__empty_array__", active: true, activeAssignments: existing?.activeAssignments ?? 0, createdAt: existing?.createdAt ?? new Date().toISOString() });
  }
  console.log(`${email} is now ${role}. Ask them to sign out and back in.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
