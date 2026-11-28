import type { Vendor } from "../lib/types";

// Partner vendors — all based in Dhaka. Manage them from Admin → Vendors.
const v = (id: string, name: string, tagline: string, area: string, since: number, specialties: Vendor["specialties"], phone: string): Vendor => ({
  id, name, tagline, city: "Dhaka", address: `${area}, Dhaka`, since, verified: true, specialties,
  phone, email: `${id}@muhurto.app`, isDemo: false, active: true,
});

/**
 * Real Dhaka restaurants and caterers named on the food counter. They are NOT marked verified and carry no
 * phone or email until a partnership is signed: add their details in Admin → Vendors once confirmed.
 */
const restaurant = (id: string, name: string, tagline: string, area: string, since: number): Vendor => ({
  id, name, tagline, city: "Dhaka", address: `${area}, Dhaka`, since, verified: false, specialties: ["food-culinary"],
  phone: "", email: "", isDemo: false, active: true,
});

export const VENDORS: Vendor[] = [
  v("deshi-rannaghor", "Deshi Rannaghor", "Home-style dishes from across Bangladesh", "Mohammadpur", 0, ["food-culinary"], ""),
  v("rosh-juice-bar", "Rosh Juice Bar", "Fresh juices, lassi and borhani for events", "Dhanmondi", 0, ["food-culinary"], ""),
  restaurant("fakhruddin-biryani", "Fakhruddin Biryani", "Kacchi biryani, a Dhaka wedding favourite", "Moghbazar", 0),
  restaurant("hotel-kasturi", "Hotel Kasturi", "Traditional Bangladeshi cuisine", "Old Paltan", 1980),
  restaurant("iqbal-catering", "Iqbal Catering", "Wedding and event catering", "Mohammadpur", 1987),
  restaurant("chows", "Chows", "Cantonese and Asian fusion", "Gulshan", 0),
  restaurant("xinxian", "Xinxian Restaurant", "Bangla-Chinese family dining", "Dhanmondi", 0),
  restaurant("bamboo-shoot", "Bamboo Shoot", "Authentic Chinese cuisine", "Gulshan", 0),
  restaurant("jing-ling", "Jing Ling Chinese Restaurant", "Wontons and Thai soup", "Dhanmondi", 0),
  v("shapla-events", "Shapla Events Studio", "Bridal stages with a Bengali soul", "Banani", 2012, ["wedding", "family-events"], "+880 1711-204512"),
  v("nakshi-decor", "Nakshi Decor House", "Jamdani-inspired styling for every occasion", "Dhanmondi", 2015, ["wedding", "family-events", "birthday"], "+880 1819-336741"),
  v("rangdhanu-decor", "Rangdhanu Decor", "Colourful decor for family celebrations", "Mirpur", 2014, ["birthday", "family-events"], "+880 1912-448203"),
  v("prodip-lighting", "Prodip Lighting Co.", "Warm light for memorable nights", "Mohakhali DOHS", 2011, ["wedding", "family-events", "corporate-events", "birthday"], "+880 1713-552918"),
  v("golpo-frames", "Golpo Frames", "Documentary wedding films and photographs", "Gulshan", 2016, ["wedding", "family-events"], "+880 1716-601347"),
  v("moyna-photography", "Moyna Photography", "Candid photography for every celebration", "Uttara", 2017, ["wedding", "birthday", "family-events"], "+880 1817-774520"),
  v("chhobi-booth", "Chhobi Booth Co.", "Instant prints, props and 360° videos", "Uttara", 2019, ["wedding", "birthday", "corporate-events", "family-events"], "+880 1918-219064"),
  v("taal-sound", "Taal Sound Lab", "Clean sound, from shehnai to DJ sets", "Mirpur", 2013, ["wedding", "birthday", "family-events"], "+880 1714-883310"),
  v("utshob-party", "Utshob Party Co.", "Birthdays that feel handmade", "Bashundhara R/A", 2018, ["birthday"], "+880 1815-907125"),
  v("balloon-bari", "Balloon Bari", "Balloon art and dessert tables", "Mohammadpur", 2020, ["birthday", "family-events"], "+880 1916-312478"),
  v("meghna-conference", "Meghna Conference Services", "Conference staging and seating at scale", "Tejgaon", 2009, ["corporate-events"], "+880 1712-468035"),
  v("padma-av", "Padma AV Solutions", "Line arrays, LED walls and broadcast audio", "Motijheel", 2010, ["corporate-events", "wedding"], "+880 1818-125693"),
  v("lens-and-ledger", "Lens & Ledger Media", "Corporate photography and event films", "Karwan Bazar", 2016, ["corporate-events"], "+880 1919-640287"),
  v("aangina-events", "Aangina Family Events", "Courtyard warmth for family occasions", "Lalmatia", 2015, ["family-events", "birthday"], "+880 1715-279146"),
  v("shonar-seating", "Shonar Seating & Linen", "Chairs, lounges, tables and linen hire", "Shyamoli", 2008, ["wedding", "corporate-events", "family-events", "birthday"], "+880 1816-530872"),
  v("dhaka-platters", "Dhaka Platter House", "Set menus and grazing tables", "Lalmatia", 2014, ["food-culinary"], "+880 1917-084519"),
  v("puran-dhaka-kitchen", "Puran Dhaka Kitchen", "Kacchi, polao and heritage Dhakaiya recipes", "Old Dhaka", 2006, ["food-culinary"], "+880 1711-962437"),
  v("fuchka-junction", "Fuchka Junction", "Live fuchka and chotpoti counters", "Dhanmondi", 2016, ["food-culinary"], "+880 1812-376950"),
  v("cha-ghor", "Cha Ghor", "Fresh cha brewed on site", "Shantinagar", 2018, ["food-culinary"], "+880 1913-458621"),
  v("brew-cart", "Brew Cart BD", "Espresso bars for events", "Gulshan", 2020, ["food-culinary", "corporate-events"], "+880 1716-145308"),
];

export function getVendor(id: string): Vendor | undefined {
  return VENDORS.find((x) => x.id === id);
}
