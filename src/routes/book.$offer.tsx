import { Link, createFileRoute, getRouteApi, notFound } from '@tanstack/react-router'
import { formatUsd, getOffer, site } from '#/site.config'
import { CheckIcon, ShieldIcon } from '#/components/Icons'
import { WhopProvider } from '#/components/checkout/WhopProvider'
import { PlanCheckout } from '#/components/checkout/PlanCheckout'
import { DepositCheckout } from '#/components/checkout/DepositCheckout'
import { telHref } from '#/components/SiteHeader'

const rootApi = getRouteApi('__root__')

export const Route = createFileRoute('/book/$offer')({
  loader: ({ params }) => {
    const offer = getOffer(params.offer)
    if (!offer) throw notFound()
    return offer
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? 'Book'} | ${site.company.name}` }, { name: 'robots', content: 'noindex' }],
  }),
  component: BookPage,
})

function BookPage() {
  const offer = Route.useLoaderData()
  const config = rootApi.useLoaderData()
  const planId = config.plans[offer.key]
  const ready = !!planId && !!config.accountId

  return (
    <section className="bg-slate-50 py-10 sm:py-16">
      <div className="container-x grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Link to="/" hash="pricing" className="text-sm font-medium text-slate-500 hover:text-ink">
            ← Back to pricing
          </Link>
          <p className="eyebrow mt-6">Secure booking</p>
          <h1 className="h-display mt-2 text-4xl sm:text-5xl">{offer.name}</h1>
          <p className="mt-3 text-slate-600">{offer.summary}</p>
          <div className="card mt-6 p-6">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-slate-500">Due today</span>
              <span className="h-display text-4xl">{formatUsd(offer.price)}</span>
            </div>
            <p className="mt-1 text-right text-xs text-slate-500">{offer.priceNote}</p>
            <ul className="mt-5 space-y-2.5 border-t border-slate-100 pt-5 text-sm text-slate-700">
              {offer.includes.map((i) => (
                <li key={i} className="flex gap-2">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          {offer.key === 'deposit' && (
            <ol className="mt-6 space-y-3 text-sm text-slate-600">
              <li>
                <strong className="text-ink">Today:</strong> {formatUsd(offer.price)} deposit; card saved on file.
              </li>
              <li>
                <strong className="text-ink">Install day:</strong> crew completes the job and walks it with you.
              </li>
              <li>
                <strong className="text-ink">After walkthrough:</strong> an itemized invoice for the balance, minus this deposit.
              </li>
            </ol>
          )}
          <p className="mt-6 flex items-start gap-2 text-xs text-slate-500">
            <ShieldIcon className="h-4 w-4 shrink-0 text-slate-400" />
            Payments are processed by Whop. Eligible buyers will see pay-over-time options at checkout.
          </p>
        </aside>

        <div className="card p-5 shadow-sm sm:p-8">
          {!ready ? (
            <div className="py-10 text-center">
              <h2 className="text-lg font-semibold">Online booking is being set up</h2>
              <p className="mt-2 text-slate-600">Call us and we will book you right away.</p>
              <a href={telHref()} className="btn-primary mt-6">
                {site.company.phone}
              </a>
            </div>
          ) : (
            <WhopProvider environment={config.environment}>
              {offer.key === 'deposit' ? (
                <DepositCheckout offer={offer} planId={planId} accountId={config.accountId!} />
              ) : (
                <PlanCheckout offer={offer} planId={planId} />
              )}
            </WhopProvider>
          )}
        </div>
      </div>
    </section>
  )
}
