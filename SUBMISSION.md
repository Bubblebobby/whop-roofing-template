# Submission: Whop Roofing Template

**Live site:** https://summitridge-roof-7k2q.whop.site

Hosted on Whop Websites with `whop apps deploy`. Whop serves website apps on a `*.whop.site` address (or a domain the business owns); `whop.app` addresses aren't offered for websites, so this is the site's Whop-hosted URL.

**Source:** https://github.com/Bubblebobby/whop-roofing-template

**Recording:** _add the 3–5 minute video link here_

> Test mode: every plan charges **$1** so reviewers can check out cheaply. Real prices ($149 inspection, $500 deposit, $395 flat-rate repair) are restored with `npm run setup:whop` and a redeploy.

## Features

Summit Ridge Roofing is a reusable US roofing-contractor website built on Whop Websites and paid entirely through Whop Payments. Visitors browse repair, replacement, inspection and gutter services, a service area, financing, reviews and an FAQ, then book online. The inspection and flat-rate repair use Whop's `CheckoutElement`, which includes Apple Pay, Google Pay and pay-over-time options. The replacement deposit uses `PaymentElement`, `EmailElement` and the required `BrandingElement` in setup mode, so the card is saved through a Whop setup intent and charged for the deposit. `ExpressCheckoutElement` offers a wallet alternative. After the job, an admin page bills the remaining balance with the Whop Invoices API, either charging the saved card or emailing the customer a pay-online invoice. The estimate form creates a Whop Lead (or a server-side lead event for first-time visitors), and the Whop pixel records `service_viewed`, `estimate_requested` and `deposit_started` custom events. Everything client-specific (company, copy, photos, services, prices, colors) lives in one config file, and Whop IDs come from app secrets, so a new roofer is a config change and a deploy with no structural edits. The layout is responsive from phones to desktop, with a sticky call and estimate bar on mobile.

## What was verified on the live site

| Requirement | Evidence |
| --- | --- |
| Whop Payments only (no Stripe, PayPal or custom card forms) | All payment fields are Whop Elements (`src/components/checkout/`) |
| Checkout completed with Payment Elements + `BrandingElement` | $1 deposit paid: payment `pay_gE3YeblfSDL51h` |
| Card saved on file | Setup intent succeeded; Visa saved to the member |
| Estimate form creates a Lead | Lead `lead_nLmAYoKV6g2m1` |
| 3+ `whop.track` events | `service_viewed`, `deposit_started` recorded in Whop's events; `estimate_requested` fired live (Whop's event feed is delayed by a few hours) |
| Plans: inspection, deposit, flat-rate | `plan_EPyHY8sEWRgrw`, `plan_US4JL7gX5HH2k`, `plan_bE9YFL9VNgbdI` |
| Final balance via Invoices API | Built; draft invoice `#00000001` created on the saved card. Issuing it is waiting on Whop's identity verification for the business account. |
| Responsive | Checked at 375px and desktop widths |
| Template swap without structural changes | `src/site.config.ts` + app secrets (see README → "Make it yours") |

## Recording script (3–5 minutes)

1. **Home (desktop, then phone).** Open the live site with `?debug=1`. Scroll the hero, services, why-us, process, pricing, financing, reviews, service area, FAQ and contact sections. Resize or switch to a phone to show the layout and the sticky call / estimate bar.
2. **Service page.** Open *Roof Replacement*; point out `service_viewed` appearing in the debug panel.
3. **Lead.** Submit the estimate form. Show "Request received" with the lead reference, the `estimate_requested` and `lead` events, and the lead in the Whop dashboard.
4. **Checkout element.** Open *Book a $1 inspection*: the Whop checkout with wallets and card.
5. **Deposit.** Open *Pay deposit*: Email, Payment and Branding elements, plus the express wallet buttons. Show the paid deposit in the dashboard under Payments.
6. **Final invoice.** Open `/admin/billing`, select the card on file, and show the invoice flow. If verification is complete, issue a $1 balance and show it paid; otherwise show the draft invoice and mention the verification requirement.
7. **Swap.** Open `src/site.config.ts` and show that company details, photos, services, prices and colors all live there.

## Before submitting

- Refund the $1 test payments in the Whop dashboard (Payments).
- Decide whether reviewers should see $1 test prices or the real prices.
- Add the recording link above.
