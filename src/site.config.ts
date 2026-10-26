/**
 * Everything a new roofing client changes lives in this file.
 *
 * Swap the company, services, service area, reviews and offer copy here.
 * Whop IDs (account, plans, product) are NOT in this file: they are read from
 * environment variables / app secrets at runtime so the same build can be
 * pointed at any Whop business. See README.md → "Make it yours".
 */

export type OfferKey = 'inspection' | 'deposit' | 'flatRate'

export type Service = {
  slug: string
  name: string
  tagline: string
  description: string
  bullets: string[]
  /** Short price hint shown on the card, e.g. "From $149". */
  priceHint: string
  /** Which offer the service's primary button sells. `estimate` scrolls to the quote form. */
  cta: OfferKey | 'estimate'
  icon: 'repair' | 'replace' | 'inspect' | 'gutter'
}

export type Offer = {
  key: OfferKey
  name: string
  /** Display price in whole dollars. The charged amount always comes from the Whop plan. */
  price: number
  /** Small print under the price, e.g. "credited toward your job". */
  priceNote: string
  summary: string
  includes: string[]
  /** Env var that holds this offer's Whop plan ID (plan_…). */
  planEnv: string
  badge?: string
}

export const site = {
  company: {
    name: 'Summit Ridge Roofing',
    shortName: 'Summit Ridge',
    tagline: 'Roofs built for the next 30 years of weather.',
    phone: '(512) 555-0142',
    email: 'hello@summitridgeroofing.com',
    address: '4100 Burnet Rd, Austin, TX 78756',
    hours: 'Mon–Sat · 7am–7pm',
    license: 'TX Roofing Contractor Lic. #RC-20418',
    founded: 2009,
  },

  hero: {
    eyebrow: 'Licensed · Insured · GAF Certified',
    headline: 'A roof you never have to think about.',
    subhead:
      'Repairs, full replacements and storm inspections across Central Texas. Upfront pricing, a written warranty, and a crew lead who answers the phone.',
    stats: [
      { value: '4,800+', label: 'roofs completed' },
      { value: '4.9★', label: 'from 1,200+ reviews' },
      { value: '25-yr', label: 'workmanship warranty' },
    ],
  },

  services: [
    {
      slug: 'roof-repair',
      name: 'Roof Repair',
      tagline: 'Leaks, missing shingles, flashing and storm damage.',
      description:
        'Most leaks trace back to a handful of failure points: flashing, pipe boots, valleys and wind-lifted shingles. We find the source, fix it properly, and photograph every step so you can see the work.',
      bullets: [
        'Same-week appointments, emergency tarping 24/7',
        'Flat-rate leak repair for common issues',
        'Photo report of every repair',
        '5-year warranty on repair workmanship',
      ],
      priceHint: 'Flat-rate from $395',
      cta: 'flatRate',
      icon: 'repair',
    },
    {
      slug: 'roof-replacement',
      name: 'Roof Replacement',
      tagline: 'Full tear-off and install, usually in one day.',
      description:
        'Architectural shingle, standing-seam metal and tile systems installed to manufacturer spec. A refundable deposit locks your material price and install date; the balance is billed when the job passes final inspection.',
      bullets: [
        'GAF, Owens Corning and metal systems',
        'Deposit locks material pricing and your install date',
        'Financing with monthly payments at checkout',
        '25-year workmanship warranty',
      ],
      priceHint: '$500 deposit to book',
      cta: 'deposit',
      icon: 'replace',
    },
    {
      slug: 'roof-inspection',
      name: 'Roof Inspection',
      tagline: 'A 40-point inspection with a written report.',
      description:
        'A certified inspector checks decking, shingles, flashing, ventilation and gutters, then sends a photo report with remaining-life estimates. Ideal before buying a home, after hail, or before filing an insurance claim.',
      bullets: [
        '40-point checklist with drone imagery',
        'Written report within 24 hours',
        'Insurance-claim documentation included',
        'Fee credited toward any repair or replacement',
      ],
      priceHint: '$149 flat',
      cta: 'inspection',
      icon: 'inspect',
    },
    {
      slug: 'gutters-and-storm',
      name: 'Gutters & Storm Prep',
      tagline: 'Seamless gutters, guards and hail-season prep.',
      description:
        'Seamless aluminum gutters cut on site, leaf guards, and a pre-storm-season tune-up that catches loose shingles and clogged drainage before they become leaks.',
      bullets: [
        'Seamless 6" gutters in 20+ colors',
        'Leaf-guard installation',
        'Pre-season tune-up and sealant check',
        'Free quote, usually same day',
      ],
      priceHint: 'Free estimate',
      cta: 'estimate',
      icon: 'gutter',
    },
  ] satisfies Service[],

  offers: [
    {
      key: 'inspection',
      name: 'Roof Inspection',
      price: 149,
      priceNote: 'credited toward any job',
      summary: 'A 40-point inspection with photos and a written report in 24 hours.',
      includes: ['Drone + on-roof inspection', 'Photo report & remaining-life estimate', 'Insurance documentation'],
      planEnv: 'WHOP_PLAN_INSPECTION',
    },
    {
      key: 'deposit',
      name: 'Replacement Deposit',
      price: 500,
      priceNote: 'applied to your final invoice',
      summary: 'Lock your material price and install date. Your card is kept on file for the final balance.',
      includes: ['Locks material pricing for 90 days', 'Reserves your install date', 'Balance billed after final walkthrough'],
      planEnv: 'WHOP_PLAN_DEPOSIT',
      badge: 'Most booked',
    },
    {
      key: 'flatRate',
      name: 'Flat-Rate Leak Repair',
      price: 395,
      priceNote: 'up to 2 leak points',
      summary: 'Find and fix up to two leak points: flashing, pipe boots or up to 10 shingles.',
      includes: ['Leak tracing & repair', 'Up to 10 matched shingles', '5-year repair warranty'],
      planEnv: 'WHOP_PLAN_FLAT_RATE',
    },
  ] satisfies Offer[],

  serviceArea: {
    headline: 'Serving Central Texas',
    blurb: 'Crews are based in Austin and Round Rock, so most addresses get an inspector within 48 hours.',
    cities: [
      'Austin', 'Round Rock', 'Cedar Park', 'Georgetown', 'Pflugerville', 'Leander',
      'Lakeway', 'Bee Cave', 'Kyle', 'Buda', 'Hutto', 'Dripping Springs',
    ],
    radiusMiles: 45,
  },

  financing: {
    headline: 'Pay over time, right at checkout',
    body: 'Eligible customers see monthly-payment options such as Klarna, Afterpay and Splitit directly in checkout. No separate application and no paperwork with us.',
    points: ['Decision in seconds', 'Shown automatically at checkout', 'No prepayment penalties'],
  },

  trust: [
    { title: 'GAF Certified', body: 'Factory-certified installer: top 3% of US roofers.' },
    { title: 'Fully insured', body: '$2M general liability plus workers’ comp on every crew.' },
    { title: '25-year warranty', body: 'Written workmanship warranty, transferable on sale.' },
    { title: 'A+ BBB rating', body: 'Accredited since 2011 with zero unresolved complaints.' },
  ],

  reviews: [
    {
      name: 'Dana M.',
      city: 'Round Rock',
      rating: 5,
      text: 'Hail took out half our roof. They documented everything for the adjuster, and the new roof went on in a single day. The crew left the yard cleaner than they found it.',
      service: 'Replacement',
    },
    {
      name: 'Marcus T.',
      city: 'Austin',
      rating: 5,
      text: 'Booked the $149 inspection before closing on a house. The report was more thorough than the home inspector’s and saved us $9k in negotiations.',
      service: 'Inspection',
    },
    {
      name: 'Priya S.',
      city: 'Cedar Park',
      rating: 5,
      text: 'A leak around the chimney three other companies couldn’t find. Flat price, fixed in an hour, and it has stayed dry through two storms.',
      service: 'Repair',
    },
  ],

  faq: [
    {
      q: 'How does the deposit work?',
      a: 'The $500 deposit reserves your install date and locks material pricing. We save the card you pay with, and after the final walkthrough we invoice the remaining balance. You can pay it automatically with the saved card or from an emailed invoice.',
    },
    {
      q: 'Is the inspection fee refundable?',
      a: 'The $149 is credited in full toward any repair or replacement booked within 60 days.',
    },
    {
      q: 'Do you work with insurance?',
      a: 'Yes. Our inspection report includes the photos and measurements adjusters ask for, and we will meet your adjuster on site.',
    },
  ],

  /** Theme tokens. Change these to re-brand without touching components. */
  theme: {
    primary: '#c2410c',
    primaryDark: '#9a3412',
    ink: '#0f172a',
    /** Closest Whop Elements accent for the embedded checkout. */
    checkoutAccent: 'orange' as const,
  },
}

export type Site = typeof site

export function getService(slug: string) {
  return site.services.find((s) => s.slug === slug)
}

export function getOffer(key: string) {
  return site.offers.find((o) => o.key === key)
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}
