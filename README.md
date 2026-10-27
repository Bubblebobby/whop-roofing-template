# Whop Roofing Template

**Live demo:** https://summitridge-roof-7k2q.whop.site (test mode: every plan charges $1)

A production-ready website template for US roofing contractors, built on **Whop Websites** (TanStack Start on Whop hosting) and **Whop Payments**. It covers the full high-ticket flow:

```
Estimate request ──► Whop Lead
Inspection / flat-rate ──► Checkout element + Express Checkout (Apple Pay / Google Pay)
Replacement deposit ──► Payment element + Branding element ──► Setup intent (card on file) ──► $500 deposit charge
Job done ──► /admin/billing ──► Whop Invoice for the balance (auto-charge saved card, or email to pay online)
```

## Whop features used

| Feature | Where |
| --- | --- |
| Whop Websites hosting (`@whop/cli/vite`, `whop apps deploy`) | `vite.config.ts` |
| Pixel auto page views + checkout events, plus `whop.track` custom events | `src/lib/track.ts` |
| `CheckoutElement` (financing such as Klarna, Afterpay and Splitit surfaces here for approved merchants) | `src/components/checkout/PlanCheckout.tsx` |
| `ExpressCheckoutElement` (Apple Pay / Google Pay / PayPal) | `DepositCheckout.tsx` (the Checkout element includes wallets on its own) |
| `Payments` in setup mode + `EmailElement` + `PaymentElement` + required `BrandingElement` | `DepositCheckout.tsx` |
| Setup intents API (card on file) | `src/routes/api/deposit/setup-intent.ts` |
| Payments API, off-session charge of the saved card | `src/routes/api/deposit/charge.ts` |
| Leads API (plus a server-side `lead` event via the Events API for visitors Whop doesn't know yet) | `src/routes/api/leads.ts` |
| Invoices API (draft with an inline one-time variant, then issue: charges the saved card or emails the customer) | `src/routes/api/admin/invoices.ts` |
| App secrets + injected API auth | `src/server/whop.ts` |

No custom card forms, no Stripe/PayPal SDKs: every payment field is a Whop element.

### Custom pixel events

| Event | Fires when | Properties |
| --- | --- | --- |
| `service_viewed` | a service page opens (`/services/:slug`) | `service`, `service_name` |
| `estimate_requested` | the estimate form created a Whop lead (`event_id` = lead ID) | `service`, `timeline`, `zip` |
| `deposit_started` | the buyer presses **Pay deposit** | `value`, `currency`, `method` |
| `lead` | standard event, alongside `estimate_requested` | |
| `contact` | phone links are tapped | `method`, `location` |

Add `?debug=1` to any URL to open an on-page inspector that lists every `whop.track` call and whether the pixel is live. Events also log to the browser console and appear in the Whop dashboard (**Websites** / pixel events) about a minute later.

## Make it yours (no structural changes)

Everything client-specific is in **`src/site.config.ts`**: company details, hero copy and photo, about statement, services (each with a photo), offers and prices, process steps, service area, financing copy, trust badges, reviews, FAQ, the closing call-to-action and brand colors. Photos are plain URLs; Unsplash URLs are resized automatically by `photo()`, and the defaults are free-license Unsplash images. Services and offers are arrays; add, remove or reorder them and every section, page and checkout follows.

Whop IDs are **not** in code. They come from app secrets, so the same build works for any business:

| Variable | Set by | Purpose |
| --- | --- | --- |
| `WHOP_ACCOUNT_ID` | Whop hosting (injected) | the `biz_` account; export it yourself for local dev |
| `WHOP_PLAN_INSPECTION`, `WHOP_PLAN_DEPOSIT`, `WHOP_PLAN_FLAT_RATE` | `npm run setup:whop` | plan IDs per offer (`planEnv` in the config) |
| `WHOP_PRODUCT_ID` | `npm run setup:whop` | product leads and final invoices attach to |
| `ADMIN_TOKEN` | `npm run setup:whop` | password for `/admin/billing` |
| `WHOP_API_VERSION` | optional | dated Whop API version to pin (defaults to the one the code was written against) |
| `WHOP_ENVIRONMENT` | optional | `sandbox` once Whop Elements sandbox is generally available |

## Setup and deploy

Requires Node 22+.

```bash
npm install
npx whop login                     # sign in, then `npx whop quickstart` to pick the business
npx whop apps init --app_type website --name "Summit Ridge Roofing" --domain summit-ridge-roofing --dir ../.whop-init
cp ../.whop-init/whop.app.json .   # link this project to the app the CLI just registered
npm run setup:whop                 # product + 3 plans + secrets (add --test-prices for $1 QA plans)
npm run deploy                     # build, type-check, upload, promote → https://<domain>.whop.site
```

Local development with Whop credentials injected:

```bash
WHOP_ACCOUNT_ID=biz_xxx npx whop apps dev
```

`npm run dev` also works for pure UI work; booking pages show a "call us" fallback until plan IDs exist.

### Testing a checkout

The Whop CLI has no sandbox mode, and Whop's docs note the Elements sandbox environment is not generally available yet. For end-to-end QA, run `npm run setup:whop -- --test-prices` to create $1 plans, complete real checkouts, then refund them from the Whop dashboard and run the setup again without the flag. Apple Pay and Google Pay buttons render only on a real device with a wallet configured.

## The deposit, job and final-invoice flow

1. **Deposit** (`/book/deposit`). `<Payments mode="setup">` renders `EmailElement`, `PaymentElement` and `BrandingElement`. Pressing **Pay deposit** fires `deposit_started`, creates a confirmation token, and the server turns it into a **setup intent** that stores the card on file. 3-D Secure steps run through `handleNextAction`. The server then charges the deposit plan to that saved payment method (idempotent per setup intent).
2. **Job.** Your crew does the work.
3. **Final balance** (`/admin/billing`, protected by `ADMIN_TOKEN`). Pick a customer from **cards on file** (succeeded setup intents) and enter the contract total. The invoice bills the balance after the deposit, with the breakdown in the item description. Choose:
   - **Auto-charge card on file:** the draft invoice carries the saved `payment_method_id`; issuing it charges that card.
   - **Email invoice:** the invoice is issued without a payment method, so Whop emails the customer, who pays online (financing applies there too).

Fulfillment should be driven by Whop webhooks (`payment.succeeded`, `setup_intent.succeeded`, invoice events); the return page at `/book/complete` only displays the outcome.

## Project structure

```
src/
  site.config.ts                 ← everything a new client changes
  routes/
    index.tsx                    home: hero, trust, services, pricing, financing, reviews, area, FAQ, contact
    services.$slug.tsx           service detail + service_viewed
    book.$offer.tsx              checkout page per offer
    book.complete.tsx            return/outcome page
    admin.billing.tsx            final-balance invoicing tool
    api/leads.ts                 POST → Whop Leads
    api/deposit/setup-intent.ts  POST → Whop setup intent
    api/deposit/charge.ts        POST → Whop payment on saved card
    api/admin/cards-on-file.ts   GET  → succeeded setup intents
    api/admin/invoices.ts        POST → Whop invoice
  components/checkout/           Whop Elements wrappers
  lib/track.ts                   whop.track wrapper + debug log
  server/whop.ts                 Whop API client (uses hosting's injected auth)
scripts/setup-whop.mjs           creates product, plans and secrets via the Whop CLI
```

## Demo recording script (3 to 5 minutes)

1. Open the live site with `?debug=1`; scroll through the sections on desktop, then on a phone.
2. Open **Roof Replacement**: `service_viewed` appears in the inspector.
3. Submit the estimate form. Show the success state, the `estimate_requested` event, and the new lead in the Whop dashboard.
4. Book the inspection with the Checkout element (wallets, card, financing). Complete it with a test plan.
5. Pay the deposit: Payment element plus the Branding element, with the Express Checkout buttons below. `deposit_started` fires, then the confirmation page.
6. Open `/admin/billing`, select the saved card, enter a $14,000 total. The invoice is created and charged ($13,500 balance). Show it under Invoices and Payments in the dashboard.
7. Show the pixel events in the Whop dashboard.

## Leads: how visitors map to Whop users

Whop's Leads API attaches every lead to a Whop **user** (`user_id` is required), and the API has no field for a raw email. So `/api/leads` resolves the visitor's email first: it checks the account's members (anyone who has paid through checkout), then people identified by the pixel. When it finds a user, it creates a real Whop Lead with the quote details as metadata. A first-time visitor Whop has never seen gets a server-side `lead` event (Events API) with their name, email, phone and ZIP instead, which lands under **People** in the dashboard. The browser's `lead` pixel event shares its `event_id`, so Whop counts it once.
