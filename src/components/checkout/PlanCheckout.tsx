import { Checkout, CheckoutElement, ExpressCheckoutElement } from '@whop/elements-react'
import type { Offer } from '#/site.config'
import { checkoutAppearance } from './WhopProvider'

/**
 * One-time plans (inspection, flat-rate service): Whop's full checkout.
 * ExpressCheckoutElement and CheckoutElement are alternatives inside one
 * Checkout handle, so each gets its own handle for the same plan.
 * Financing (Klarna, Afterpay, Splitit…) appears inside CheckoutElement for approved merchants.
 */
export function PlanCheckout({ offer, planId }: { offer: Offer; planId: string }) {
  const returnUrl = `${window.location.origin}/book/complete?offer=${offer.key}`
  const metadata = { offer: offer.key, source: 'website' }

  return (
    <div className="space-y-6">
      <div>
        <Checkout plan={planId} metadata={metadata} returnUrl={returnUrl} appearance={checkoutAppearance}>
          <ExpressCheckoutElement layout="auto" />
        </Checkout>
      </div>
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or pay with card &amp; other methods
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <Checkout plan={planId} metadata={metadata} returnUrl={returnUrl} appearance={checkoutAppearance}>
        <CheckoutElement />
      </Checkout>
    </div>
  )
}
