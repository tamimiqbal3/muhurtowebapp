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

### Firebase mode and local mode

The site is connected to the Firebase project **muhurto-app** (web config built into `src/lib/config.ts`; Analytics included). It switches mode automatically:

- **Firebase mode** — when the server has the service-account variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`). The catalogue, homepage sections and site settings live in Firestore (`categories`, `services`, `vendors`, `locations`, `reviews`, `site/settings`); admin edits are saved there and appear for every visitor within seconds; admin photo uploads go to Firebase Storage; customers sign in with real Firebase Authentication (Google Sign-In and email/password — no demo accounts); every browser keeps live Firestore listeners open, so admin changes appear on all devices instantly; bookings, payments (with invoice numbers) and invoices are stored in Firestore. The admin panel shows “Connected to Firebase”.
- **Local mode** — without those variables everything is kept in the browser's local storage (`src/lib/store/catalog.ts`, `src/lib/demo/store.ts`), as before. The admin panel shows “Local mode”.

On the first admin save in Firebase mode, Firestore is seeded with the full built-in catalogue automatically. Edits made earlier in local mode can be copied up once with **“Copy them to Firebase”** in the admin panel.

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

## Firebase setup (project: muhurto-app)

1. **Authentication → Sign-in method** → enable *Email/Password* (and *Google* if wanted). Under *Settings → Authorized domains* add `muhurtowebapp.vercel.app` (and any custom domain).
2. **Firestore Database** → *Create database* → production mode → region `asia-south1` (Mumbai, closest to Dhaka).
3. **Storage** → *Get started* (default bucket `muhurto-app.firebasestorage.app`).
4. **Project settings → Service accounts → Generate new private key** (downloads a JSON file — keep it private, never commit it). In **Vercel → Settings → Environment Variables** add **`FIREBASE_SERVICE_ACCOUNT`** with the *entire* file contents as the value (Production), then redeploy. Alternatively add the three separate variables:
   - `FIREBASE_PROJECT_ID` = `muhurto-app`
   - `FIREBASE_CLIENT_EMAIL` = `client_email` from the JSON
   - `FIREBASE_PRIVATE_KEY` = `private_key` from the JSON (the whole value, including `-----BEGIN PRIVATE KEY-----` and the `\n` sequences)
   Then redeploy.
5. **Realtime Database** → *Create database* → location **Singapore (asia-southeast1)** → *Start in locked mode*. It powers the admin panel's live alerts (new bookings, payments, sign-ups) and the “visitors online” counter. If you pick another location, set `NEXT_PUBLIC_FIREBASE_DATABASE_URL` to the URL shown at the top of its *Data* tab. Paste `database.rules.json` into its *Rules* tab.
6. Deploy the security rules (they let browsers read only public data; all writes go through the server):
   ```bash
   npm i -g firebase-tools && firebase login
   firebase deploy --only firestore:rules,firestore:indexes,storage,database
   ```
   (`.firebaserc` already points at `muhurto-app`.) Or paste `firestore.rules` and `storage.rules` into the console's *Rules* tabs.
7. Open `/admin` — the bar should read **Connected to Firebase**. Make any save to publish the catalogue to Firestore.
8. Seed the catalogue (or use **Admin → Services → Import catalogue**):
   ```bash
   npm run seed            # add -- --force to overwrite demo docs
   ```
9. Create your admin: put your email in `ADMIN_EMAILS` *or* register and run
   ```bash
   npm run set-role -- you@example.com admin
   npm run set-role -- agent@example.com agent 01711000000 "Dhaka,Gazipur"
   ```

### Firestore collections

`users` · `categories` · `subcategories` · `services` · `vendors` · `bookings` · `payments` · `customizationRequests` · `monitoringAgents` · `monitoringAssignments` · `eventUpdates` · `reviews` · `notifications` · `supportRequests`

Documents reference each other by ID (`booking.customerId`, `service.vendorId`, `payment.bookingId`, `monitoringAssignments/{bookingId}`, `eventUpdates.bookingId`, …). Dates are ISO strings.

**Security model:** every write to bookings, payments, assignments, roles and the catalogue goes through server API routes using the Admin SDK, with server-side validation. `firestore.rules` gives clients read-only, ownership-scoped access and denies all client writes.

---

## Payments (SSLCOMMERZ) & invoices

Checkout uses the SSLCOMMERZ hosted payment page through three stateless routes: `POST /api/pay/start` (creates the session), `/api/pay/return/[status]` (gateway callback) and `GET /api/pay/verify` (validates the transaction directly with SSLCOMMERZ before a booking is marked paid). After a validated payment the booking is confirmed and a formal invoice is issued at `/invoice/[bookingId]` with a randomly assigned support team member (manage the team in Admin → Website content).

- Without credentials, the public SSLCOMMERZ test store (`testbox`) is used, so the full flow can be tested with SSLCOMMERZ test wallets and cards — no real money moves.
- To take real payments set `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD` and `SSLCOMMERZ_SANDBOX=false` on Vercel.
- Prices are per 50 guests (`unit: "per50"`): a line is billed per started block of 50 guests. A 2% platform fee is added once.

### Payment methods & logos

All SSLCOMMERZ methods are listed in `src/data/payments.ts` (10 mobile wallets, 5 card networks, 10 internet-banking banks, plus manual bank transfer). Each carries its SSLCOMMERZ `multi_card_name`; providers without a dedicated code open the matching gateway section (`mobilebank`, `internetbank`, `othercard`).

Only **official** logo artwork is shown. Each logo is looked up in this order:

1. A file uploaded in **Admin → Site settings → Payment methods** (PNG/JPEG/WebP from the provider's brand kit or your SSLCOMMERZ merchant panel).
2. `public/payments/<id>.svg` or `.png` — ids: `bkash nagad rocket upay tap okwallet mycash mcash firstpay rupalicash visa mastercard amex unionpay nexus citybank islamibank bracbank bankasia abbank mtb fsibl woori southeast ncc`.
3. The provider's own published file where known (Upay, City Bank, Visa, Mastercard, American Express, UnionPay, bKash, Nagad).

If none is available the provider's name is shown as plain text — logos are never redrawn. The "We accept" strip and checkout show only the methods ticked in Site settings, in the order set there.

## Admin panel

Independent of the customer site at **`/admin`** (own sign-in at `/admin/login`, no customer header or footer). Every admin page is verified on the server; the default account's password is stored only as a one-way verifier. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` on Vercel to replace the built-in account.

Sections: dashboard (revenue, bookings, average order, revenue by category, top services), bookings & orders (status, details, invoices), payments, categories & subcategories, services & packages (prices, images, descriptions, add-ons, visibility), vendors, Dhaka locations, customers, reviews, website content (homepage text, contact, social links, slider speed, support team, bank-transfer text) and payment methods (enable, order, upload official logos).

## Monitoring Agent workflow

1. Payment verified → booking `confirmed`, `monitoringAssignments/{bookingId}` created with status `pending`; customer sees **Agent assignment pending**.
2. An admin assigns an active agent from **Admin → Bookings** (or the auto-assignment rule runs if `AUTO_ASSIGN_MONITORING_AGENT=true`). The customer only sees an agent after that transaction commits.
3. The agent works from **/agent**: starts monitoring, cycles milestones, sets per-vendor progress, adds internal or customer-visible notes, reports problems to admins and marks the event live/completed.
4. The customer follows agent, milestones, vendor progress and the timeline on `/booking/[id]` and the dashboard.

---

## Event Planner (chat assistant)

`/event-planner` is a conversational assistant (`src/components/planner/PlannerChat.tsx`). It asks for the occasion, guests, budget, date, Dhaka area, venue, services and food, understands free text ("wedding for 200 guests in Gulshan, budget 5 lakh"), builds a priced plan from the catalogue with `recommendByRules`, and books it in one step.

## Deploying to Vercel

1. Push this folder to GitHub → **Import** in Vercel (framework auto-detected).
2. Add the environment variables (Production + Preview). Set `NEXT_PUBLIC_SITE_URL` to the deployed URL.
3. Deploy. Then add the domain to Firebase Auth authorized domains and set the SSLCommerz IPN URL.

---

## Food counter

The Food & Culinary page (and the planner's food step) shows dishes like a shop counter: a striped awning, a chalkboard sign, glass shelves for platters, fuchka counters and the cha/coffee bar, a plate and a hanging price tag for each item. Tap a dish to put it in your tray; the tray scales quantities to your guest count and totals as you pick.

## Brand

Logo: `public/brand/muhurto-logo*.png` (transparent background). Tagline: “যেখানে আয়োজনের শুরু” / “Where Every Celebration Begins.” Fonts: Playfair Display (headings), Inter (text), Noto Serif/Sans Bengali (Bangla). Colours: #015fff and #00befe.

## Languages (English / বাংলা)

English is the default. The toggle in the navbar (and the mobile menu) sets the `muhurto_lang` cookie and refreshes, so server-rendered and client pages switch together, including `<html lang>`, metadata, dates (`bn-BD`) and digits in translated strings.

- Strings: English text is the key; Bangla lives in `src/lib/i18n/bn.ts`. Use `const { t } = await getT()` in server components and `useT()` / `useLang()` in client components. Missing keys fall back to English.
- Catalogue: category / subsection / city / theme names and all 60 listings are translated in `src/data/i18n-data.ts` and `src/data/services.bn.ts`; data stays canonical English internally (pricing, search and booking snapshots), and is localised only for display. Search matches both languages.
- With Gemini enabled, planner notes and reasons are written in the selected language.
- Not translated yet: the admin and agent workspaces' inner tables and forms (their navigation and headings are), and vendor-entered content.

## Animations & loading

The loading screen plays once, when a visitor first enters the site. Page transitions, smooth-scroll hijacking and route loaders were removed. The homepage hero is a full-width sequence of decor and venue photographs (no people) that cross-dissolve with one slow, steady push-in per shot; its speed is set in Admin → Website content.

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
