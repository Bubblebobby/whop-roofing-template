import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getService, site } from '#/site.config'
import { track } from '#/lib/track'
import { CheckIcon, ServiceIcon } from '#/components/Icons'
import { ServiceCta } from '#/components/Sections'
import { EstimateForm } from '#/components/EstimateForm'

export const Route = createFileRoute('/services/$slug')({
  loader: ({ params }) => {
    const service = getService(params.slug)
    if (!service) throw notFound()
    return service
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} | ${site.company.name}` },
          { name: 'description', content: `${loaderData.tagline} ${loaderData.description}`.slice(0, 160) },
        ]
      : [],
  }),
  component: ServicePage,
  notFoundComponent: () => (
    <div className="container-x py-24 text-center">
      <h1 className="h-display text-4xl">Service not found</h1>
      <Link to="/" hash="services" className="btn-primary mt-6">
        See all services
      </Link>
    </div>
  ),
})

let lastView = { slug: '', at: 0 }

function ServicePage() {
  const service = Route.useLoaderData()

  useEffect(() => {
    // Effects can run twice for one view (React dev mode, fast re-renders); count each view once.
    const now = Date.now()
    if (lastView.slug === service.slug && now - lastView.at < 1500) return
    lastView = { slug: service.slug, at: now }
    track('service_viewed', { service: service.slug, service_name: service.name, event_id: `${service.slug}_${now}` })
  }, [service.slug, service.name])

  const others = site.services.filter((s) => s.slug !== service.slug)

  return (
    <>
      <section className="roof-pattern bg-ink text-white">
        <div className="container-x py-14 sm:py-20">
          <nav className="text-sm text-slate-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white">
              Home
            </Link>{' '}
            /{' '}
            <Link to="/" hash="services" className="hover:text-white">
              Services
            </Link>{' '}
            / <span className="text-slate-200">{service.name}</span>
          </nav>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-300">
              <ServiceIcon name={service.icon} className="h-7 w-7" />
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">{service.priceHint}</span>
          </div>
          <h1 className="h-display mt-6 text-5xl sm:text-6xl">{service.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">{service.tagline}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ServiceCta service={service} className="btn-primary px-6 py-3.5 text-base" />
            {service.cta !== 'estimate' && (
              <a href="#quote" className="btn border border-white/25 px-6 py-3.5 text-base text-white hover:bg-white/10">
                Or get a free estimate
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold">What’s included</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{service.description}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {service.bullets.map((b) => (
                <li key={b} className="card flex gap-3 p-4">
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <h2 className="mt-14 text-2xl font-semibold">Other services</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {others.map((o) => (
                <Link key={o.slug} to="/services/$slug" params={{ slug: o.slug }} className="btn-ghost">
                  {o.name}
                </Link>
              ))}
            </div>
          </div>
          <div id="quote" className="scroll-mt-24">
            <EstimateForm defaultService={service.name} />
          </div>
        </div>
      </section>
    </>
  )
}
