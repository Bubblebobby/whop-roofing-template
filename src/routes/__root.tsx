import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import type { CSSProperties, ReactNode } from 'react'

import appCss from '../styles.css?url'
import { site } from '#/site.config'
import { getPublicConfig } from '#/server/config'
import { SiteHeader } from '#/components/SiteHeader'
import { SiteFooter } from '#/components/SiteFooter'
import { MobileActionBar } from '#/components/MobileActionBar'
import { TrackDebugPanel } from '#/components/TrackDebugPanel'

export const Route = createRootRoute({
  loader: () => getPublicConfig(),
  staleTime: Infinity,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: `${site.company.name} | Roof Repair, Replacement & Inspections` },
      { name: 'description', content: `${site.company.tagline} ${site.hero.subhead}` },
      { name: 'theme-color', content: site.theme.ink },
      { property: 'og:title', content: site.company.name },
      { property: 'og:description', content: site.company.tagline },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600&family=Inter:wght@400;500;600;700&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'icon',
        href: `data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${site.theme.ink}"/><path d="M5 18 16 8l11 10" fill="none" stroke="${site.theme.primary}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 17v8h14v-8" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
        )}`,
      },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
})

function RootLayout() {
  return (
    <>
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
      <MobileActionBar />
      <TrackDebugPanel />
    </>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  const themeVars = {
    '--brand': site.theme.primary,
    '--brand-dark': site.theme.primaryDark,
    '--ink': site.theme.ink,
    '--sand': site.theme.sand,
  } as CSSProperties
  return (
    <html lang="en" style={themeVars}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
