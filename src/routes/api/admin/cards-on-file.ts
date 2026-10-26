import { createFileRoute } from '@tanstack/react-router'
import { accountId, assertAdmin, errorResponse, whopApi } from '#/server/whop'

type SetupIntentRow = {
  id: string
  status: string
  created_at: string
  member_id: string | null
  payment_method_id: string | null
  payment_instrument?: { display_name?: string | null; card?: { brand?: string; last4?: string } | null } | null
  user?: { name?: string | null; username?: string | null } | null
}

/** Customers whose card is on file from a deposit checkout (succeeded setup intents). */
export const Route = createFileRoute('/api/admin/cards-on-file')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          assertAdmin(request)
          const params = new URLSearchParams({ account_id: accountId(), first: '50', direction: 'desc' })
          const page = await whopApi<{ data: SetupIntentRow[] }>(`/setup_intents?${params}`)
          const rows = (page.data ?? [])
            .filter((s) => s.status === 'succeeded' && s.payment_method_id && s.member_id)
            .map((s) => ({
              setupIntentId: s.id,
              createdAt: s.created_at,
              memberId: s.member_id,
              paymentMethodId: s.payment_method_id,
              card: s.payment_instrument?.display_name ?? 'Saved payment method',
              customer: s.user?.name ?? s.user?.username ?? null,
            }))
          return Response.json({ rows })
        } catch (err) {
          return errorResponse(err)
        }
      },
    },
  },
})
