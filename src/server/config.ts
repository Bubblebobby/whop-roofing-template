import { createServerFn } from '@tanstack/react-start'
import { site } from '#/site.config'
import type { OfferKey } from '#/site.config'

export type PublicConfig = {
  accountId: string | null
  environment: 'production' | 'sandbox'
  plans: Record<OfferKey, string | null>
}

/**
 * The only Whop values the browser needs: the account and the public plan IDs.
 * They come from env/secrets so one build can serve any business.
 */
export const getPublicConfig = createServerFn({ method: 'GET' }).handler(async (): Promise<PublicConfig> => {
  const read = (name: string) => {
    const value = process.env[name]
    return value && value.trim() !== '' ? value.trim() : null
  }
  const plans = Object.fromEntries(site.offers.map((o) => [o.key, read(o.planEnv)])) as Record<OfferKey, string | null>
  return {
    accountId: read('WHOP_ACCOUNT_ID'),
    environment: read('WHOP_ENVIRONMENT') === 'sandbox' ? 'sandbox' : 'production',
    plans,
  }
})
