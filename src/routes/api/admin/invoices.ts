import { createFileRoute } from '@tanstack/react-router'
import { site } from '#/site.config'
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
  number?: string
  status: string
  collection_method: string
  pay_online_url?: string | null
  due_date?: string | null
}

const round = (n: number) => Math.round(n * 100) / 100

/**
 * Final balance → Whop Invoices API (POST /invoices).
 *  - mode "charge": collection_method=charge_automatically against the card saved at deposit.
 *  - mode "send":   collection_method=send_invoice, emailed to the customer to pay online.
 * Line items show the contract total and the deposit credit; they sum to the plan price.
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
          const lineItems = [
            { label: input.description?.trim() || 'Roof replacement: contract total', quantity: 1, unit_price: total },
          ]
          if (deposit > 0) lineItems.push({ label: 'Less deposit paid', quantity: 1, unit_price: -deposit })

          const productId = env('WHOP_PRODUCT_ID')
          const invoice = await whopApi<Invoice>('/invoices', {
            body: {
              account_id: accountId(),
              collection_method: mode === 'charge' ? 'charge_automatically' : 'send_invoice',
              ...(productId ? { product_id: productId } : { product: { title: `${site.company.name}: Final balance` } }),
              plan: { plan_type: 'one_time', initial_price: balance, currency: 'usd' },
              line_items: lineItems,
              due_date: new Date(Date.now() + dueDays * 86_400_000).toISOString(),
              member_id: input.memberId || undefined,
              payment_method_id: mode === 'charge' ? input.paymentMethodId : undefined,
              email_address: input.email?.trim() || undefined,
              customer_name: input.name?.trim() || undefined,
            },
          })
          return Response.json({
            id: invoice.id,
            number: invoice.number ?? null,
            status: invoice.status,
            collectionMethod: invoice.collection_method,
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
