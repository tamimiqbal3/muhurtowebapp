# MUHURTO · মুহূর্ত

Premium event management & planning marketplace for Bangladesh — weddings, birthdays, corporate events, family events and food & culinary services, with an AI event planner, customisation requests, SSLCommerz payments (2% platform fee) and a Monitoring Agent for every paid event.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion · Lenis smooth scroll · Lucide · Firebase Auth / Firestore / Storage · Gemini API · SSLCommerz · Vercel

---

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in what you have — everything is optional for browsing
npm run dev                    # http://localhost:3000
npm test                       # pricing / search / planner / seed-data tests (no network needed)
npm run build                  # production build + type-check
```

### What works with zero configuration

| Feature | No env vars | + Firebase | + Gemini | + SSLCommerz |
|---|---|---|---|---|
| Homepage, 5 categories, 30 subsections, 60 listings, search & filters | ✅ (bundled demo catalogue) | ✅ (Firestore catalogue) | | |
| Customize page & event plan (saved on device) | ✅ | ✅ | | |
| AI Event Planner | ✅ rule-based mode (clearly labelled) | | ✅ Gemini mode | |
| Login, register, customer dashboard, bookings, customisation requests | ✅ **demo mode** — stored in this browser (labelled) | ✅ real accounts | | |
| Admin & agent workspaces | shows a setup notice | ✅ | | |
| Payment | demo booking saved, “gateway not connected” notice | booking saved, “gateway not connected” notice | | ✅ sandbox / live |
| English / বাংলা toggle | ✅ | ✅ | ✅ (planner replies in the chosen language) | |

Nothing pretends to work: missing credentials produce an explicit notice, never a fake success.

### Demo mode (no Firebase)

While Firebase isn't configured, login and registration still work for demonstrations: accounts (salted SHA-256 hashes), bookings, customisation requests and notifications live in the browser's `localStorage`, and a `muhurto_demo` cookie lets the proxy open `/dashboard`, `/booking` and `/checkout`. Every demo screen carries a “Demo mode” label, and checkout never takes or simulates a payment. As soon as the Firebase variables are set, the same UI switches to real Firebase Auth + Firestore with no code changes.

---

## Environment variables

See `.env.example`. Add the same values in **Vercel → Project → Settings → Environment Variables**.

| Variable | Secret? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | no | Public URL, e.g. `https://muhurto.vercel.app` — used for payment callbacks, sitemap, OG |
| `NEXT_PUBLIC_FIREBASE_*` | no | Firebase web app config (Auth on the client) |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | **yes** | Firebase Admin (server only) |
| `ADMIN_EMAILS` | no | Comma-separated emails promoted to admin on first sign-in |
| `CATALOG_SOURCE` | no | `auto` (default) · `firestore` · `demo` |
| `GEMINI_API_KEY` | **yes** | Gemini, server-side only |
| `GEMINI_MODEL` | no | Defaults to `gemini-2.5-flash`; change without code edits |
| `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD` | **yes** | SSLCommerz credentials (server only) |
| `SSLCOMMERZ_SANDBOX` | no | `true` (default) uses sandbox.sslcommerz.com |
| `AUTO_ASSIGN_MONITORING_AGENT` | no | `true` = auto-assign the least-busy active agent (city-matched) after payment |

`FIREBASE_PRIVATE_KEY`: paste the key from the service-account JSON including `\n` sequences, wrapped in quotes.

---

## Firebase setup

1. Create a Firebase project → add a **Web app** → copy the config into `NEXT_PUBLIC_FIREBASE_*`.
2. **Authentication** → enable *Email/Password* and *Google*. Add your Vercel domain under *Authorized domains*.
3. **Firestore** → create database (production mode).
4. **Storage** → create the default bucket (used for admin image uploads).
5. **Project settings → Service accounts → Generate new private key** → fill `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
6. Deploy rules & indexes:
   ```bash
   npm i -g firebase-tools && firebase login
   firebase use <project-id>
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```
7. Seed the catalogue (or use **Admin → Services → Import catalogue**):
   ```bash
   npm run seed            # add -- --force to overwrite demo docs
   ```
8. Create your admin: put your email in `ADMIN_EMAILS` *or* register and run
   ```bash
   npm run set-role -- you@example.com admin
   npm run set-role -- agent@example.com agent 01711000000 "Dhaka,Gazipur"
   ```

### Firestore collections

`users` · `categories` · `subcategories` · `services` · `vendors` · `bookings` · `payments` · `customizationRequests` · `monitoringAgents` · `monitoringAssignments` · `eventUpdates` · `reviews` · `notifications` · `supportRequests`

Documents reference each other by ID (`booking.customerId`, `service.vendorId`, `payment.bookingId`, `monitoringAssignments/{bookingId}`, `eventUpdates.bookingId`, …). Dates are ISO strings.

**Security model:** every write to bookings, payments, assignments, roles and the catalogue goes through server API routes using the Admin SDK, with server-side validation. `firestore.rules` gives clients read-only, ownership-scoped access and denies all client writes.

---

## Payments (SSLCommerz) & the 2% fee

1. Register a sandbox store at <https://developer.sslcommerz.com/registration/> and set `SSLCOMMERZ_STORE_ID` / `SSLCOMMERZ_STORE_PASSWORD`.
2. In the merchant panel set the **IPN URL** to `https://<your-domain>/api/payments/sslcommerz/ipn`.

Flow: `/booking` creates a booking priced **only from the server catalogue** → `/checkout` shows the breakdown → `/api/payments/init` opens an SSLCommerz session → the gateway posts back to `/api/payments/sslcommerz/{success|fail|cancel}` and the IPN webhook → the server re-validates with SSLCommerz's validation API (status, `tran_id`, amount, currency) before confirming.

- Fee: `platformFee = round(subtotal × 2%)`, `total = subtotal + fee` (৳100,000 → ৳2,000 → ৳1,02,000). The breakdown is stored on the booking and the payment record.
- No double charging: a paid booking can't start a new session; older unfinished sessions are superseded; confirmation is an idempotent transaction; a second successful payment for the same booking is flagged `duplicate_refund_required` for admins instead of being applied.
- Payments are never simulated. Without credentials the Pay button is disabled with an explanation.
- **Method picker:** customers choose bKash, Nagad, Rocket, Visa or Mastercard at checkout. The choice is sent to SSLCommerz as `multi_card_name` (`bkash`, `dbblmobilebanking`, `visacard`, `mastercard`) so the gateway opens on that method; Nagad opens the full SSLCommerz page (enable Nagad on your store). The choice is saved on the payment record as `preferredMethod`.

### Payment logos

Logos are loaded from `public/payments/` — **add the official files there** (they are trademarks, so take them from the official brand kits / your SSLCommerz merchant panel rather than redrawing them):

| File | Source |
|---|---|
| `bkash.svg` or `bkash.png` | bKash brand resources / bKash merchant onboarding kit |
| `nagad.svg` or `nagad.png` | Nagad merchant brand assets |
| `rocket.svg` or `rocket.png` | Dutch-Bangla Bank Rocket brand assets |
| `visa.svg` | Visa brand guidelines (visa.com → brand) |
| `mastercard.svg` | Mastercard Brand Center |

Visa and Mastercard fall back to their Wikimedia Commons files until local copies are added. If a logo file is missing, a brand-coloured name tile is shown instead so the layout never breaks.

---

## Monitoring Agent workflow

1. Payment verified → booking `confirmed`, `monitoringAssignments/{bookingId}` created with status `pending`; customer sees **Agent assignment pending**.
2. An admin assigns an active agent from **Admin → Bookings** (or the auto-assignment rule runs if `AUTO_ASSIGN_MONITORING_AGENT=true`). The customer only sees an agent after that transaction commits.
3. The agent works from **/agent**: starts monitoring, cycles milestones, sets per-vendor progress, adds internal or customer-visible notes, reports problems to admins and marks the event live/completed.
4. The customer follows agent, milestones, vendor progress and the timeline on `/booking/[id]` and the dashboard.

---

## Event Planner

`/event-planner` lays the whole event out on one page, the way people spread brochures and menus on a table: occasion cards, guest and budget sliders with quick presets, date / city / theme, every service for that occasion (one pick per row) and the food counter (pick as many as you like). A receipt on the right totals live with the 2% fee, rolls its digits like a mechanical counter, shows a budget meter, and lets each line's quantity be adjusted. Picked items fly into the receipt. **Suggest the best plan** fills the table for you; a one-line note (“wedding in Rajshahi, 400 guests, 3 lakh”) fills in the details — parsed by Gemini (server-side) with a regex fallback. Recommendations:

- Gemini only sees — and may only return — IDs of listings in the catalogue; anything else is discarded.
- Prices and totals are always computed on the server from the catalogue; results are labelled as estimates.
- Without a key (or if Gemini fails) a deterministic budget-aware recommender is used and labelled.

---

## Deploying to Vercel

1. Push this folder to GitHub → **Import** in Vercel (framework auto-detected).
2. Add the environment variables (Production + Preview). Set `NEXT_PUBLIC_SITE_URL` to the deployed URL.
3. Deploy. Then add the domain to Firebase Auth authorized domains and set the SSLCommerz IPN URL.

---

## Food counter

The Food & Culinary page (and the planner's food step) shows dishes like a shop counter: a striped awning, a chalkboard sign, glass shelves for platters, fuchka counters and the cha/coffee bar, a plate and a hanging price tag for each item. Tap a dish to put it in your tray; the tray scales quantities to your guest count and totals as you pick.

## Brand

Colours: primary `#015fff`, secondary `#00befe` (Tailwind tokens `brand`, `sky`, with `bg-brand-gradient`). The logo lives in `public/brand/` (`muhurto-logo.png` with a transparent background, the 192px version used in the header, and the original upload); `src/app/icon.png` and `apple-icon.png` are generated from it.

## Languages (English / বাংলা)

English is the default. The toggle in the navbar (and the mobile menu) sets the `muhurto_lang` cookie and refreshes, so server-rendered and client pages switch together, including `<html lang>`, metadata, dates (`bn-BD`) and digits in translated strings.

- Strings: English text is the key; Bangla lives in `src/lib/i18n/bn.ts`. Use `const { t } = await getT()` in server components and `useT()` / `useLang()` in client components. Missing keys fall back to English.
- Catalogue: category / subsection / city / theme names and all 60 listings are translated in `src/data/i18n-data.ts` and `src/data/services.bn.ts`; data stays canonical English internally (pricing, search and booking snapshots), and is localised only for display. Search matches both languages.
- With Gemini enabled, planner notes and reasons are written in the selected language.
- Not translated yet: the admin and agent workspaces' inner tables and forms (their navigation and headings are), and vendor-entered content.

## Animations

The site is edited like a motion-graphics film:

- **Hero**: a storyboard. A light editorial title card (headline, short intro, key figures, actions and a portrait still) is followed by a reel of occasions; on desktop, scrolling down travels sideways through the scenes like a camera dolly, with each photo drifting inside its frame. On phones the reel is swipeable.
- **Loading**: a MUHURTO delivery truck drives along a road at dusk (pure SVG + CSS) — on the first visit while the page loads, and on route loading.
- **Scenes**: homepage sections push in from a tilted, smaller frame and settle back as they leave, so sections cut together like shots. Chapters are revealed by wipes with image drift against the scroll.
- **Wedding**: palace doors swing open onto the wedding scene, light spills through the gap, and the doors close again at the end of the scene.
- **Page transitions**: a film cut — the frame shutters to black and opens on the next page; every page opens on a graded title card with grain and a light streak.
- Lenis smooth scrolling on desktop. Motion plays for everyone by design (many Windows PCs have animation effects turned off, which froze every scene); to honour the OS reduced-motion setting again, see `src/components/motion/useReducedMotion.ts`.

## Food counter

The Food & Culinary page (and the planner's food step) shows dishes like a shop counter: a striped awning, a chalkboard sign, glass shelves for platters, fuchka counters and the cha/coffee bar, a plate and a hanging price tag for each item. Tap a dish to put it in your tray; the tray scales quantities to your guest count and totals as you pick.

## Brand

Colours: primary `#015fff`, secondary `#00befe` (Tailwind tokens `brand`, `sky`, with `bg-brand-gradient`). The logo lives in `public/brand/` (`muhurto-logo.png` with a transparent background, the 192px version used in the header, and the original upload); `src/app/icon.png` and `apple-icon.png` are generated from it.

## Languages (English / বাংলা)

English is the default. The toggle in the navbar (and the mobile menu) sets the `muhurto_lang` cookie and refreshes, so server-rendered and client pages switch together, including `<html lang>`, metadata, dates (`bn-BD`) and digits in translated strings.

- Strings: English text is the key; Bangla lives in `src/lib/i18n/bn.ts`. Use `const { t } = await getT()` in server components and `useT()` / `useLang()` in client components. Missing keys fall back to English.
- Catalogue: category / subsection / city / theme names and all 60 listings are translated in `src/data/i18n-data.ts` and `src/data/services.bn.ts`; data stays canonical English internally (pricing, search and booking snapshots), and is localised only for display. Search matches both languages.
- With Gemini enabled, planner notes and reasons are written in the selected language.
- Not translated yet: the admin and agent workspaces' inner tables and forms (their navigation and headings are), and vendor-entered content.

## Animations

Each homepage section uses its own motion idea: a velvet curtain and Ken Burns slideshow with mouse parallax in the hero, an envelope that opens on an invitation card (founder / About), polaroids that drop and settle, a split-flap board for stats, a calculator that rises from the desk for the planner intro, palace doors that open on scroll for weddings, and a fanned hand of cards for other services. Lenis provides smooth scrolling on desktop. Everything respects `prefers-reduced-motion` (and Lenis is disabled on touch devices).


## Project structure

```
src/
  app/                 routes (pages + API route handlers)
    api/               search, planner, auth/session, me, bookings, payments/*, customization-requests,
                       notifications, contact, admin/[resource], agent/assignments
  components/          ui/, layout/, home/, services/, plan/, planner/, booking/, dashboard/, admin/, auth/, motion/
  data/                categories (exact spec names), services (60 demo listings), vendors, images, content
  lib/                 pricing, search, validation, planner (parse/recommend), firebase (client/admin)
    server/            auth & roles, catalogue repo, bookings, payments, monitoring, agent, admin, gemini
scripts/               seed, set-role, logic tests
firestore.rules · firestore.indexes.json · storage.rules · firebase.json
```

## Content & demo data

- All listings, vendors, ratings, reviews and testimonials are **demo data** and labelled in the UI. Replace them via the admin dashboard before launch.
- Photography: free-licence images from Pexels (many by Bangladeshi photographers), loaded through a custom `next/image` loader with responsive widths, lazy loading and a local fallback image.
- Contact details, social links, the privacy policy and terms are placeholders/templates — review them (and have the legal pages checked by a lawyer) before launch.
- Sections.pdf was not supplied; category and subsection names follow the written specification exactly.
