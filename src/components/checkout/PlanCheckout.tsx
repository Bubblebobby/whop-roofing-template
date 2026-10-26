import { Checkout, CheckoutElement } from '@whop/elements-react'
import type { Offer } from '#/site.config'
import { checkoutAppearance } from './WhopProvider'

/**
 * One-time plans (inspection, flat-rate service): Whop's full checkout.
 * CheckoutElement already leads with the buyer's wallets (Apple Pay / Google Pay),
 * and financing (Klarna, Afterpay, Splitit…) appears inside it for approved merchants.
 * The standalone ExpressCheckoutElement is used on the deposit page.
 */
export function PlanCheckout({ offer, planId }: { offer: Offer; planId: string }) {
  return (
    <Checkout
      plan={planId}
      metadata={{ offer: offer.key, source: 'website' }}
      returnUrl={`${window.location.origin}/book/complete?offer=${offer.key}`}
      appearance={checkoutAppearance}
    >
      <CheckoutElement />
    </Checkout>
  )
}
