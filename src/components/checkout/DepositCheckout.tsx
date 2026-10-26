import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  BrandingElement,
  Checkout,
  EmailElement,
  ExpressCheckoutElement,
  PaymentElement,
  Payments,
  usePayments,
  useWhop,
} from '@whop/elements-react'
import { formatUsd } from '#/site.config'
import type { Offer } from '#/site.config'
import { newEventId, track } from '#/lib/track'
import { checkoutAppearance } from './WhopProvider'

export const PENDING_DEPOSIT_KEY = 'roof:pending-deposit'

type Props = { offer: Offer; planId: string; accountId: string }

/**
 * Deposit checkout = card on file + deposit charge.
 *  1. <Payments mode="setup"> collects the card (PaymentElement + required BrandingElement).
 *  2. Server creates a Whop setup intent from the confirmation token → card saved for the final invoice.
 *  3. Server charges the deposit plan to that saved card.
 * Wallet buyers can instead pay the deposit with ExpressCheckoutElement; their balance is invoiced by email.
 */
export function DepositCheckout({ offer, planId, accountId }: Props) {
  const returnUrl = `${window.location.origin}/book/complete?offer=${offer.key}`
  return (
    <div className="space-y-6">
      <Payments accountId={accountId} mode="setup" currency="usd" returnUrl={returnUrl} appearance={checkoutAppearance}>
        <DepositForm offer={offer} />
      </Payments>
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or pay the deposit with a wallet
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <Checkout
        plan={planId}
        metadata={{ offer: offer.key, source: 'website_express' }}
        returnUrl={returnUrl}
        appearance={checkoutAppearance}
      >
        <ExpressCheckoutElement layout="auto" />
      </Checkout>
      <p className="text-center text-xs text-slate-500">Wallet deposits receive the final balance as an emailed invoice.</p>
    </div>
  )
}

type Step = 'idle' | 'saving' | 'verifying' | 'charging'

function DepositForm({ offer }: { offer: Offer }) {
  const payments = usePayments()
  const whop = useWhop()
  const navigate = useNavigate()
  const [complete, setComplete] = useState(false)
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)

  async function post<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error ?? 'Payment could not be completed.')
    return data as T
  }

  async function payDeposit() {
    if (!payments || !whop) return
    setError(null)
    const attempt = newEventId('dep')
    track('deposit_started', { method: 'card_on_file', value: offer.price, currency: 'USD', event_id: attempt })

    try {
      setStep('saving')
      let confirmationToken: string
      try {
        ;({ confirmationToken } = await payments.createConfirmationToken({}))
      } catch (err: any) {
        if (err?.code === 'payment_request_cancelled') return setStep('idle')
        throw err
      }

      // 1) Save the card on file with a setup intent.
      const setup = await post<{ id: string; status: string; client_secret: string }>('/api/deposit/setup-intent', { confirmationToken })
      try {
        sessionStorage.setItem(PENDING_DEPOSIT_KEY, setup.id)
      } catch {}

      let status = setup.status
      if (status === 'requires_action') {
        setStep('verifying')
        const next = await whop.payments.handleNextAction({ clientSecret: setup.client_secret })
        if (next.redirected) return // the return page finishes the deposit
        status = next.status
        if (status !== 'succeeded') throw new Error(next.lastPaymentError?.message ?? 'Card verification was not completed.')
      }
      if (status === 'canceled') throw new Error('That card could not be saved. Please try another.')
      if (status === 'processing') {
        return navigate({ to: '/book/complete', search: { offer: offer.key, setup: setup.id, status: 'processing' } })
      }

      // 2) Charge the deposit to the saved card.
      setStep('charging')
      const charge = await post<{ paymentId: string; status: string }>('/api/deposit/charge', { setupIntentId: setup.id })
      try {
        sessionStorage.removeItem(PENDING_DEPOSIT_KEY)
      } catch {}
      navigate({
        to: '/book/complete',
        search: { offer: offer.key, payment: charge.paymentId, status: charge.status === 'paid' ? 'succeeded' : charge.status },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment could not be completed.')
      setStep('idle')
    }
  }

  const busy = step !== 'idle'
  const label = {
    idle: `Pay ${formatUsd(offer.price)} deposit`,
    saving: 'Saving card…',
    verifying: 'Verifying with your bank…',
    charging: 'Charging deposit…',
  }[step]

  return (
    <div className="space-y-4">
      <EmailElement />
      <PaymentElement onChange={(e) => setComplete(e.complete)} />
      <div className="rounded-lg bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
        Your card is saved securely on file. You authorize {formatUsd(offer.price)} today and the remaining project balance
        after your final walkthrough, which is itemized on an invoice before it is charged.
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button type="button" className="btn-primary w-full py-3.5 text-base" disabled={!complete || busy} onClick={payDeposit}>
        {label}
      </button>
      <BrandingElement />
    </div>
  )
}
