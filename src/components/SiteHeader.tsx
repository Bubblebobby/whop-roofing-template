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

/** Floating pill navigation. It sits over photo heroes; other pages clear it with `page-top`. */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed inset-x-0 top-3 z-40 px-3 sm:top-4">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-full border border-black/5 bg-white/90 pl-4 pr-2 shadow-[0_8px_30px_rgb(0_0_0/0.08)] backdrop-blur-md">
        <Link to="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
          <LogoMark className="h-7 w-7 shrink-0" />
          <span className="truncate font-display text-[17px] font-semibold tracking-tight text-ink">{site.company.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-sand hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href={telHref()}
            onClick={() => track('contact', { method: 'phone', location: 'header' })}
            className="hidden items-center gap-2 px-2 text-sm font-semibold text-ink xl:inline-flex"
          >
            <PhoneIcon className="h-4 w-4 text-brand" />
            {site.company.phone}
          </a>
          <a href="/#estimate" className="btn-dark hidden px-4 py-2.5 md:inline-flex">
            Free estimate
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-sand lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="mx-auto mt-2 max-w-6xl rounded-3xl border border-black/5 bg-white p-2 shadow-[0_8px_30px_rgb(0_0_0/0.12)] lg:hidden"
          aria-label="Mobile"
        >
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-base font-medium text-ink hover:bg-sand">
              {n.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
