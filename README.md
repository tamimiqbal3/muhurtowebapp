# MUHURTO · মুহূর্ত

Premium event management & planning marketplace for Bangladesh — weddings, birthdays, corporate events, family events and food & culinary services, with an AI event planner, customisation requests, SSLCommerz payments (2% platform fee) and a Monitoring Agent for every paid event.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Motion · React Three Fiber · Lucide · Firebase Auth / Firestore / Storage · Gemini API · SSLCommerz · Vercel

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
| Accounts, bookings, dashboards, admin, agents | shows a setup notice | ✅ | | |
| Payment | | booking saved, “gateway not connected” notice | | ✅ sandbox / live |

Nothing pretends to work: missing credentials produce an explicit notice, never a fake success.

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

---

## Monitoring Agent workflow

1. Payment verified → booking `confirmed`, `monitoringAssignments/{bookingId}` created with status `pending`; customer sees **Agent assignment pending**.
2. An admin assigns an active agent from **Admin → Bookings** (or the auto-assignment rule runs if `AUTO_ASSIGN_MONITORING_AGENT=true`). The customer only sees an agent after that transaction commits.
3. The agent works from **/agent**: starts monitoring, cycles milestones, sets per-vendor progress, adds internal or customer-visible notes, reports problems to admins and marks the event live/completed.
4. The customer follows agent, milestones, vendor progress and the timeline on `/booking/[id]` and the dashboard.

---

## AI Event Planner (Gemini)

`/event-planner` asks the eight required questions (category, date, location, budget, guests, theme, services, preferences) as a guided chat; free-text answers are parsed by Gemini (server-side) with a regex fallback. Recommendations:

- Gemini only sees — and may only return — IDs of listings in the catalogue; anything else is discarded.
- Prices and totals are always computed on the server from the catalogue; results are labelled as estimates.
- Without a key (or if Gemini fails) a deterministic budget-aware recommender is used and labelled.

---

## Deploying to Vercel

1. Push this folder to GitHub → **Import** in Vercel (framework auto-detected).
2. Add the environment variables (Production + Preview). Set `NEXT_PUBLIC_SITE_URL` to the deployed URL.
3. Deploy. Then add the domain to Firebase Auth authorized domains and set the SSLCommerz IPN URL.

---

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
