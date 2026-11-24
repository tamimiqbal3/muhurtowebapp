import type { Vendor } from "../lib/types";

// DEMO DATA — fictional service providers for development and review.
// Replace with real, verified vendors via the admin dashboard before launch.
const v = (id: string, name: string, tagline: string, city: string, address: string, since: number, specialties: Vendor["specialties"], verified = true): Vendor => ({
  id, name, tagline, city, address, since, verified, specialties,
  phone: "+880 1700-000000",
  email: `${id}@demo.muhurto.app`,
  isDemo: true,
  active: true,
});

export const VENDORS: Vendor[] = [
  v("shapla-events", "Shapla Events Studio", "Bridal stages with a Bengali soul", "Dhaka", "Banani, Dhaka", 2012, ["wedding", "family-events"]),
  v("nakshi-decor", "Nakshi Decor House", "Nakshi kantha and jamdani-inspired styling", "Dhaka", "Dhanmondi, Dhaka", 2015, ["wedding", "family-events"]),
  v("rangdhanu-decor", "Rangdhanu Decor", "North Bengal's favourite wedding decorators", "Rajshahi", "Shaheb Bazar, Rajshahi", 2014, ["wedding", "birthday", "family-events"]),
  v("prodip-lighting", "Prodip Lighting Co.", "Warm light for memorable nights", "Dhaka", "Mohakhali DOHS, Dhaka", 2011, ["wedding", "family-events", "corporate-events"]),
  v("golpo-frames", "Golpo Frames", "Documentary wedding films and photographs", "Dhaka", "Gulshan 1, Dhaka", 2016, ["wedding", "family-events"]),
  v("moyna-photography", "Moyna Photography", "Candid storytelling across Bangladesh", "Chattogram", "GEC Circle, Chattogram", 2017, ["wedding", "birthday", "family-events"]),
  v("chhobi-booth", "Chhobi Booth Co.", "Instant prints, props and 360° videos", "Dhaka", "Uttara Sector 7, Dhaka", 2019, ["wedding", "birthday", "corporate-events", "family-events"]),
  v("taal-sound", "Taal Sound Lab", "Clean sound, from shehnai to DJ sets", "Dhaka", "Mirpur 10, Dhaka", 2013, ["wedding", "birthday", "family-events"]),
  v("utshob-party", "Utshob Party Co.", "Birthdays that feel handmade", "Dhaka", "Bashundhara R/A, Dhaka", 2018, ["birthday"]),
  v("balloon-bari", "Balloon Bari", "Organic balloon art and dessert tables", "Chattogram", "Nasirabad, Chattogram", 2020, ["birthday", "family-events"]),
  v("meghna-conference", "Meghna Conference Services", "Conference staging and seating at scale", "Dhaka", "Tejgaon I/A, Dhaka", 2009, ["corporate-events"]),
  v("padma-av", "Padma AV Solutions", "Line arrays, LED walls and broadcast audio", "Dhaka", "Motijheel C/A, Dhaka", 2010, ["corporate-events", "wedding"]),
  v("lens-and-ledger", "Lens & Ledger Media", "Corporate photography and event films", "Dhaka", "Karwan Bazar, Dhaka", 2016, ["corporate-events"]),
  v("aangina-events", "Aangina Family Events", "Courtyard warmth for family occasions", "Sylhet", "Zindabazar, Sylhet", 2015, ["family-events", "birthday"]),
  v("shonar-seating", "Shonar Seating & Linen", "Chairs, lounges, tables and linen hire", "Dhaka", "Shyamoli, Dhaka", 2008, ["wedding", "corporate-events", "family-events", "birthday"]),
  v("rupsha-events", "Rupsha Events", "Riverside elegance from Khulna", "Khulna", "KDA Avenue, Khulna", 2013, ["wedding", "family-events"]),
  v("barind-kitchen", "Barind Kitchen", "Heritage Rajshahi recipes for big gatherings", "Rajshahi", "Uposhohor, Rajshahi", 2012, ["food-culinary"]),
  v("karnaphuli-catering", "Karnaphuli Catering", "Mezban and modern platters", "Chattogram", "Agrabad, Chattogram", 2007, ["food-culinary"]),
  v("dhaka-platters", "Dhaka Platter House", "Set menus and grazing tables", "Dhaka", "Lalmatia, Dhaka", 2014, ["food-culinary"]),
  v("fuchka-junction", "Fuchka Junction", "Live fuchka and chotpoti counters", "Dhaka", "Dhanmondi 27, Dhaka", 2016, ["food-culinary"]),
  v("cha-ghor", "Cha Ghor", "Sreemangal leaves, brewed on site", "Sylhet", "Amberkhana, Sylhet", 2018, ["food-culinary"]),
  v("brew-cart", "Brew Cart BD", "Espresso bars for events", "Dhaka", "Gulshan 2, Dhaka", 2020, ["food-culinary", "corporate-events"]),
];

export function getVendor(id: string): Vendor | undefined {
  return VENDORS.find((x) => x.id === id);
}
