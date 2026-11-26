import type { Location } from "../lib/types";

/** MUHURTO currently serves Dhaka only. Areas can be added or switched off in Admin → Locations. */
const L = (id: string, name: string, nameBn: string): Location => ({ id, name, nameBn, active: true });

export const LOCATIONS: Location[] = [
  L("gulshan", "Gulshan", "গুলশান"),
  L("banani", "Banani", "বনানী"),
  L("baridhara", "Baridhara", "বারিধারা"),
  L("bashundhara", "Bashundhara R/A", "বসুন্ধরা আ/এ"),
  L("uttara", "Uttara", "উত্তরা"),
  L("mirpur", "Mirpur", "মিরপুর"),
  L("mohammadpur", "Mohammadpur", "মোহাম্মদপুর"),
  L("dhanmondi", "Dhanmondi", "ধানমন্ডি"),
  L("lalmatia", "Lalmatia", "লালমাটিয়া"),
  L("tejgaon", "Tejgaon", "তেজগাঁও"),
  L("mohakhali", "Mohakhali", "মহাখালী"),
  L("badda", "Badda", "বাড্ডা"),
  L("rampura", "Rampura", "রামপুরা"),
  L("khilgaon", "Khilgaon", "খিলগাঁও"),
  L("motijheel", "Motijheel", "মতিঝিল"),
  L("shantinagar", "Shantinagar", "শান্তিনগর"),
  L("old-dhaka", "Old Dhaka", "পুরান ঢাকা"),
  L("purbachal", "Purbachal", "পূর্বাচল"),
];

export const SERVICE_CITY = "Dhaka";
