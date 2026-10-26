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
  eventId?: string
}

type Page<T> = { data?: T[] }
type MemberRow = { email?: string | null; user?: { id?: string } | null; user_id?: string | null }
type PersonRow = { email?: string | null; emails?: string[] | null; user_id?: string | null; user?: { id?: string } | null }

function clip(value: unknown, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/**
 * Whop leads belong to a Whop user, so look the visitor's email up first:
 * the account's members (anyone who has paid through checkout), then the
 * pixel's people. Lookups that fail just fall through to the next one.
 */
async function resolveUserId(account: string, email: string): Promise<string | null> {
  const query = new URLSearchParams({ account_id: account, company_id: account, query: email, first: '10' })
  try {
    const members = await whopApi<Page<MemberRow>>(`/members?${query}`)
    const hit = members.data?.find((m) => m.email?.toLowerCase() === email)
    const id = hit?.user?.id ?? hit?.user_id
    if (id) return id
  } catch {}
  try {
    const people = await whopApi<Page<PersonRow>>(`/people?${new URLSearchParams({ account_id: account, email })}`)
    const hit = people.data?.find((p) => p.user_id || p.user?.id)
    const id = hit?.user_id ?? hit?.user?.id
    if (id) return id
  } catch {}
  return null
}

/**
 * "Request an Estimate" → Whop Leads API (POST /leads), with the quote
 * details as lead metadata. A visitor Whop has never seen has no user to
 * attach a lead to, so their request is recorded as a server-side `lead`
 * event carrying their contact details instead (it shows under People).
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
            message: clip(input.message, 1000),
          }
          if (!lead.name || !lead.phone || !/^\S+@\S+\.\S+$/.test(lead.email)) {
            throw new WhopApiError('Please include your name, phone and a valid email.', 400, null)
          }
          const account = accountId()
          const referrer = request.headers.get('referer') ?? (clip(input.source, 500) || null)
          const eventId = clip(input.eventId, 80) || `est_${crypto.randomUUID()}`
          const metadata = { type: 'estimate_request', ...lead, submitted_at: new Date().toISOString() }

          const userId = await resolveUserId(account, lead.email)
          if (userId) {
            const created = await whopApi<{ id: string }>('/leads', {
              body: { account_id: account, user_id: userId, product_id: env('WHOP_PRODUCT_ID') ?? null, referrer, metadata },
            })
            return Response.json({ id: created.id, recorded: 'lead' })
          }

          const [first, ...rest] = lead.name.split(/\s+/)
          await whopApi('/events', {
            idempotencyKey: eventId,
            body: {
              account_id: account,
              event_name: 'lead',
              event_id: eventId,
              action_source: 'website',
              url: referrer,
              app_id: env('APP_ID'),
              product_id: env('WHOP_PRODUCT_ID'),
              user: {
                email: lead.email,
                phone: lead.phone,
                name: lead.name,
                first_name: first,
                last_name: rest.join(' ') || undefined,
                postal_code: lead.zip || undefined,
                country: 'US',
              },
            },
          })
          return Response.json({ id: eventId, recorded: 'event' })
        } catch (err) {
          return errorResponse(err)
        }
      },
    },
  },
})
