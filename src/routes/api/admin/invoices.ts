import { createFileRoute } from '@tanstack/react-router'
import { formatUsd, site } from '#/site.config'
import { accountId, assertAdmin, env, errorResponse, whopApi, WhopApiError } from '#/server/whop'

type InvoiceInput = {
  mode?: 'charge' | 'send'
  memberId?: string
  paymentMethodId?: string
  email?: string
  name?: string
  jobTotal?: number
  depositPaid?: number
  description?: string
  dueInDays?: number
}

type Invoice = {
  id: string
  number?: string | null
  status: string
  checkout_link?: string | null
  pay_online_url?: string | null
}

const round = (n: number) => Math.round(n * 100) / 100

/**
 * Final balance → Whop Invoices API.
 *  1. POST /invoices creates a draft with one item: an inline one-time variant priced at the balance.
 *     The item description shows the contract total and the deposit credit.
 *  2. POST /invoices/{id}/issue issues it. With the card saved at deposit attached ("charge"),
 *     issuing charges that card; without one ("send"), Whop emails the customer to pay online.
 */
export const Route = createFileRoute('/api/admin/invoices')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          assertAdmin(request)
          const input = (await request.json().catch(() => ({}))) as InvoiceInput
          const mode = input.mode === 'send' ? 'send' : 'charge'
          const total = round(Number(input.jobTotal))
          const deposit = round(Number(input.depositPaid ?? 0))
          const balance = round(total - deposit)
          if (!Number.isFinite(total) || total <= 0) throw new WhopApiError('Enter the contract total.', 400, null)
          if (!Number.isFinite(deposit) || deposit < 0) throw new WhopApiError('Deposit must be zero or more.', 400, null)
          if (balance < 1) throw new WhopApiError('The balance due must be at least $1.', 400, null)
          if (mode === 'charge' && (!input.memberId || !input.paymentMethodId)) {
            throw new WhopApiError('Pick a customer with a card on file to auto-charge.', 400, null)
          }
          if (!input.memberId && (!input.email || !input.name)) {
            throw new WhopApiError('A new customer needs a name and email.', 400, null)
          }

          const dueDays = Math.min(Math.max(Number(input.dueInDays) || 7, 0), 90)
          const label = input.description?.trim() || 'Roof replacement'
          const breakdown =
            deposit > 0 ? `${label}: ${formatUsd(total)} contract total, less ${formatUsd(deposit)} deposit paid.` : `${label}: ${formatUsd(total)}.`
          const productId = env('WHOP_PRODUCT_ID')

          const draft = await whopApi<Invoice>('/invoices', {
            body: {
              account_id: accountId(),
              items: [
                {
                  quantity: 1,
                  plan: {
                    currency: 'usd',
                    plan_type: 'one_time',
                    initial_price: balance,
                    title: 'Final balance',
                    description: breakdown,
                    visibility: 'hidden',
                    ...(productId ? { product_id: productId } : { product: { title: `${site.company.name}: Final balance` } }),
                  },
                },
              ],
              due_at: new Date(Date.now() + dueDays * 86_400_000).toISOString().replace(/\.\d{3}Z$/, 'Z'),
              member_id: input.memberId || undefined,
              email_address: input.memberId ? undefined : input.email?.trim(),
              customer_name: input.memberId ? undefined : input.name?.trim(),
              payment_method_id: mode === 'charge' ? input.paymentMethodId : undefined,
              metadata: { contract_total: String(total), deposit_paid: String(deposit), source: 'admin_billing' },
            },
          })
          const invoice = await whopApi<Invoice>(`/invoices/${draft.id}/issue`, {
            method: 'POST',
            idempotencyKey: `issue-${draft.id}`,
          })
          return Response.json({
            id: invoice.id,
            number: invoice.number ?? null,
            status: invoice.status,
            collectionMethod: mode === 'charge' ? 'charge_automatically' : 'send_invoice',
            payOnlineUrl: invoice.pay_online_url ?? null,
            balance,
          })
        } catch (err) {
          return errorResponse(err)
        }
      },
    },
  },
})
