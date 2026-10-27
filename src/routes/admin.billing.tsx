import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { formatUsd, site } from '#/site.config'
import { useOffer } from '#/lib/offers'

export const Route = createFileRoute('/admin/billing')({
  head: () => ({ meta: [{ title: `Final balance billing | ${site.company.name}` }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: BillingPage,
})

type CardRow = { setupIntentId: string; createdAt: string; memberId: string; paymentMethodId: string; card: string; customer: string | null }
type InvoiceResult = { id: string; number: string | null; status: string; collectionMethod: string; payOnlineUrl: string | null; balance: number }

const TOKEN_KEY = 'roof:admin-token'

/**
 * Office tool for the last step of the job: bill the final balance with the
 * Whop Invoices API, either auto-charging the card saved at deposit or
 * emailing an invoice to pay online. Gated by the ADMIN_TOKEN app secret.
 */
function BillingPage() {
  const [token, setToken] = useState('')
  const [rows, setRows] = useState<CardRow[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<CardRow | null>(null)
  const [mode, setMode] = useState<'charge' | 'send'>('charge')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<InvoiceResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const deposit = useOffer('deposit')?.price ?? 0

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(TOKEN_KEY)
      if (saved) {
        setToken(saved)
        void loadCards(saved)
      }
    } catch {}
  }, [])

  async function loadCards(t = token) {
    setLoadError(null)
    const res = await fetch('/api/admin/cards-on-file', { headers: { 'x-admin-token': t } })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setRows(null)
      setLoadError(data.error ?? 'Could not load customers.')
      return
    }
    try {
      sessionStorage.setItem(TOKEN_KEY, t)
    } catch {}
    setRows(data.rows)
  }

  async function createInvoice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({
          mode,
          memberId: selected?.memberId,
          paymentMethodId: selected?.paymentMethodId,
          name: f.name,
          email: f.email,
          jobTotal: Number(f.jobTotal),
          depositPaid: Number(f.depositPaid),
          description: f.description,
          dueInDays: Number(f.dueInDays),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Invoice failed.')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invoice failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="page-top pb-10 sm:pb-14">
      <div className="container-x max-w-4xl">
        <p className="eyebrow">Office</p>
        <h1 className="h-display mt-2 text-4xl sm:text-5xl">Bill a final balance</h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          After the final walkthrough, invoice the contract total minus the deposit. Auto-charge the card saved at deposit
          checkout, or email the customer an invoice to pay online (financing options apply there too).
        </p>

        <form
          className="card mt-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault()
            void loadCards()
          }}
        >
          <label className="block flex-1">
            <span className="field-label">Admin token</span>
            <input type="password" className="field" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" required />
          </label>
          <button className="btn-dark" type="submit">
            Load customers
          </button>
        </form>
        {loadError && <p className="mt-3 text-sm text-red-700">{loadError}</p>}

        {rows && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 className="font-semibold">Cards on file from deposits</h2>
              <ul className="mt-3 space-y-2">
                {rows.length === 0 && <li className="text-sm text-stone-500">No saved cards yet. Complete a deposit checkout first.</li>}
                {rows.map((r) => (
                  <li key={r.setupIntentId}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(r)
                        setMode('charge')
                      }}
                      className={`card w-full p-4 text-left transition ${selected?.setupIntentId === r.setupIntentId ? 'border-brand ring-2 ring-brand/20' : 'hover:border-stone-300'}`}
                    >
                      <p className="font-medium">{r.customer ?? r.memberId}</p>
                      <p className="text-sm text-stone-600">{r.card}</p>
                      <p className="mt-1 text-xs text-stone-400">
                        Saved {new Date(r.createdAt).toLocaleString()} · {r.setupIntentId}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="mt-3 text-sm font-medium text-brand" onClick={() => { setSelected(null); setMode('send') }}>
                + Invoice a customer without a saved card
              </button>
            </div>

            <form className="card space-y-4 p-6" onSubmit={createInvoice}>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1 text-sm font-medium">
                {(['charge', 'send'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={m === 'charge' && !selected}
                    onClick={() => setMode(m)}
                    className={`rounded-md px-3 py-2 disabled:opacity-40 ${mode === m ? 'bg-white shadow-sm' : 'text-stone-600'}`}
                  >
                    {m === 'charge' ? 'Auto-charge card on file' : 'Email invoice'}
                  </button>
                ))}
              </div>
              {selected ? (
                <p className="text-sm text-stone-600">
                  Customer <span className="font-medium text-ink">{selected.customer ?? selected.memberId}</span> · {selected.card}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="field-label">Customer name</span>
                    <input name="name" className="field" required />
                  </label>
                  <label className="block">
                    <span className="field-label">Customer email</span>
                    <input name="email" type="email" className="field" required />
                  </label>
                </div>
              )}
              <label className="block">
                <span className="field-label">Line item</span>
                <input name="description" className="field" defaultValue="Roof replacement: 28 sq architectural shingle" />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="field-label">Contract total ($)</span>
                  <input name="jobTotal" type="number" min="1" step="0.01" className="field" defaultValue="14000" required />
                </label>
                <label className="block">
                  <span className="field-label">Deposit paid ($)</span>
                  <input name="depositPaid" type="number" min="0" step="0.01" className="field" defaultValue={deposit} />
                </label>
                <label className="block">
                  <span className="field-label">Due in (days)</span>
                  <input name="dueInDays" type="number" min="0" max="90" className="field" defaultValue="7" />
                </label>
              </div>
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}
              <button className="btn-primary w-full" disabled={busy || (mode === 'charge' && !selected)}>
                {busy ? 'Creating invoice…' : mode === 'charge' ? 'Create invoice & charge card' : 'Create & email invoice'}
              </button>
              {result && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
                  <p className="font-semibold">
                    Invoice {result.number ?? result.id} created: {formatUsd(result.balance)} · status {result.status}
                  </p>
                  <p className="mt-1">
                    {result.collectionMethod === 'charge_automatically'
                      ? 'Whop is charging the saved card. The payment shows under Payments in your dashboard.'
                      : 'Whop emailed the invoice to the customer.'}
                  </p>
                  {result.payOnlineUrl && (
                    <a href={result.payOnlineUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block font-medium underline">
                      Open invoice payment page
                    </a>
                  )}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </section>
  )
}
