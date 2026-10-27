import type { SVGProps } from 'react'
import type { Service, TrustIcon as TrustIconName } from '#/site.config'

type P = SVGProps<SVGSVGElement>
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const PhoneIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
)
export const CheckIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={2.2} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
export const StarIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
  </svg>
)
export const PinIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
export const ShieldIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)
export const ArrowIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
export const MenuIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)
export const CloseIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const CardIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
)

export function ServiceIcon({ name, ...p }: P & { name: Service['icon'] }) {
  switch (name) {
    case 'repair':
      return (
        <svg viewBox="0 0 24 24" {...base} {...p}>
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />
        </svg>
      )
    case 'replace':
      return (
        <svg viewBox="0 0 24 24" {...base} {...p}>
          <path d="M2 12 12 3l10 9" />
          <path d="M5 10v10h14V10" />
          <path d="M9 20v-6h6v6" />
        </svg>
      )
    case 'inspect':
      return (
        <svg viewBox="0 0 24 24" {...base} {...p}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
          <path d="m8 11 2 2 4-4" />
        </svg>
      )
    case 'gutter':
      return (
        <svg viewBox="0 0 24 24" {...base} {...p}>
          <path d="M3 6h18l-2 5H5z" />
          <path d="M17 11v7a2 2 0 0 1-2 2h-1" />
          <path d="M8 15c0 1.5-1 2.5-1 3.5a1 1 0 0 0 2 0c0-1-1-2-1-3.5z" />
        </svg>
      )
  }
}

export function TrustIcon({ name, ...p }: P & { name: TrustIconName }) {
  switch (name) {
    case 'certified':
      return (
        <svg viewBox="0 0 24 24" {...base} {...p}>
          <circle cx="12" cy="9" r="6" />
          <path d="m9 9 2 2 4-4" />
          <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
        </svg>
      )
    case 'insured':
      return <ShieldIcon {...p} />
    case 'warranty':
      return (
        <svg viewBox="0 0 24 24" {...base} {...p}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 13h6M9 17h4" />
        </svg>
      )
    case 'rated':
      return <StarIcon {...p} />
  }
}

/** Brand mark: a roofline. Uses the theme's brand color. */
export function LogoMark(p: P) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...p}>
      <rect width="32" height="32" rx="7" fill="var(--ink)" />
      <path d="M5 18 16 8l11 10" fill="none" stroke="var(--brand)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 17v8h14v-8" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}
