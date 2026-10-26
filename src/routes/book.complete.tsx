import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { getOffer, site } from '#/site.config'
import { CheckIcon } from '#/components/Icons'
import { PENDING_DEPOSIT_KEY } from '#/components/checkout/DepositCheckout'
import { telHref } from '#/components/SiteHeader'

type Search = { offer?: string; payment?: string; setup?: string; setup_intent_id?: string; status?: string }

const str = (v: unknown) => (typeof v === 'string' && v.length < 200 ? v : undefined)

export const Route = createFileRoute('/book/complete')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    offer: str(s.offer),
    payment: str(s.payment),
    setup: str(s.setup) ?? str(s.setup_intent_id),
    status: str(s.status),
  }),
  head: () => ({ meta: [{ title: `Booking status | ${site.company.name}` }, { name: 'robots', content: 'noindex' }] }),
  component: CompletePage,
})

type View = 'success' | 'failed' | 'pending' | 'finishing'

/**
 * Display-only outcome page (fulfillment belongs in webhooks). Whop appends
 * `payment`/`setup` and `status` after an off-site step. A deposit whose card
 * was verified off-site comes back here with only `setup`, so we finish the
 * deposit charge from this page.
 */
function CompletePage() {
  const search = Route.useSearch()
  const offer = getOffer(search.offer ?? '')
  const [view, setView] = useState<View>(() => initialView(search))
  const [paymentId, setPaymentId] = useState(search.payment)
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (view !== 'finishing' || started.current) return
    started.current = true
    let setupId = search.setup
    try {
      setupId ??= sessionStorage.getItem(PENDING_DEPOSIT_KEY) ?? undefined
    } catch {}
    fetch('/api/deposit/charge', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ setupIntentId: setupId }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error ?? 'We could not finish your deposit.')
        try {
          sessionStorage.removeItem(PENDING_DEPOSIT_KEY)
        } catch {}
        setPaymentId(data.paymentId)
        setView(data.status === 'failed' ? 'failed' : 'success')
      })
      .catch((err) => {
        setError(err.message)
        setView('failed')
      })
  }, [view, search.setup])

  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="container-x max-w-xl">
        <div className="card p-8 text-center sm:p-10">
          {view === 'success' && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckIcon className="h-7 w-7" />
              </div>
              <h1 className="h-display mt-5 text-4xl">You’re booked</h1>
              <p className="mt-3 text-slate-600">
                {offer?.key === 'deposit'
                  ? 'Your deposit is paid and your card is on file. A project manager will call within one business day to confirm your install date.'
                  : `Thanks! Your ${offer?.name.toLowerCase() ?? 'booking'} is confirmed. We will call within one business day to schedule.`}
              </p>
              <p className="mt-2 text-sm text-slate-500">A receipt is on its way to your email.</p>
            </>
          )}
          {view === 'finishing' && (
            <>
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
              <h1 className="h-display mt-5 text-4xl">Finishing your deposit…</h1>
              <p className="mt-3 text-slate-600">Your card was verified. Charging the deposit now.</p>
            </>
          )}
          {view === 'pending' && (
            <>
              <h1 className="h-display text-4xl">Confirming your payment</h1>
              <p className="mt-3 text-slate-600">Your payment is still processing. We will email you as soon as it is confirmed.</p>
            </>
          )}
          {view === 'failed' && (
            <>
              <h1 className="h-display text-4xl">Payment didn’t go through</h1>
              <p className="mt-3 text-slate-600">{error ?? 'No money was taken. You can try again with another payment method.'}</p>
              {offer && (
                <Link to="/book/$offer" params={{ offer: offer.key }} className="btn-primary mt-6">
                  Try again
                </Link>
              )}
            </>
          )}
          {paymentId && <p className="mt-6 text-xs text-slate-400">Reference {paymentId}</p>}
          <div className="mt-8 flex flex-col justify-center gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <Link to="/" className="btn-ghost">
              Back to home
            </Link>
            <a href={telHref()} className="btn-dark">
              Call {site.company.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function initialView(search: Search): View {
  const status = search.status
  if (status === 'failed' || status === 'canceled') return 'failed'
  // Deposit card verified off-site, deposit not charged yet.
  if (search.offer === 'deposit' && search.setup && !search.payment && status === 'succeeded') return 'finishing'
  if (status === 'succeeded' || status === 'paid') return 'success'
  if (!status && !search.payment) return 'success' // Checkout element finished inline and redirected without an off-site step
  return 'pending'
}
