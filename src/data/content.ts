import type { Lang } from "../lib/i18n/core";
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
  { q: "Which payment methods are supported?", a: "bKash, Nagad, Rocket and Visa cards. You choose the method at checkout, and payment is confirmed instantly by the payment gateway." },
  { q: "Can I customise a package?", a: "Yes. Use the Customize page to choose services, quantities, themes and special instructions, then either book directly or send a customisation request. Our team reviews it and sends back an updated plan for you to approve before paying." },
  { q: "Can I cancel or change my booking?", a: "You can request a cancellation or modification from the booking page. Our team reviews requests against each vendor's policy and replies in your dashboard." },
  { q: "Are the vendors verified?", a: "Vendors are reviewed before listing. Listings marked 'Demo' are sample data used while the platform is being prepared for launch." },
  { q: "Do you work outside Dhaka?", a: "Yes. Listings show their service areas — many vendors serve Chattogram, Rajshahi, Sylhet, Khulna and beyond. Search by city to see what's available near your venue." },
  { q: "How does the Event Planner calculator work?", a: "Key in your event type, date, city, budget, guests, theme and services, then press =. The calculator prints a combination of real MUHURTO listings with an estimated total. Prices are estimates until you book." },
];

export const STEPS = [
  { n: "01", title: "Explore Services", body: "Browse verified décor, food, photography and sound — or build a shortlist on the planner calculator." },
  { n: "02", title: "Customize Your Event", body: "Pick options, quantities and themes. Request changes and approve an updated plan." },
  { n: "03", title: "Confirm & Pay", body: "Pay securely with bKash, Nagad, Rocket or Visa. The 2% platform fee is shown upfront — no surprises." },
  { n: "04", title: "Enjoy Your Moment", body: "A Monitoring Agent coordinates every vendor while you follow progress from your dashboard." },
];

/* ─── Bangla versions ───────────────────────────────────────────────── */

const TESTIMONIALS_BN = [
  { name: "নুসরাত ও তানভীর", city: "ঢাকা", event: "বিবাহ · ৪৫০ অতিথি", quote: "সাজসজ্জা, কাচ্চি আর ফটোগ্রাফি এক জায়গায় বুক করেছি, আর অনুষ্ঠানের দিন মনিটরিং এজেন্ট সব সেবাদাতার ফোন সামলেছেন। আমাদের পরিবার সত্যিই হলুদটা উপভোগ করতে পেরেছে।" },
  { name: "ফারহানা আক্তার", city: "চট্টগ্রাম", event: "প্রথম জন্মদিন", quote: "অনলাইনে যে বেলুন সজ্জা আর ফটো বুথ বেছেছিলাম, ঠিক সেটাই পেয়েছি। ড্যাশবোর্ডে সেবাদাতার অগ্রগতি দেখে আগের সপ্তাহটা অনেক নিশ্চিন্ত কেটেছে।" },
  { name: "রেজাউল করিম", city: "রাজশাহী", event: "কর্পোরেট সেমিনার · ২২০ জন", quote: "২% ফি শুরুতেই দেখানো স্বচ্ছ মূল্য। সাউন্ড, আসন আর চায়ের স্টেশন সময়মতো এসেছে — এজেন্ট প্রতি ঘণ্টায় আপডেট দিয়েছেন।" },
  { name: "শারমিন সুলতানা", city: "সিলেট", event: "মা-বাবার ৪০তম বিবাহবার্ষিকী", quote: "রবীন্দ্রসংগীতের সন্ধ্যা আর পারিবারিক ফিল্ম দেখে মা আনন্দে কেঁদে ফেলেছেন। সবকিছু ব্যক্তিগত মনে হয়েছে, প্যাকেজ নয়।" },
];

const FAQS_BN = [
  { q: "মুহূর্তে মূল্য কীভাবে নির্ধারিত হয়?", a: "প্রতিটি লিস্টিংয়ে টাকায় শুরুর মূল্য দেখানো থাকে। আপনার মোট মূল্য হলো বেছে নেওয়া সেবাসমূহর (অপশন ও পরিমাণসহ) যোগফল, সাথে চেকআউটে দেখানো ২% প্ল্যাটফর্ম ফি। একই বুকিংয়ের জন্য কখনো দুবার চার্জ করা হয় না।" },
  { q: "মনিটরিং এজেন্ট কী?", a: "পেমেন্ট যাচাই হওয়ার পর মুহূর্ত আপনার অনুষ্ঠানে একজন মনিটরিং এজেন্ট নিয়োগ দেয়। তিনি সব সেবাদাতার সমন্বয় করেন, প্রস্তুতির ধাপ অনুসরণ করেন এবং আপনার ড্যাশবোর্ডে আপডেট দেন — আপনাকে সেবাদাতাদের পেছনে ছুটতে হয় না।" },
  { q: "কোন কোন পেমেন্ট পদ্ধতি চলে?", a: "বিকাশ, নগদ, রকেট ও ভিসা কার্ড। চেকআউটে পদ্ধতি বাছাই করবেন, পেমেন্ট গেটওয়ে তাৎক্ষণিকভাবে পেমেন্ট নিশ্চিত করে।" },
  { q: "প্যাকেজ কি নিজের মতো সাজানো যায়?", a: "হ্যাঁ। কাস্টমাইজ পেজে সেবা, পরিমাণ, থিম ও বিশেষ নির্দেশনা বেছে নিন, তারপর সরাসরি বুকিং করুন অথবা কাস্টমাইজেশন অনুরোধ পাঠান। আমাদের দল পর্যালোচনা করে হালনাগাদ পরিকল্পনা পাঠাবে, যা পেমেন্টের আগে আপনি অনুমোদন করবেন।" },
  { q: "বুকিং বাতিল বা পরিবর্তন করা যায়?", a: "বুকিং পেজ থেকে বাতিল বা পরিবর্তনের অনুরোধ করতে পারেন। আমাদের দল প্রতিটি সেবাদাতার নীতি অনুযায়ী অনুরোধ পর্যালোচনা করে ড্যাশবোর্ডে উত্তর দেয়।" },
  { q: "সেবাদাতারা কি যাচাইকৃত?", a: "লিস্টিংয়ের আগে সেবাদাতাদের পর্যালোচনা করা হয়। 'ডেমো' চিহ্নিত লিস্টিংগুলো লঞ্চের প্রস্তুতিকালীন নমুনা তথ্য।" },
  { q: "ঢাকার বাইরে কাজ করেন?", a: "হ্যাঁ। লিস্টিংয়ে সেবা এলাকা দেখানো থাকে — অনেক সেবাদাতা চট্টগ্রাম, রাজশাহী, সিলেট, খুলনা ও অন্যান্য জেলায় কাজ করেন। আপনার ভেন্যুর কাছাকাছি কী আছে দেখতে শহর দিয়ে অনুসন্ধান করুন।" },
  { q: "ইভেন্ট প্ল্যানার ক্যালকুলেটর কীভাবে কাজ করে?", a: "ক্যালকুলেটরে অনুষ্ঠানের ধরন, তারিখ, শহর, বাজেট, অতিথি, থিম ও সেবা দিন, তারপর = চাপুন। এটি মুহূর্তের আসল লিস্টিং থেকে একটি সমন্বয় ও আনুমানিক মোট মূল্য প্রিন্ট করে। বুক করার আগ পর্যন্ত মূল্য আনুমানিক।" },
];

const STEPS_BN = [
  { n: "০১", title: "সেবা অনুসন্ধান করুন", body: "যাচাই করা সাজসজ্জা, খাবার, ফটোগ্রাফি ও সাউন্ড দেখুন — অথবা প্ল্যানার ক্যালকুলেটর দিয়ে তালিকা বানান।" },
  { n: "০২", title: "অনুষ্ঠান সাজান", body: "অপশন, পরিমাণ ও থিম বেছে নিন। পরিবর্তন চান? অনুরোধ পাঠিয়ে হালনাগাদ পরিকল্পনা অনুমোদন করুন।" },
  { n: "০৩", title: "নিশ্চিত করুন ও পেমেন্ট দিন", body: "বিকাশ, নগদ, রকেট বা ভিসায় নিরাপদে পেমেন্ট দিন। ২% প্ল্যাটফর্ম ফি আগেই দেখানো হয় — কোনো চমক নেই।" },
  { n: "০৪", title: "মুহূর্তটি উপভোগ করুন", body: "মনিটরিং এজেন্ট সব সেবাদাতার সমন্বয় করবেন, আর আপনি ড্যাশবোর্ড থেকে অগ্রগতি দেখবেন।" },
];

const GALLERY_LABEL_BN: Record<string, string> = {
  "Reception stage": "রিসেপশন মঞ্চ", "Live fuchka": "লাইভ ফুচকা", "Mehendi details": "মেহেদির কারুকাজ", "Conference keynote": "কনফারেন্সের কিনোট",
  "Cha station": "চায়ের স্টেশন", "Birthday sparkle": "জন্মদিনের ঝলক", "Family evening": "পারিবারিক সন্ধ্যা", "Chattogram wedding": "চট্টগ্রামের বিবাহ", "Wedding buffet": "বিবাহের বুফে",
};

export const getTestimonials = (lang: Lang) => (lang === "bn" ? TESTIMONIALS_BN : TESTIMONIALS);
export const getFaqs = (lang: Lang) => (lang === "bn" ? FAQS_BN : FAQS);
export const getSteps = (lang: Lang) => (lang === "bn" ? STEPS_BN : STEPS);
export const getGallery = (lang: Lang) => GALLERY.map((g) => ({ ...g, label: lang === "bn" ? GALLERY_LABEL_BN[g.label] ?? g.label : g.label }));
