import { createServerFn } from '@tanstack/react-start'
import { site } from '#/site.config'
import type { OfferKey } from '#/site.config'
import { whopApi } from '#/server/whop'

export type PublicConfig = {
  accountId: string | null
  environment: 'production' | 'sandbox'
  plans: Record<OfferKey, string | null>
  /** What each Whop plan actually charges, so the site never shows a price checkout won't. */
  prices: Partial<Record<OfferKey, number>>
}

const read = (name: string) => {
  const value = process.env[name]
  return value && value.trim() !== '' ? value.trim() : null
}

/**
 * The only Whop values the browser needs: the account, the public plan IDs
 * and their live prices. IDs come from env/secrets so one build can serve any business.
 */
export const getPublicConfig = createServerFn({ method: 'GET' }).handler(async (): Promise<PublicConfig> => {
  const plans = Object.fromEntries(site.offers.map((o) => [o.key, read(o.planEnv)])) as Record<OfferKey, string | null>

  const prices: Partial<Record<OfferKey, number>> = {}
  await Promise.all(
    site.offers.map(async (o) => {
      const planId = plans[o.key]
      if (!planId) return
      try {
        const plan = await whopApi<{ initial_price?: number | null }>(`/plans/${planId}`)
        if (typeof plan.initial_price === 'number') prices[o.key] = plan.initial_price
      } catch {
        // Fall back to the price in site.config.ts.
      }
    }),
  )

  return {
    accountId: read('WHOP_ACCOUNT_ID'),
    environment: read('WHOP_ENVIRONMENT') === 'sandbox' ? 'sandbox' : 'production',
    plans,
    prices,
  }
})
