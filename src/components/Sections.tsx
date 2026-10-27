import { Link } from '@tanstack/react-router'
import { formatUsd, photo, site } from '#/site.config'
import type { Offer, Service } from '#/site.config'
import { track } from '#/lib/track'
import { useOffer, useOffers } from '#/lib/offers'
import { ArrowIcon, CardIcon, CheckIcon, PinIcon, StarIcon, TrustIcon } from './Icons'
import { EstimateForm } from './EstimateForm'
import { telHref } from './SiteHeader'

export function SectionHeading({
  eyebrow,
  title,
  body,
  light,
  center,
}: {
  eyebrow: string
  title: string
  body?: string
  light?: boolean
  center?: boolean
}) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      <p className={`${light ? 'eyebrow-dark' : 'eyebrow'} ${center ? 'mx-auto' : ''}`}>{eyebrow}</p>
      <h2 className={`h-display mt-4 text-4xl sm:text-5xl ${light ? 'text-white' : 'text-ink'}`}>{title}</h2>
      {body && <p className={`mt-4 text-lg leading-relaxed ${light ? 'text-white/70' : 'text-stone-600'}`}>{body}</p>}
    </div>
  )
}

function Stars({ count = 5, className = 'h-4 w-4' }: { count?: number; className?: string }) {
  return (
    <div className="flex gap-0.5 text-brand" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} className={className} />
      ))}
    </div>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
}

export function Hero() {
  const inspection = useOffer('inspection')
  const review = site.reviews[0]
  return (
    <section className="p-2 sm:p-3">
      <div className="relative isolate flex min-h-[640px] overflow-hidden rounded-[28px] bg-ink text-white sm:min-h-[720px] lg:min-h-[780px]">
        <img
          src={photo(site.hero.image, 2000)}
          srcSet={`${photo(site.hero.image, 900)} 900w, ${photo(site.hero.image, 1400)} 1400w, ${photo(site.hero.image, 2000)} 2000w`}
          sizes="100vw"
          alt={site.hero.imageAlt}
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="photo-shade-hero absolute inset-0 -z-10" />
        <div className="container-x grid w-full items-end gap-10 pb-10 pt-32 sm:pb-14 lg:grid-cols-[1.35fr_0.65fr] lg:pb-16">
          <div>
            <p className="eyebrow-dark">{site.hero.eyebrow}</p>
            <h1 className="h-display text-on-photo mt-5 text-5xl sm:text-6xl lg:text-[82px]">{site.hero.headline}</h1>
            <p className="text-on-photo mt-6 max-w-xl text-lg leading-relaxed text-white/90">{site.hero.subhead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#estimate" className="btn-primary px-6 py-3.5 text-base">
                Get a free estimate <ArrowIcon className="h-4 w-4" />
              </a>
              <Link to="/book/$offer" params={{ offer: 'inspection' }} className="btn-glass px-6 py-3.5 text-base">
                Book a {formatUsd(inspection?.price ?? 0)} inspection
              </Link>
            </div>
          </div>
          {review && (
            <figure className="hidden rounded-3xl border border-white/15 bg-black/35 p-6 backdrop-blur-md lg:block">
              <Stars />
              <p className="mt-2 text-sm font-semibold text-white">{site.reviewsHeadline}</p>
              <blockquote className="mt-4 line-clamp-4 text-[15px] leading-relaxed text-white/80">“{review.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-semibold text-ink">{initials(review.name)}</span>
                <span>
                  <span className="block font-semibold">{review.name}</span>
                  <span className="text-white/60">
                    {review.city} · {review.service}
                  </span>
                </span>
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  )
}

export function About() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[0.3fr_1fr]">
          <div>
            <p className="eyebrow">{site.about.eyebrow}</p>
          </div>
          <p className="font-display text-2xl font-medium leading-snug tracking-[-0.02em] text-ink sm:text-3xl lg:text-[40px] lg:leading-[1.2]">
            {site.about.statement}
          </p>
        </div>
        <dl className="mt-14 grid grid-cols-1 divide-y divide-ink/10 border-y border-ink/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {site.hero.stats.map((s) => (
            <div key={s.label} className="flex items-baseline justify-between gap-4 px-1 py-6 sm:block sm:px-8 sm:first:pl-0">
              <dt className="order-2 text-sm text-stone-500 sm:mt-1">{s.label}</dt>
              <dd className="h-display text-4xl sm:text-5xl">{s.value}</dd>
            </div>
          ))}
        </dl>
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
    <section id="services" className="pb-20 sm:pb-28">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Services" title="Every roofing job, one accountable crew." />
          <p className="max-w-sm text-stone-600">
            Each job is run by a certified crew lead and backed by a written warranty. Pick a service to see what’s included.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {site.services.map((s) => (
            <Link
              key={s.slug}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group relative isolate flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl bg-ink p-5 text-white"
            >
              <img
                src={photo(s.image, 700, 875)}
                alt={s.imageAlt}
                loading="lazy"
                className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="photo-shade absolute inset-0 -z-10" />
              <span className="self-start rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">{s.priceHint}</span>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{s.name}</h3>
                  <p className="mt-1 text-sm leading-snug text-white/75">{s.tagline}</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink transition group-hover:-rotate-45 group-hover:bg-brand">
                  <ArrowIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-stone-600">
          Not sure what you need?{' '}
          <a href="#estimate" className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4">
            Get a free estimate
          </a>
        </p>
      </div>
    </section>
  )
}

export function WhyUs() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-ink lg:min-h-0">
          <img src={photo(site.about.image, 900)} alt={site.about.imageAlt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-lg backdrop-blur">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-ink">
              <TrustIcon name="warranty" className="h-5 w-5" />
            </span>
            <p className="text-sm">
              <span className="block font-semibold text-ink">Written warranty on every roof</span>
              <span className="text-stone-500">Transferable if you sell your home</span>
            </p>
          </div>
        </div>
        <div>
          <SectionHeading
            eyebrow="Why homeowners choose us"
            title="Roofing without the runaround."
            body="Our own crews, a fixed price in writing, and a warranty that stays with the house."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {site.trust.map((t) => (
              <div key={t.title} className="rounded-3xl bg-sand p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white">
                  <TrustIcon name={t.icon} className="h-5 w-5" />
                </span>
                <p className="mt-8 font-display text-lg font-semibold tracking-tight">{t.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function Process() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="How it works" title="From first call to final walkthrough." center />
        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {site.process.map((step, i) => (
            <li key={step.title} className="card flex flex-col p-7">
              <span className="h-display text-5xl text-brand">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-10 font-display text-xl font-semibold tracking-tight">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function OfferCard({ offer }: { offer: Offer }) {
  const featured = !!offer.badge
  return (
    <article className={`relative flex flex-col rounded-3xl p-7 ${featured ? 'bg-ink text-white shadow-2xl lg:-my-4 lg:py-11' : 'bg-sand'}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-semibold tracking-tight">{offer.name}</h3>
        {offer.badge && <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-ink">{offer.badge}</span>}
      </div>
      <p className={`mt-2 text-sm leading-relaxed ${featured ? 'text-white/70' : 'text-stone-600'}`}>{offer.summary}</p>
      <p className="mt-8">
        <span className="h-display text-6xl">{formatUsd(offer.price)}</span>
        <span className={`mt-1 block text-sm ${featured ? 'text-white/55' : 'text-stone-500'}`}>{offer.priceNote}</span>
      </p>
      <ul className={`mt-8 space-y-3 border-t pt-6 text-sm ${featured ? 'border-white/10 text-white/85' : 'border-ink/10 text-stone-700'}`}>
        {offer.includes.map((i) => (
          <li key={i} className="flex gap-2.5">
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            {i}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        <Link to="/book/$offer" params={{ offer: offer.key }} className={`w-full ${featured ? 'btn-primary' : 'btn-dark'}`}>
          {offer.key === 'deposit' ? 'Pay deposit' : 'Book now'} <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}

export function Pricing() {
  const offers = useOffers()
  return (
    <section id="pricing" className="bg-white py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Upfront pricing"
          title="Book online in two minutes."
          body="Pay securely with card, Apple Pay or Google Pay. Bigger projects start with a deposit; the balance is invoiced after your final walkthrough."
          center
        />
        <div className="mt-14 grid items-stretch gap-4 lg:grid-cols-3">
          {offers.map((o) => (
            <OfferCard key={o.key} offer={o} />
          ))}
        </div>
        <ol className="mt-12 grid gap-6 rounded-3xl border border-ink/10 p-6 text-sm sm:grid-cols-3 sm:p-8">
          {[
            ['Deposit', 'Pay the deposit online. Your card is securely saved on file.'],
            ['Install', 'We install your roof, usually in a single day, then walk the job with you.'],
            ['Final invoice', 'The balance, minus your deposit, is auto-charged or emailed as an invoice.'],
          ].map(([t, b], i) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand text-sm font-semibold text-ink">{i + 1}</span>
              <div>
                <p className="font-semibold">{t}</p>
                <p className="mt-0.5 text-stone-600">{b}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Financing() {
  const deposit = useOffer('deposit')
  const exampleTotal = 14000
  const depositAmount = deposit?.price ?? 0
  return (
    <section id="financing" className="py-20 sm:py-28">
      <div className="container-x">
        <div className="grid items-center gap-10 rounded-[32px] bg-brand p-8 text-ink sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:p-16">
          <div>
            <p className="eyebrow">Financing</p>
            <h2 className="h-display mt-4 text-4xl sm:text-5xl">{site.financing.headline}</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink/80">{site.financing.body}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {site.financing.points.map((p) => (
                <li key={p} className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-sm font-medium text-white">
                  <CheckIcon className="h-3.5 w-3.5 text-brand" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand">
                <CardIcon className="h-5 w-5 text-ink" />
              </span>
              <p className="font-semibold">Example: {formatUsd(exampleTotal)} replacement</p>
            </div>
            <dl className="mt-5 divide-y divide-ink/10 text-sm">
              {[
                ['Deposit today', formatUsd(depositAmount)],
                ['Balance after install', formatUsd(exampleTotal - depositAmount)],
                ['Or pay over time', 'Monthly options at checkout*'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3.5">
                  <dt className="text-stone-600">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-stone-500">
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
    <section id="reviews" className="bg-white py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="Reviews" title={site.reviewsHeadline} center />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {site.reviews.map((r) => (
            <figure key={r.name} className="flex flex-col rounded-3xl bg-sand p-7">
              <Stars count={r.rating} />
              <blockquote className="mt-5 flex-1 text-[17px] leading-relaxed text-ink">“{r.text}”</blockquote>
              <figcaption className="mt-8 flex items-center gap-3 text-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">{initials(r.name)}</span>
                <span>
                  <span className="block font-semibold text-ink">{r.name}</span>
                  <span className="text-stone-500">
                    {r.city} · {r.service}
                  </span>
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
    <section id="area" className="py-20 sm:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading eyebrow="Service area" title={serviceArea.headline} body={serviceArea.blurb} />
          <ul className="mt-8 flex flex-wrap gap-2">
            {serviceArea.cities.map((c) => (
              <li key={c} className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3.5 py-2 text-sm text-stone-700">
                <PinIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
          {[100, 75, 50, 25].map((pct, i) => (
            <div
              key={pct}
              className="absolute rounded-full border border-dashed border-brand/40"
              style={{ inset: `${(100 - pct) / 2}%`, background: `color-mix(in srgb, var(--brand) ${4 + i * 4}%, transparent)` }}
            />
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-lg">
              <PinIcon className="h-6 w-6" />
            </span>
            <p className="h-display mt-3 text-3xl">{serviceArea.radiusMiles}-mile radius</p>
            <p className="text-sm text-stone-500">{site.company.address.split(',').slice(-2).join(',').trim()}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Faq() {
  return (
    <section className="bg-ink py-20 text-white sm:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading eyebrow="FAQ" title="Questions, answered." body="Still unsure? Call us and a project manager will walk you through it." light />
        <div className="border-t border-white/10">
          {site.faq.map((f, i) => (
            <details key={f.q} className="group border-b border-white/10 py-6" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center gap-5 [&::-webkit-details-marker]:hidden">
                <span className="text-sm tabular-nums text-white/40">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 font-display text-lg font-semibold tracking-tight sm:text-xl">{f.q}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg text-ink transition group-open:rotate-45 group-open:bg-brand">
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-xl pl-10 leading-relaxed text-white/65">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div id="estimate" className="scroll-mt-28">
          <SectionHeading
            eyebrow="Contact"
            title="Free, no-pressure estimates."
            body="Tell us about your roof and a project manager will call to schedule an on-site estimate. Prefer to talk now?"
          />
          <a
            href={telHref()}
            onClick={() => track('contact', { method: 'phone', location: 'contact' })}
            className="h-display mt-6 inline-block text-4xl text-ink underline decoration-brand decoration-[3px] underline-offset-[6px] hover:text-brand-dark"
          >
            {site.company.phone}
          </a>
          <dl className="mt-10 grid gap-5 text-sm sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['Email', site.company.email],
              ['Office', site.company.address],
              ['Hours', site.company.hours],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{k}</dt>
                <dd className="mt-1 break-words text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <EstimateForm />
      </div>
    </section>
  )
}

export function CtaBand() {
  return (
    <section className="p-2 pb-4 sm:p-3 sm:pb-6">
      <div className="relative isolate overflow-hidden rounded-[28px] bg-ink text-white">
        <img src={photo(site.cta.image, 1800)} alt={site.cta.imageAlt} loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-ink/60" />
        <div className="container-x py-20 text-center sm:py-28">
          <h2 className="h-display mx-auto max-w-3xl text-4xl sm:text-6xl">{site.cta.headline}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">{site.cta.body}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#estimate" className="btn-primary px-6 py-3.5 text-base">
              Get a free estimate <ArrowIcon className="h-4 w-4" />
            </a>
            <a href={telHref()} onClick={() => track('contact', { method: 'phone', location: 'cta_band' })} className="btn-glass px-6 py-3.5 text-base">
              Call {site.company.phone}
            </a>
          </div>
        </div>
        <ul className="grid border-t border-white/15 bg-black/30 backdrop-blur sm:grid-cols-3">
          {site.trust.slice(0, 3).map((t) => (
            <li key={t.title} className="flex items-center gap-3 border-white/15 px-6 py-5 text-sm sm:border-l sm:first:border-l-0 [&+&]:border-t sm:[&+&]:border-t-0">
              <TrustIcon name={t.icon} className="h-5 w-5 shrink-0 text-brand" />
              <span>
                <span className="block font-semibold">{t.title}</span>
                <span className="text-white/60">{t.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
