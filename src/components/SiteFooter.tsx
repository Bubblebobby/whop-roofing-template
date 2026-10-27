import { Link } from '@tanstack/react-router'
import { site } from '#/site.config'
import { LogoMark } from './Icons'
import { telHref } from './SiteHeader'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="overflow-hidden bg-ink pb-20 text-stone-300 md:pb-0">
      <div className="container-x grid gap-10 pb-10 pt-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="font-display text-xl font-semibold tracking-tight text-white">{site.company.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">{site.company.tagline}</p>
          <p className="mt-4 text-xs text-stone-500">{site.company.license}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {site.services.map((s) => (
              <li key={s.slug}>
                <Link to="/services/$slug" params={{ slug: s.slug }} className="hover:text-white">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={telHref()} className="hover:text-white">
                {site.company.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.company.email}`} className="break-all hover:text-white">
                {site.company.email}
              </a>
            </li>
            <li>{site.company.address}</li>
            <li>{site.company.hours}</li>
          </ul>
        </div>
      </div>
      <div className="container-x">
        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.company.name}. All rights reserved.
          </p>
          <p>Payments, financing and invoices are processed securely by Whop.</p>
        </div>
      </div>
      {/* Oversized wordmark, stretched to the full width whatever the name's length. */}
      <svg aria-hidden="true" viewBox="0 0 1000 150" className="mx-auto block w-full max-w-[1400px] select-none px-3">
        <defs>
          <linearGradient id="wordmark-fade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <text
          x="500"
          y="140"
          textAnchor="middle"
          textLength="990"
          lengthAdjust="spacingAndGlyphs"
          fontSize="170"
          fontWeight="600"
          fill="url(#wordmark-fade)"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.05em' }}
        >
          {site.company.shortName}
        </text>
      </svg>
    </footer>
  )
}
