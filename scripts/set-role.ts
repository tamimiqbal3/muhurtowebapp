/* Grants a role to a registered user.
   Usage: npm run set-role -- someone@example.com admin|agent|customer [phone] [city,city] */
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "./_admin";

async function main() {
  const [email, role, phone = "", cities = ""] = process.argv.slice(2);
  if (!email || !["admin", "agent", "customer"].includes(role)) {
    console.error("Usage: npm run set-role -- <email> <admin|agent|customer> [phone] [city,city]");
    process.exit(1);
  }
  initAdmin();
  const user = await getAuth().getUserByEmail(email);
  const db = getFirestore();
  await getAuth().setCustomUserClaims(user.uid, { role });
  await db.collection("users").doc(user.uid).set({ uid: user.uid, email, name: user.displayName ?? email.split("@")[0], role, updatedAt: new Date().toISOString() }, { merge: true });
  if (role === "agent") {
    await db.collection("monitoringAgents").doc(user.uid).set(
      { id: user.uid, name: user.displayName ?? email.split("@")[0], email, phone, cities: cities.split(",").map((c) => c.trim()).filter(Boolean), active: true, activeAssignments: 0, createdAt: new Date().toISOString() },
      { merge: true },
    );
  }
  console.log(`${email} is now ${role}. Ask them to sign out and back in.`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
