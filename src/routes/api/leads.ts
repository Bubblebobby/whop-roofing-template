import { createFileRoute } from '@tanstack/react-router'
import { accountId, env, errorResponse, whopApi, WhopApiError } from '#/server/whop'

type LeadInput = {
  name?: string
  email?: string
  phone?: string
  address?: string
  zip?: string
  service?: string
  timeline?: string
  message?: string
  source?: string
}

const MAX = 1000

function clip(value: unknown, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/**
 * "Request an Estimate" → Whop Leads API (POST /leads).
 * The quote details ride along as lead metadata so they show on the lead in the dashboard.
 */
export const Route = createFileRoute('/api/leads')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const input = (await request.json().catch(() => ({}))) as LeadInput
          const lead = {
            name: clip(input.name, 120),
            email: clip(input.email, 200).toLowerCase(),
            phone: clip(input.phone, 40),
            address: clip(input.address, 200),
            zip: clip(input.zip, 10),
            service: clip(input.service, 80),
            timeline: clip(input.timeline, 80),
            message: clip(input.message, MAX),
          }
          if (!lead.name || !lead.phone || !/^\S+@\S+\.\S+$/.test(lead.email)) {
            throw new WhopApiError('Please include your name, phone and a valid email.', 400, null)
          }

          const created = await whopApi<{ id: string }>('/leads', {
            body: {
              account_id: accountId(),
              product_id: env('WHOP_PRODUCT_ID') ?? null,
              referrer: request.headers.get('referer') ?? clip(input.source, 500) ?? null,
              metadata: {
                type: 'estimate_request',
                ...lead,
                submitted_at: new Date().toISOString(),
              },
            },
          })
          return Response.json({ id: created.id })
        } catch (err) {
          return errorResponse(err)
        }
      },
    },
  },
})
