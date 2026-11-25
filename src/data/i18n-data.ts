import type { Category, Service, Vendor } from "../lib/types";
import type { Lang } from "../lib/i18n/core";
import { CATEGORIES } from "./categories";
import { SERVICES_BN } from "./services.bn";

export const CATEGORY_BN: Record<string, { tagline: string; description: string; subs: Record<string, string> }> = {
  wedding: {
    tagline: "গায়ে হলুদ থেকে বউভাত — একই গল্পে সাজানো।",
    description: "গায়ে হলুদের গাঁদা ফুল থেকে রিসেপশনের মঞ্চ — যাচাই করা ডেকোরেটর, ফটোগ্রাফার ও সাউন্ড টিমের সাথে বিয়ের প্রতিটি আয়োজন পরিকল্পনা করুন।",
    subs: {},
  },
  birthday: {
    tagline: "প্রথম জন্মদিন থেকে পঞ্চাশতম চমক।",
    description: "বেলুন সজ্জা, ডেজার্ট টেবিল, ফটো বুথ আর সাউন্ড — বাসা, ছাদ বা হল, সব বয়সের জন্মদিনের জন্য।",
    subs: {},
  },
  "corporate-events": {
    tagline: "কনফারেন্স, লঞ্চ ও বার্ষিক আয়োজন।",
    description: "কনফারেন্স, প্রোডাক্ট লঞ্চ, সেমিনার ও অফিস উদযাপনের জন্য মঞ্চ, বসার ব্যবস্থা, আলো, সাউন্ড ও ইভেন্ট কভারেজ।",
    subs: {},
  },
  "family-events": {
    tagline: "আকিকা, বিবাহবার্ষিকী, ঈদ ও পুনর্মিলনী।",
    description: "আকিকা, বিবাহবার্ষিকী, ঈদ আড্ডা, আংটিবদল ও পারিবারিক পুনর্মিলনী — উষ্ণ ও সুন্দরভাবে আয়োজিত।",
    subs: {},
  },
  "food-culinary": {
    tagline: "প্ল্যাটার, ফুচকা কার্ট ও চায়ের স্টেশন।",
    description: "ক্যাটারিং প্ল্যাটার, লাইভ ফুচকা কাউন্টার আর চা/কফি স্টেশন — অতিথিদের জন্য বাংলাদেশের প্রিয় স্বাদ।",
    subs: {},
  },
};

export const SUB_DESC_BN: Record<string, string> = {
  decor: "মঞ্চ, ব্যাকড্রপ, ফুল ও থিমভিত্তিক সাজসজ্জা।",
  "sitting-area": "অতিথিদের বসার জায়গা, লাউঞ্জ, টেবিল ও লিনেন।",
  lighting: "অ্যাম্বিয়েন্ট, মঞ্চ, ফেয়ারি ও স্থাপত্য আলোকসজ্জা।",
  "photography-videography": "ফটোগ্রাফার, সিনেমাটোগ্রাফার ও ড্রোন কভারেজ।",
  "photo-booths": "থিম বুথ, তাৎক্ষণিক প্রিন্ট ও ৩৬০° ভিডিও।",
  sound: "পিএ সিস্টেম, ডিজে, মাইক্রোফোন ও লাইভ মিউজিক সাউন্ড।",
  platter: "ক্যাটারিং প্ল্যাটার, সেট মেনু ও বুফে।",
  fuchka: "তাজা টকসহ লাইভ ফুচকা ও চটপটি কাউন্টার।",
  "cha-coffee": "দুধ চা, মসলা চা ও বারিস্তা কফি স্টেশন।",
};

export const CITY_BN: Record<string, string> = {
  Dhaka: "ঢাকা", Chattogram: "চট্টগ্রাম", Rajshahi: "রাজশাহী", Sylhet: "সিলেট", Khulna: "খুলনা", Barishal: "বরিশাল",
  Rangpur: "রংপুর", Mymensingh: "ময়মনসিংহ", Cumilla: "কুমিল্লা", "Cox's Bazar": "কক্সবাজার", Gazipur: "গাজীপুর",
  Narayanganj: "নারায়ণগঞ্জ", Munshiganj: "মুন্সীগঞ্জ", Bogura: "বগুড়া", Natore: "নাটোর", Pabna: "পাবনা", Chapainawabganj: "চাঁপাইনবাবগঞ্জ",
  Jashore: "যশোর", Satkhira: "সাতক্ষীরা", Feni: "ফেনী", Moulvibazar: "মৌলভীবাজার", Habiganj: "হবিগঞ্জ", Sunamganj: "সুনামগঞ্জ", Nationwide: "সারা দেশে",
};

export const THEME_BN: Record<string, string> = {
  "Royal Red & Gold": "রাজকীয় লাল ও সোনালি", "Classic Bengali": "ধ্রুপদি বাঙালি", "Holud Yellow": "হলুদ রঙ", "Ivory & Blush": "আইভরি ও গোলাপি",
  "Modern Minimal": "আধুনিক মিনিমাল", "Rustic Jute": "পাটের গ্রামীণ ছোঁয়া", "Pastel Dream": "প্যাস্টেল স্বপ্ন", "Bold & Bright": "উজ্জ্বল রঙিন",
  "Gold & Black": "সোনালি ও কালো", "Boho Sunset": "বোহো সূর্যাস্ত", "Jungle Safari": "জঙ্গল সাফারি", "Under the Sea": "সমুদ্রের তলদেশ",
  "Corporate Clean": "কর্পোরেট পরিচ্ছন্ন", "Tech Launch": "টেক লঞ্চ", "Gala Night": "গালা নাইট", Documentary: "ডকুমেন্টারি",
  Cinematic: "সিনেমাটিক", Candid: "ক্যান্ডিড", Playful: "মজাদার",
};

export const VENDOR_TAGLINE_BN: Record<string, string> = {
  "shapla-events": "বাঙালি আবহে কনের মঞ্চ",
  "nakshi-decor": "নকশিকাঁথা ও জামদানি অনুপ্রাণিত সাজ",
  "rangdhanu-decor": "উত্তরবঙ্গের প্রিয় বিয়ের ডেকোরেটর",
  "prodip-lighting": "স্মরণীয় রাতের উষ্ণ আলো",
  "golpo-frames": "বিয়ের ডকুমেন্টারি ফিল্ম ও ছবি",
  "moyna-photography": "সারা বাংলাদেশে ক্যান্ডিড গল্প",
  "chhobi-booth": "তাৎক্ষণিক প্রিন্ট, প্রপস ও ৩৬০° ভিডিও",
  "taal-sound": "সানাই থেকে ডিজে — পরিষ্কার সাউন্ড",
  "utshob-party": "হাতে গড়া অনুভূতির জন্মদিন",
  "balloon-bari": "অর্গানিক বেলুন আর্ট ও ডেজার্ট টেবিল",
  "meghna-conference": "বড় পরিসরে কনফারেন্স মঞ্চ ও বসার ব্যবস্থা",
  "padma-av": "লাইন অ্যারে, এলইডি ওয়াল ও ব্রডকাস্ট অডিও",
  "lens-and-ledger": "কর্পোরেট ফটোগ্রাফি ও ইভেন্ট ফিল্ম",
  "aangina-events": "পারিবারিক অনুষ্ঠানে উঠোনের উষ্ণতা",
  "shonar-seating": "চেয়ার, লাউঞ্জ, টেবিল ও লিনেন ভাড়া",
  "rupsha-events": "খুলনার নদীতীরের সৌন্দর্য",
  "barind-kitchen": "বড় আয়োজনে রাজশাহীর ঐতিহ্যবাহী রান্না",
  "karnaphuli-catering": "মেজবান ও আধুনিক প্ল্যাটার",
  "dhaka-platters": "সেট মেনু ও গ্রেজিং টেবিল",
  "fuchka-junction": "লাইভ ফুচকা ও চটপটি কাউন্টার",
  "cha-ghor": "শ্রীমঙ্গলের পাতা, সাইটে বানানো",
  "brew-cart": "ইভেন্টের জন্য এসপ্রেসো বার",
};

export function cityName(city: string, lang: Lang) {
  return lang === "bn" ? CITY_BN[city] ?? city : city;
}
export function themeName(theme: string, lang: Lang) {
  return lang === "bn" ? THEME_BN[theme] ?? theme : theme;
}

export function localizeCategory(c: Category, lang: Lang): Category {
  if (lang !== "bn") return c;
  const b = CATEGORY_BN[c.slug];
  return {
    ...c,
    name: c.nameBn,
    tagline: b?.tagline ?? c.tagline,
    description: b?.description ?? c.description,
    subcategories: c.subcategories.map((s) => ({ ...s, name: s.nameBn, description: SUB_DESC_BN[s.slug] ?? s.description })),
  };
}

export function localizeCategories(lang: Lang): Category[] {
  return CATEGORIES.map((c) => localizeCategory(c, lang));
}

export function localizeService(s: Service, lang: Lang): Service {
  if (lang !== "bn") return s;
  const b = SERVICES_BN[s.id];
  return {
    ...s,
    name: b?.name ?? s.name,
    shortDescription: b?.short ?? s.shortDescription,
    description: b?.desc ?? s.description,
    includes: b?.includes ?? s.includes,
    options: s.options.map((o) => ({ ...o, label: b?.options?.[o.id] ?? o.label })),
  };
}

export function localizeVendor(v: Vendor, lang: Lang): Vendor {
  if (lang !== "bn") return v;
  return { ...v, tagline: VENDOR_TAGLINE_BN[v.id] ?? v.tagline };
}
