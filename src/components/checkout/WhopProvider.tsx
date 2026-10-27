import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { WhopElements } from '@whop/elements-react'
import type { Appearance } from '@whop/elements-react'
import { loadWhop } from '@whop/elements'
import { site } from '#/site.config'

export const checkoutAppearance: Appearance = {
  theme: { appearance: 'light', accentColor: site.theme.checkoutAccent, grayColor: site.theme.checkoutGray },
}

/**
 * Whop Elements render in iframes that only exist in the browser, so the
 * provider mounts after hydration and shows a skeleton during SSR.
 */
export function WhopProvider({ environment, children }: { environment: 'production' | 'sandbox'; children: ReactNode }) {
  const [elements, setElements] = useState<ReturnType<typeof loadWhop> | null>(null)
  useEffect(() => {
    setElements(loadWhop())
  }, [])

  if (!elements) return <CheckoutSkeleton />
  return (
    <WhopElements elements={elements} environment={environment} appearance={checkoutAppearance}>
      {children}
    </WhopElements>
  )
}

export function CheckoutSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading secure checkout">
      <div className="h-12 animate-pulse rounded-lg bg-stone-100" />
      <div className="h-40 animate-pulse rounded-lg bg-stone-100" />
      <div className="h-12 animate-pulse rounded-lg bg-stone-100" />
    </div>
  )
}
