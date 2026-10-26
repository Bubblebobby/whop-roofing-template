import { Link } from '@tanstack/react-router'
import { formatUsd, site } from '#/site.config'
import type { Offer, Service } from '#/site.config'
import { track } from '#/lib/track'
import { useOffer, useOffers } from '#/lib/offers'
import { ArrowIcon, CardIcon, CheckIcon, PinIcon, ServiceIcon, ShieldIcon, StarIcon } from './Icons'
import { EstimateForm } from './EstimateForm'
import { telHref } from './SiteHeader'

export function SectionHeading({ eyebrow, title, body, light }: { eyebrow: string; title: string; body?: string; light?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={`h-display mt-3 text-4xl sm:text-5xl ${light ? 'text-white' : 'text-ink'}`}>{title}</h2>
      {body && <p className={`mt-4 text-lg leading-relaxed ${light ? 'text-slate-300' : 'text-slate-600'}`}>{body}</p>}
    </div>
  )
}

export function Hero() {
  const inspection = useOffer('inspection')
  return (
    <section className="roof-pattern relative overflow-hidden bg-ink text-white">
      <div className="container-x grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
        <div>
          <p className="eyebrow text-orange-300">{site.hero.eyebrow}</p>
          <h1 className="h-display mt-4 text-5xl sm:text-6xl lg:text-7xl">{site.hero.headline}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">{site.hero.subhead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#estimate" className="btn-primary px-6 py-3.5 text-base">
              Get a free estimate <ArrowIcon className="h-4 w-4" />
            </a>
            <Link to="/book/$offer" params={{ offer: 'inspection' }} className="btn border border-white/25 px-6 py-3.5 text-base text-white hover:bg-white/10">
              Book a {formatUsd(inspection?.price ?? 0)} inspection
            </Link>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {site.hero.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="h-display text-3xl text-white sm:text-4xl">{s.value}</dd>
                <dd className="mt-1 text-xs text-slate-400 sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroArt />
      </div>
    </section>
  )
}

function HeroArt() {
  return (
    <div className="relative hidden lg:block" aria-hidden="true">
      <svg viewBox="0 0 420 360" className="w-full drop-shadow-2xl">
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1e293b" />
            <stop offset="1" stopColor="#334155" />
          </linearGradient>
          <pattern id="shingle" width="22" height="14" patternUnits="userSpaceOnUse">
            <rect width="22" height="14" fill="#1f2937" />
            <path d="M0 13.5h22M11 0v7M0 7h22M0 7v7M22 7v7" stroke="#0b1220" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect x="10" y="10" width="400" height="340" rx="28" fill="url(#sky)" />
        <path d="M60 190 210 70l150 120z" fill="url(#shingle)" />
        <path d="M60 190 210 70l150 120" fill="none" stroke="var(--brand)" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />
        <rect x="90" y="190" width="240" height="130" fill="#e2e8f0" />
        <rect x="185" y="245" width="50" height="75" rx="4" fill="#475569" />
        <rect x="112" y="215" width="48" height="40" rx="3" fill="#94a3b8" />
        <rect x="260" y="215" width="48" height="40" rx="3" fill="#94a3b8" />
        <rect x="280" y="96" width="24" height="54" fill="#64748b" />
        <g transform="translate(282 250)">
          <rect width="118" height="78" rx="14" fill="#fff" />
          <text x="16" y="30" fontFamily="Inter, sans-serif" fontSize="12" fill="#64748b">Warranty</text>
          <text x="16" y="58" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" fontSize="28" fill="#0f172a">25 YEARS</text>
        </g>
      </svg>
    </div>
  )
}

export function TrustStrip() {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="container-x grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {site.trust.map((t) => (
          <div key={t.title} className="flex gap-3">
            <ShieldIcon className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
            <div>
              <p className="font-semibold text-ink">{t.title}</p>
              <p className="text-sm text-slate-600">{t.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function serviceCtaLabel(service: Service, offers: Offer[]) {
  const offer = offers.find((o) => o.key === service.cta)
  if (!offer) return 'Get a free estimate'
  return service.cta === 'deposit' ? `Book with ${formatUsd(offer.price)} deposit` : `Book for ${formatUsd(offer.price)}`
}

export function ServiceCta({ service, className = 'btn-primary' }: { service: Service; className?: string }) {
  const offers = useOffers()
  if (service.cta === 'estimate') {
    return (
      <a href="/#estimate" className={className}>
        Get a free estimate
      </a>
    )
  }
  return (
    <Link to="/book/$offer" params={{ offer: service.cta }} className={className}>
      {serviceCtaLabel(service, offers)}
    </Link>
  )
}

export function Services() {
  return (
    <section id="services" className="py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Services"
          title="Repair, replace, inspect."
          body="Every job is run by a certified crew lead and backed by a written warranty. Pick a service to see what’s included."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {site.services.map((s) => (
            <article key={s.slug} className="card group flex flex-col p-6 transition hover:border-slate-300 hover:shadow-lg sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-brand">
                  <ServiceIcon name={s.icon} className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{s.priceHint}</span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">{s.name}</h3>
              <p className="mt-2 text-slate-600">{s.tagline}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {s.bullets.slice(0, 3).map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                <Link to="/services/$slug" params={{ slug: s.slug }} className="btn-ghost">
                  Details
                </Link>
                <ServiceCta service={s} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function OfferCard({ offer }: { offer: Offer }) {
  const featured = !!offer.badge
  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-6 sm:p-7 ${
        featured ? 'border-ink bg-ink text-white shadow-xl' : 'border-slate-200 bg-white'
      }`}
    >
      {offer.badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">{offer.badge}</span>
      )}
      <h3 className="text-lg font-semibold">{offer.name}</h3>
      <p className={`mt-2 text-sm ${featured ? 'text-slate-300' : 'text-slate-600'}`}>{offer.summary}</p>
      <p className="mt-6 flex items-baseline gap-2">
        <span className="h-display text-5xl">{formatUsd(offer.price)}</span>
        <span className={`text-sm ${featured ? 'text-slate-400' : 'text-slate-500'}`}>{offer.priceNote}</span>
      </p>
      <ul className={`mt-6 space-y-2.5 text-sm ${featured ? 'text-slate-200' : 'text-slate-700'}`}>
        {offer.includes.map((i) => (
          <li key={i} className="flex gap-2">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            {i}
          </li>
        ))}
      </ul>
      <Link to="/book/$offer" params={{ offer: offer.key }} className={`mt-8 ${featured ? 'btn-primary' : 'btn-dark'}`}>
        {offer.key === 'deposit' ? 'Pay deposit' : 'Book now'}
      </Link>
    </article>
  )
}

export function Pricing() {
  const offers = useOffers()
  return (
    <section id="pricing" className="bg-slate-50 py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Upfront pricing"
          title="Book online in two minutes."
          body="Pay securely with card, Apple Pay or Google Pay. Bigger projects start with a deposit; the balance is invoiced after your final walkthrough."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {offers.map((o) => (
            <OfferCard key={o.key} offer={o} />
          ))}
        </div>
        <ol className="mt-12 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm sm:grid-cols-3">
          {[
            ['1', 'Deposit', 'Pay the deposit online. Your card is securely saved on file.'],
            ['2', 'Install', 'We install your roof, usually in a single day, then walk the job with you.'],
            ['3', 'Final invoice', 'The balance, minus your deposit, is auto-charged or emailed as an invoice.'],
          ].map(([n, t, b]) => (
            <li key={n} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{n}</span>
              <div>
                <p className="font-semibold">{t}</p>
                <p className="text-slate-600">{b}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Financing() {
  return (
    <section id="financing" className="py-20 sm:py-24">
      <div className="container-x">
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Financing</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl">{site.financing.headline}</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-700">{site.financing.body}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {site.financing.points.map((p) => (
                <li key={p} className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CardIcon className="h-6 w-6 text-brand" />
              <p className="font-semibold">Example: {formatUsd(14000)} replacement</p>
            </div>
            <dl className="mt-5 divide-y divide-slate-100 text-sm">
              {[
                ['Deposit today', formatUsd(500)],
                ['Balance after install', formatUsd(13500)],
                ['Or pay over time', 'Monthly options at checkout*'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3">
                  <dt className="text-slate-600">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-slate-500">
              *Pay-over-time options are provided by third-party lenders, subject to eligibility, and appear automatically in checkout when available.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Reviews() {
  return (
    <section id="reviews" className="bg-ink py-20 text-white sm:py-24">
      <div className="container-x">
        <SectionHeading eyebrow="Reviews" title="Neighbors who stopped worrying about their roof." light />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {site.reviews.map((r) => (
            <figure key={r.name} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex gap-0.5 text-amber-400" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: r.rating }).map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 leading-relaxed text-slate-200">“{r.text}”</blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-semibold text-white">{r.name}</span>
                <span className="text-slate-400">
                  {' '}
                  · {r.city} · {r.service}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ServiceArea() {
  const { serviceArea } = site
  return (
    <section id="area" className="py-20 sm:py-24">
      <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading eyebrow="Service area" title={serviceArea.headline} body={serviceArea.blurb} />
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {serviceArea.cities.map((c) => (
              <li key={c} className="flex items-center gap-2 text-slate-700">
                <PinIcon className="h-4 w-4 shrink-0 text-brand" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
          {[100, 75, 50, 25].map((pct, i) => (
            <div
              key={pct}
              className="absolute rounded-full border border-dashed border-orange-300"
              style={{ inset: `${(100 - pct) / 2}%`, background: `rgb(234 88 12 / ${0.03 + i * 0.03})` }}
            />
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <PinIcon className="h-10 w-10 text-brand" />
            <p className="h-display mt-2 text-3xl">{serviceArea.radiusMiles}-mile radius</p>
            <p className="text-sm text-slate-500">{site.company.address.split(',').slice(-2).join(',').trim()}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Faq() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading eyebrow="FAQ" title="Questions, answered." />
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {site.faq.map((f) => (
            <details key={f.q} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <span className="text-xl text-brand transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-24">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div id="estimate" className="scroll-mt-24">
          <SectionHeading
            eyebrow="Contact"
            title="Free, no-pressure estimates."
            body="Tell us about your roof and a project manager will call to schedule an on-site estimate. Prefer to talk now?"
          />
          <a
            href={telHref()}
            onClick={() => track('contact', { method: 'phone', location: 'contact' })}
            className="h-display mt-6 inline-block text-4xl text-brand hover:text-brand-dark"
          >
            {site.company.phone}
          </a>
          <dl className="mt-8 space-y-4 text-sm">
            {[
              ['Email', site.company.email],
              ['Office', site.company.address],
              ['Hours', site.company.hours],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-semibold text-ink">{k}</dt>
                <dd className="text-slate-600">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <EstimateForm />
      </div>
    </section>
  )
}
