/**
 * Thin wrapper around the Whop pixel that whop.site injects as `window.whop`.
 *
 * Page views and Whop checkout events are tracked automatically on whop.site;
 * these are the custom events this template adds. Every call is also recorded
 * in a small in-page log so events can be verified with `?debug=1`.
 */

export type TrackEvent =
  | 'service_viewed'
  | 'estimate_requested'
  | 'deposit_started'
  | 'checkout_opened'
  | 'lead'
  | 'contact'

type Props = Record<string, string | number | boolean | undefined> & {
  value?: number
  currency?: string
  event_id?: string
}

declare global {
  interface Window {
    whop?: { track: (name: string, props?: Record<string, unknown>) => void }
    __roofTrackLog?: { name: string; props: Props; at: string; sent: boolean }[]
  }
}

export const TRACK_EVENT = 'roof:track'

export function track(name: TrackEvent, props: Props = {}) {
  if (typeof window === 'undefined') return
  const clean = Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) as Props
  let sent = false
  try {
    if (window.whop && typeof window.whop.track === 'function') {
      window.whop.track(name, clean)
      sent = true
    }
  } catch (err) {
    console.warn('[track] whop.track failed', err)
  }
  const entry = { name, props: clean, at: new Date().toISOString(), sent }
  window.__roofTrackLog = [...(window.__roofTrackLog ?? []), entry]
  console.info(`[whop.track] ${name}${sent ? '' : ' (pixel not loaded: local dev)'}`, clean)
  window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: entry }))
}

export function newEventId(prefix: string) {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${prefix}_${rand}`
}
