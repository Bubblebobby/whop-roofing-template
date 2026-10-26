import { getRouteApi } from '@tanstack/react-router'
import { site } from '#/site.config'
import type { Offer, OfferKey } from '#/site.config'

const rootApi = getRouteApi('__root__')

/** Offers from site.config.ts, with `price` replaced by the live Whop plan price when known. */
export function useOffers(): Offer[] {
  const { prices } = rootApi.useLoaderData()
  return site.offers.map((o) => (prices[o.key] === undefined ? o : { ...o, price: prices[o.key]! }))
}

export function useOffer(key: OfferKey | string): Offer | undefined {
  return useOffers().find((o) => o.key === key)
}
