import type { Review } from "../lib/types";
import { IMG } from "./images";

// DEMO DATA — illustrative testimonials and reviews, clearly labelled in the UI.
export const TESTIMONIALS = [
  { name: "Nusrat & Tanvir", city: "Dhaka", event: "Wedding · 450 guests", quote: "We booked décor, kacchi and photography in one place, and our monitoring agent handled every vendor call on the day. Our families actually got to enjoy the holud." },
  { name: "Farhana Akter", city: "Chattogram", event: "First birthday", quote: "The balloon setup and photo booth were exactly what we picked online. Seeing the vendor progress on the dashboard made the week before so much calmer." },
  { name: "Rezaul Karim", city: "Rajshahi", event: "Corporate seminar · 220 people", quote: "Transparent pricing with the 2% fee shown upfront. Sound, seating and the cha station all arrived on time — our agent sent updates every hour." },
  { name: "Sharmin Sultana", city: "Sylhet", event: "Parents' 40th anniversary", quote: "The Rabindra Sangeet evening and the family film made my mother cry happy tears. Everything felt personal, not packaged." },
];

export const REVIEWS: Review[] = [
  { id: "r1", serviceId: "wed-decor-rajkiya", author: "Mahmuda R.", city: "Dhaka", rating: 5, comment: "The stage looked even better than the photos. Setup finished two hours early.", date: "2026-02-14", isDemo: true },
  { id: "r2", serviceId: "wed-decor-rajkiya", author: "Imran H.", city: "Gazipur", rating: 5, comment: "Fresh flower upgrade was worth it — the whole hall smelled of roses.", date: "2026-01-22", isDemo: true },
  { id: "r3", serviceId: "wed-decor-holud", author: "Tasnim A.", city: "Dhaka", rating: 5, comment: "Alpona floor was hand-painted on site. Guests kept taking photos on it.", date: "2025-12-19", isDemo: true },
  { id: "r4", serviceId: "wed-photo-golpo", author: "Sabrina K.", city: "Dhaka", rating: 5, comment: "Teaser arrived in 5 days and our relatives in London watched the gallery the same night.", date: "2026-03-02", isDemo: true },
  { id: "r5", serviceId: "food-platter-kacchi", author: "Arif M.", city: "Narayanganj", rating: 5, comment: "Kacchi was perfectly cooked for 400 guests, and the borhani ran out last — a good sign.", date: "2026-01-09", isDemo: true },
  { id: "r6", serviceId: "food-fuchka-live", author: "Lamia S.", city: "Dhaka", rating: 5, comment: "The fuchka counter had the longest queue at our holud!", date: "2026-02-01", isDemo: true },
  { id: "r7", serviceId: "food-cha-milk", author: "Kamrul I.", city: "Sylhet", rating: 5, comment: "Strong, sweet, proper tong cha in clay cups. Elders loved it.", date: "2025-11-28", isDemo: true },
  { id: "r8", serviceId: "bday-decor-balloon", author: "Rumana P.", city: "Chattogram", rating: 5, comment: "Pastel garland matched our invitation perfectly.", date: "2026-03-11", isDemo: true },
  { id: "r9", serviceId: "corp-photo-coverage", author: "Nadia F.", city: "Dhaka", rating: 4, comment: "Same-day selects were great for LinkedIn. Highlight video took 6 days rather than 5.", date: "2026-02-20", isDemo: true },
  { id: "r10", serviceId: "fam-photo-reunion", author: "Shafiq U.", city: "Khulna", rating: 5, comment: "Our first proper three-generation portrait in twenty years.", date: "2025-12-30", isDemo: true },
  { id: "r11", serviceId: "corp-sound-conference", author: "Habib R.", city: "Dhaka", rating: 5, comment: "Zero feedback, clear Q&A mics, engineer was proactive.", date: "2026-01-15", isDemo: true },
  { id: "r12", serviceId: "fam-decor-aqiqah", author: "Jannat E.", city: "Dhaka", rating: 5, comment: "Soft and elegant. The cradle corner was adorable.", date: "2026-02-08", isDemo: true },
];

export const GALLERY = [
  { ...IMG.wStageCouple, label: "Reception stage", span: "tall" },
  { ...IMG.fuSpicy, label: "Live fuchka", span: "" },
  { ...IMG.wHenna, label: "Mehendi details", span: "" },
  { ...IMG.cAudience, label: "Conference keynote", span: "wide" },
  { ...IMG.chaPour, label: "Cha station", span: "" },
  { ...IMG.bSparklers, label: "Birthday sparkle", span: "tall" },
  { ...IMG.fStringLights, label: "Family evening", span: "" },
  { ...IMG.wChattogram, label: "Chattogram wedding", span: "wide" },
  { ...IMG.pWeddingBuffet, label: "Wedding buffet", span: "" },
] as const;

export const FAQS = [
  { q: "How does MUHURTO pricing work?", a: "Every listing shows a starting price in BDT. Your total is the sum of the services you select (with any options and quantities), plus a transparent 2% platform fee shown at checkout. You are never charged twice for the same booking." },
  { q: "What is a Monitoring Agent?", a: "After your payment is verified, MUHURTO assigns a Monitoring Agent to your event. The agent coordinates every vendor, tracks preparation milestones and posts updates to your dashboard, so you don't have to chase vendors yourself." },
  { q: "Which payment methods are supported?", a: "Payments are processed by SSLCommerz, which supports bKash, Nagad, Rocket, local and international cards and internet banking. MUHURTO never sees or stores your card details." },
  { q: "Can I customise a package?", a: "Yes. Use the Customize page to choose services, quantities, themes and special instructions, then either book directly or send a customisation request. Our team reviews it and sends back an updated plan for you to approve before paying." },
  { q: "Can I cancel or change my booking?", a: "You can request a cancellation or modification from the booking page. Our team reviews requests against each vendor's policy and replies in your dashboard." },
  { q: "Are the vendors verified?", a: "Vendors are reviewed before listing. Listings marked 'Demo' are sample data used while the platform is being prepared for launch." },
  { q: "Do you work outside Dhaka?", a: "Yes. Listings show their service areas — many vendors serve Chattogram, Rajshahi, Sylhet, Khulna and beyond. Search by city to see what's available near your venue." },
  { q: "How does the AI Event Planner work?", a: "The planner asks a few guided questions (category, date, city, budget, guests, theme and services), then recommends a combination of real MUHURTO listings with an estimated total. Estimates are not confirmed prices until you book." },
];

export const STEPS = [
  { n: "01", title: "Explore Services", body: "Browse verified décor, food, photography and sound — or ask the AI planner for a shortlist." },
  { n: "02", title: "Customize Your Event", body: "Pick options, quantities and themes. Request changes and approve an updated plan." },
  { n: "03", title: "Confirm & Pay", body: "Pay securely through SSLCommerz. The 2% platform fee is shown upfront — no surprises." },
  { n: "04", title: "Enjoy Your Moment", body: "A Monitoring Agent coordinates every vendor while you follow progress from your dashboard." },
];
