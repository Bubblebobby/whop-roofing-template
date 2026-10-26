import { Link } from '@tanstack/react-router'
import { site } from '#/site.config'
import { LogoMark } from './Icons'
import { telHref } from './SiteHeader'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-ink text-slate-300">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="h-display text-xl text-white">{site.company.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">{site.company.tagline}</p>
          <p className="mt-4 text-xs text-slate-500">{site.company.license}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Services</h3>
          <ul className="mt-3 space-y-2 text-sm">
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
          <h3 className="text-sm font-semibold text-white">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm">
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
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.company.name}. All rights reserved.
          </p>
          <p>Payments, financing and invoices are processed securely by Whop.</p>
        </div>
      </div>
    </footer>
  )
}
