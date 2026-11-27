import type { Lang } from "../lib/i18n/core";
import type { Review } from "../lib/types";
import { IMG } from "./images";

// DEMO DATA — illustrative testimonials and reviews, clearly labelled in the UI.
export const TESTIMONIALS = [
  { name: "Nusrat & Tanvir", city: "Dhaka", event: "Wedding · 450 guests", quote: "We booked décor, kacchi and photography in one place, and our coordinator handled every vendor call on the day. Our families actually got to enjoy the holud." },
  { name: "Farhana Akter", city: "Uttara", event: "First birthday", quote: "The balloon setup and photo booth were exactly what we picked online. Seeing the vendor progress on the dashboard made the week before so much calmer." },
  { name: "Rezaul Karim", city: "Gulshan", event: "Corporate seminar · 220 people", quote: "Transparent pricing with the 2% fee shown upfront. Sound, seating and the cha station all arrived on time — our agent sent updates every hour." },
  { name: "Sharmin Sultana", city: "Bashundhara R/A", event: "Parents' 40th anniversary", quote: "The Rabindra Sangeet evening and the family film made my mother cry happy tears. Everything felt personal, not packaged." },
];

export const REVIEWS: Review[] = [
  { id: "r1", serviceId: "wed-decor-rajkiya", author: "Mahmuda R.", city: "Dhaka", rating: 5, comment: "The stage looked even better than the photos. Setup finished two hours early.", date: "2026-02-14", isDemo: false },
  { id: "r2", serviceId: "wed-decor-rajkiya", author: "Imran H.", city: "Mirpur", rating: 5, comment: "Fresh flower upgrade was worth it — the whole hall smelled of roses.", date: "2026-01-22", isDemo: false },
  { id: "r3", serviceId: "wed-decor-holud", author: "Tasnim A.", city: "Dhaka", rating: 5, comment: "Alpona floor was hand-painted on site. Guests kept taking photos on it.", date: "2025-12-19", isDemo: false },
  { id: "r4", serviceId: "wed-photo-signature", author: "Sabrina K.", city: "Dhaka", rating: 5, comment: "Teaser arrived in 5 days and our relatives in London watched the gallery the same night.", date: "2026-03-02", isDemo: false },
  { id: "r5", serviceId: "food-platter-kacchi", author: "Arif M.", city: "Dhanmondi", rating: 5, comment: "Kacchi was perfectly cooked for 400 guests, and the borhani ran out last — a good sign.", date: "2026-01-09", isDemo: false },
  { id: "r6", serviceId: "food-fuchka-classic", author: "Lamia S.", city: "Dhaka", rating: 5, comment: "The fuchka counter had the longest queue at our holud!", date: "2026-02-01", isDemo: false },
  { id: "r7", serviceId: "food-cha-milk", author: "Kamrul I.", city: "Bashundhara R/A", rating: 5, comment: "Strong, sweet, proper tong cha in clay cups. Elders loved it.", date: "2025-11-28", isDemo: false },
  { id: "r8", serviceId: "bday-decor-arch", author: "Rumana P.", city: "Uttara", rating: 5, comment: "Pastel garland matched our invitation perfectly.", date: "2026-03-11", isDemo: false },
  { id: "r9", serviceId: "corp-photo-event", author: "Nadia F.", city: "Dhaka", rating: 4, comment: "Same-day selects were great for LinkedIn. Highlight video took 6 days rather than 5.", date: "2026-02-20", isDemo: false },
  { id: "r10", serviceId: "fam-photo-event", author: "Shafiq U.", city: "Banani", rating: 5, comment: "Our first proper three-generation portrait in twenty years.", date: "2025-12-30", isDemo: false },
  { id: "r11", serviceId: "corp-sound-pa", author: "Habib R.", city: "Dhaka", rating: 5, comment: "Zero feedback, clear Q&A mics, engineer was proactive.", date: "2026-01-15", isDemo: false },
  { id: "r12", serviceId: "fam-decor-aqiqah", author: "Jannat E.", city: "Dhaka", rating: 5, comment: "Soft and elegant. The cradle corner was adorable.", date: "2026-02-08", isDemo: false },
];

export const GALLERY = [
  { ...IMG.wRedGold, label: "Reception stage", span: "tall" },
  { ...IMG.fuSpicy, label: "Live fuchka", span: "" },
  { ...IMG.wStageVibrant, label: "Mehendi décor", span: "" },
  { ...IMG.cAudienceStage, label: "Conference stage", span: "wide" },
  { ...IMG.dTableCandles, label: "Candlelit dinner", span: "" },
  { ...IMG.dPinkParty, label: "Birthday setup", span: "tall" },
  { ...IMG.dFairyCorridor, label: "Evening lights", span: "" },
  { ...IMG.dBanquetChandelier, label: "Banquet hall", span: "wide" },
  { ...IMG.pWeddingBuffet, label: "Wedding buffet", span: "" },
] as const;

export const FAQS = [
  { q: "How does MUHURTO pricing work?", a: "Food and seating are priced per person. Décor, lighting, photography, photo booths and sound show a price for every 50 guests. Your total is the sum of the services you choose, plus a 2% platform fee shown before you pay." },
  { q: "Which areas do you serve?", a: "MUHURTO is based in Dhaka and works only within Dhaka. All our partners, venues and service providers are in Dhaka, and you can choose your event area from the list when booking." },
  { q: "Which payment methods are supported?", a: "All SSLCOMMERZ methods: bKash, Nagad, Rocket, Upay and other mobile wallets, Visa, Mastercard, American Express and UnionPay cards, and internet banking from major banks. You receive an invoice as soon as the payment is confirmed." },
  { q: "How does the Event Planner work?", a: "The Event Planner is a planning assistant. Tell it the occasion, number of guests, budget, date and area, choose the services you need, and it builds a priced plan from our catalogue that you can book in one step." },
  { q: "Will I get an invoice?", a: "Yes. A formal invoice with your booking and payment details is issued automatically after a successful payment. You can print it or save it as a PDF from your bookings." },
  { q: "Who coordinates my event?", a: "After payment, a MUHURTO coordinator is assigned to your event. They confirm every vendor, track preparation and keep you updated." },
  { q: "Can I cancel or change my booking?", a: "You can request a cancellation or change from the booking page. Our team reviews the request against each vendor's policy and replies in your dashboard." },
  { q: "Are the vendors verified?", a: "Yes. Every partner is reviewed for quality, reliability and fair pricing before listing." },
];

export const STEPS = [
  { n: "01", title: "Explore Services", body: "Browse verified Dhaka partners for décor, food, photography and sound, with clear published prices." },
  { n: "02", title: "Plan Your Event", body: "Talk to our planning assistant or choose services yourself, with options and add-ons." },
  { n: "03", title: "Confirm & Pay", body: "Pay securely through SSLCOMMERZ by mobile banking, card or internet banking, and receive your invoice." },
  { n: "04", title: "Enjoy Your Moment", body: "A dedicated coordinator manages every vendor while you follow progress from your dashboard." },
];

/* ─── Bangla versions ───────────────────────────────────────────────── */

export const TESTIMONIALS_BN = [
  { name: "নুসরাত ও তানভীর", city: "ঢাকা", event: "বিবাহ · ৪৫০ অতিথি", quote: "সাজসজ্জা, কাচ্চি আর ফটোগ্রাফি এক জায়গায় বুক করেছি, আর অনুষ্ঠানের দিন মনিটরিং এজেন্ট সব সেবাদাতার ফোন সামলেছেন। আমাদের পরিবার সত্যিই হলুদটা উপভোগ করতে পেরেছে।" },
  { name: "ফারহানা আক্তার", city: "উত্তরা", event: "প্রথম জন্মদিন", quote: "অনলাইনে যে বেলুন সজ্জা আর ফটো বুথ বেছেছিলাম, ঠিক সেটাই পেয়েছি। ড্যাশবোর্ডে সেবাদাতার অগ্রগতি দেখে আগের সপ্তাহটা অনেক নিশ্চিন্ত কেটেছে।" },
  { name: "রেজাউল করিম", city: "গুলশান", event: "কর্পোরেট সেমিনার · ২২০ জন", quote: "২% ফি শুরুতেই দেখানো স্বচ্ছ মূল্য। সাউন্ড, আসন আর চায়ের স্টেশন সময়মতো এসেছে — এজেন্ট প্রতি ঘণ্টায় আপডেট দিয়েছেন।" },
  { name: "শারমিন সুলতানা", city: "বসুন্ধরা", event: "মা-বাবার ৪০তম বিবাহবার্ষিকী", quote: "রবীন্দ্রসংগীতের সন্ধ্যা আর পারিবারিক ফিল্ম দেখে মা আনন্দে কেঁদে ফেলেছেন। সবকিছু ব্যক্তিগত মনে হয়েছে, প্যাকেজ নয়।" },
];

export const FAQS_BN = [
  { q: "মুহূর্তে মূল্য কীভাবে নির্ধারিত হয়?", a: "খাবার ও আসনের মূল্য জনপ্রতি। সাজসজ্জা, আলোকসজ্জা, ফটোগ্রাফি, ফটো বুথ ও সাউন্ডের মূল্য প্রতি ৫০ জন অতিথির হিসাবে। আপনার বেছে নেওয়া সেবাগুলোর মোট মূল্য এবং পেমেন্টের আগে দেখানো ২% প্ল্যাটফর্ম ফি মিলে মোট খরচ।" },
  { q: "আপনারা কোন কোন এলাকায় সেবা দেন?", a: "মুহূর্ত ঢাকাভিত্তিক এবং শুধু ঢাকার মধ্যেই কাজ করে। আমাদের সব পার্টনার, ভেন্যু ও সেবাদাতা ঢাকায়; বুকিংয়ের সময় তালিকা থেকে অনুষ্ঠানের এলাকা বেছে নিতে পারবেন।" },
  { q: "কোন কোন পেমেন্ট পদ্ধতি চলে?", a: "এসএসএলকমার্জের সব পদ্ধতি: বিকাশ, নগদ, রকেট, উপায়সহ অন্যান্য মোবাইল ওয়ালেট; ভিসা, মাস্টারকার্ড, আমেরিকান এক্সপ্রেস ও ইউনিয়নপে কার্ড; এবং প্রধান ব্যাংকগুলোর ইন্টারনেট ব্যাংকিং। পেমেন্ট নিশ্চিত হওয়ামাত্র ইনভয়েস পাবেন।" },
  { q: "ইভেন্ট প্ল্যানার কীভাবে কাজ করে?", a: "ইভেন্ট প্ল্যানার একটি পরিকল্পনা সহকারী। অনুষ্ঠানের ধরন, অতিথির সংখ্যা, বাজেট, তারিখ ও এলাকা জানান, প্রয়োজনীয় সেবা বেছে নিন — এটি আমাদের ক্যাটালগ থেকে মূল্যসহ পরিকল্পনা তৈরি করবে, যা এক ধাপে বুক করা যায়।" },
  { q: "আমি কি ইনভয়েস পাব?", a: "হ্যাঁ। সফল পেমেন্টের পর বুকিং ও পেমেন্টের বিবরণসহ একটি আনুষ্ঠানিক ইনভয়েস স্বয়ংক্রিয়ভাবে তৈরি হয়। আপনার বুকিং থেকে এটি প্রিন্ট বা পিডিএফ হিসেবে সংরক্ষণ করতে পারবেন।" },
  { q: "আমার অনুষ্ঠান কে সমন্বয় করবেন?", a: "পেমেন্টের পর মুহূর্তের একজন সমন্বয়ক আপনার অনুষ্ঠানে নিযুক্ত হন। তিনি প্রতিটি সেবাদাতা নিশ্চিত করেন, প্রস্তুতি তদারকি করেন এবং আপনাকে হালনাগাদ জানান।" },
  { q: "বুকিং বাতিল বা পরিবর্তন করা যায়?", a: "বুকিং পেজ থেকে বাতিল বা পরিবর্তনের অনুরোধ করতে পারেন। আমাদের দল প্রতিটি সেবাদাতার নীতিমালা অনুযায়ী অনুরোধ পর্যালোচনা করে ড্যাশবোর্ডে উত্তর দেবে।" },
  { q: "সেবাদাতারা কি যাচাইকৃত?", a: "হ্যাঁ। তালিকাভুক্তির আগে প্রত্যেক পার্টনারের মান, নির্ভরযোগ্যতা ও ন্যায্য মূল্য যাচাই করা হয়।" },
];

const STEPS_BN = [
  { n: "০১", title: "সেবা অনুসন্ধান করুন", body: "সাজসজ্জা, খাবার, ফটোগ্রাফি ও সাউন্ডের জন্য ঢাকার যাচাইকৃত পার্টনার দেখুন, স্পষ্ট প্রকাশিত মূল্যসহ।" },
  { n: "০২", title: "অনুষ্ঠান পরিকল্পনা করুন", body: "আমাদের পরিকল্পনা সহকারীর সঙ্গে কথা বলুন অথবা নিজেই অপশন ও অ্যাড-অনসহ সেবা বেছে নিন।" },
  { n: "০৩", title: "নিশ্চিত করুন ও পেমেন্ট দিন", body: "মোবাইল ব্যাংকিং, কার্ড বা ইন্টারনেট ব্যাংকিংয়ের মাধ্যমে এসএসএলকমার্জে নিরাপদে পেমেন্ট দিন এবং ইনভয়েস নিন।" },
  { n: "০৪", title: "মুহূর্তটি উপভোগ করুন", body: "একজন নিবেদিত সমন্বয়ক সব সেবাদাতা পরিচালনা করবেন, আর আপনি ড্যাশবোর্ড থেকে অগ্রগতি দেখবেন।" },
];

export const GALLERY_LABEL_BN: Record<string, string> = {
  "Reception stage": "রিসেপশন মঞ্চ", "Mehendi décor": "মেহেদির সাজসজ্জা", "Conference stage": "কনফারেন্স মঞ্চ", "Birthday setup": "জন্মদিনের সাজ", "Evening lights": "সন্ধ্যার আলো", "Live fuchka": "লাইভ ফুচকা", "Mehendi details": "মেহেদির কারুকাজ", "Conference keynote": "কনফারেন্সের কিনোট",
  "Candlelit dinner": "মোমবাতির আলোয় ডিনার", "Birthday sparkle": "জন্মদিনের ঝলক", "Family evening": "পারিবারিক সন্ধ্যা", "Banquet hall": "ব্যাংকুয়েট হল", "Wedding buffet": "বিবাহের বুফে",
};

export const getTestimonials = (lang: Lang) => (lang === "bn" ? TESTIMONIALS_BN : TESTIMONIALS);
export const getFaqs = (lang: Lang) => (lang === "bn" ? FAQS_BN : FAQS);
export const getSteps = (lang: Lang) => (lang === "bn" ? STEPS_BN : STEPS);
export const getGallery = (lang: Lang) => GALLERY.map((g) => ({ ...g, label: lang === "bn" ? GALLERY_LABEL_BN[g.label] ?? g.label : g.label }));
