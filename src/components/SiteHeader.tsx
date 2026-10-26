import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { site } from '#/site.config'
import { track } from '#/lib/track'
import { CloseIcon, LogoMark, MenuIcon, PhoneIcon } from './Icons'

const nav = [
  { href: '/#services', label: 'Services' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#financing', label: 'Financing' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/#area', label: 'Service area' },
  { href: '/#contact', label: 'Contact' },
]

export function telHref(phone = site.company.phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <LogoMark className="h-8 w-8" />
          <span className="h-display text-xl text-ink">{site.company.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="text-sm font-medium text-slate-600 hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telHref()}
            onClick={() => track('contact', { method: 'phone', location: 'header' })}
            className="hidden items-center gap-2 text-sm font-semibold text-ink sm:inline-flex"
          >
            <PhoneIcon className="h-4 w-4 text-brand" />
            {site.company.phone}
          </a>
          <a href="/#estimate" className="btn-primary hidden md:inline-flex">
            Free estimate
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-slate-100 lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white lg:hidden" aria-label="Mobile">
          <div className="container-x flex flex-col py-2">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-slate-100 py-3 text-base font-medium text-ink last:border-0"
              >
                {n.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
