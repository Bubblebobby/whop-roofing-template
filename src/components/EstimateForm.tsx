import { useState } from 'react'
import type { FormEvent } from 'react'
import { site } from '#/site.config'
import { track } from '#/lib/track'
import { CheckIcon } from './Icons'

type Status = { state: 'idle' } | { state: 'sending' } | { state: 'sent'; leadId: string } | { state: 'error'; message: string }

const timelines = ['As soon as possible', 'Within a month', '1–3 months', 'Just researching']

export function EstimateForm({ defaultService }: { defaultService?: string }) {
  const [status, setStatus] = useState<Status>({ state: 'idle' })

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>
    setStatus({ state: 'sending' })
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, source: window.location.href }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error ?? 'We could not send your request.')
      // Fire once the lead exists, keyed by the Whop lead ID so retries never double-count.
      track('estimate_requested', { event_id: body.id, service: data.service, timeline: data.timeline, zip: data.zip })
      track('lead', { event_id: body.id })
      setStatus({ state: 'sent', leadId: body.id })
      form.reset()
    } catch (err) {
      setStatus({ state: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    }
  }

  if (status.state === 'sent') {
    return (
      <div className="card p-8 text-center" role="status">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckIcon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-xl font-semibold">Request received</h3>
        <p className="mt-2 text-slate-600">
          A project manager will call you within one business day to schedule your free on-site estimate.
        </p>
        <p className="mt-4 text-xs text-slate-400">Reference {status.leadId}</p>
        <button type="button" className="btn-ghost mt-6" onClick={() => setStatus({ state: 'idle' })}>
          Send another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8" noValidate={false}>
      <div className="sm:col-span-2">
        <h3 className="text-xl font-semibold">Request a free estimate</h3>
        <p className="mt-1 text-sm text-slate-500">No obligation. We reply within one business day.</p>
      </div>
      <label className="block">
        <span className="field-label">Full name</span>
        <input name="name" required autoComplete="name" className="field" />
      </label>
      <label className="block">
        <span className="field-label">Phone</span>
        <input name="phone" type="tel" required autoComplete="tel" className="field" />
      </label>
      <label className="block sm:col-span-2">
        <span className="field-label">Email</span>
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <label className="block">
        <span className="field-label">Street address</span>
        <input name="address" autoComplete="street-address" className="field" />
      </label>
      <label className="block">
        <span className="field-label">ZIP code</span>
        <input name="zip" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} autoComplete="postal-code" className="field" />
      </label>
      <label className="block">
        <span className="field-label">What do you need?</span>
        <select name="service" className="field" defaultValue={defaultService ?? site.services[0]?.name}>
          {site.services.map((s) => (
            <option key={s.slug}>{s.name}</option>
          ))}
          <option>Not sure yet</option>
        </select>
      </label>
      <label className="block">
        <span className="field-label">Timeline</span>
        <select name="timeline" className="field" defaultValue={timelines[0]}>
          {timelines.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="field-label">Anything we should know? (optional)</span>
        <textarea name="message" rows={3} maxLength={1000} className="field" placeholder="Leak location, roof age, hail date, insurance claim…" />
      </label>
      {status.state === 'error' && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2" role="alert">
          {status.message}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">By submitting you agree to be contacted about your project.</p>
        <button type="submit" className="btn-primary" disabled={status.state === 'sending'}>
          {status.state === 'sending' ? 'Sending…' : 'Request my estimate'}
        </button>
      </div>
    </form>
  )
}
