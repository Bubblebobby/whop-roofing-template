import { createFileRoute } from '@tanstack/react-router'
import { site } from '#/site.config'
import { accountId, errorResponse, requireEnv, whopApi, WhopApiError } from '#/server/whop'

type SetupIntent = {
  id: string
  status: string
  created_at: string
  member_id: string | null
  payment_method_id: string | null
}

const MAX_AGE_MS = 60 * 60 * 1000
const SETTLE_TIMEOUT_MS = 20_000
const POLL_INTERVAL_MS = 1_000

/** Polls the setup status until it leaves its in-progress states, or the timeout passes. */
async function waitForSetup(setupIntentId: string) {
  const deadline = Date.now() + SETTLE_TIMEOUT_MS
  for (;;) {
    const { status } = await whopApi<{ status: string }>(`/setup_intents/${setupIntentId}/status`)
    if (['succeeded', 'canceled', 'requires_action', 'requires_payment_method'].includes(status) || Date.now() > deadline) {
      return status
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
}

/**
 * Step 2 of the deposit: charge the deposit plan to the card the setup intent
 * just saved. The same card stays on file for the final-balance invoice.
 * Idempotent per setup intent, so a retry or refresh never double-charges.
 */
export const Route = createFileRoute('/api/deposit/charge')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { setupIntentId } = (await request.json().catch(() => ({}))) as { setupIntentId?: string }
          if (!setupIntentId || !/^sint_[A-Za-z0-9]+$/.test(setupIntentId)) {
            throw new WhopApiError('Missing setup intent.', 400, null)
          }

          // Whop finishes saving the card asynchronously (a few seconds after the setup
          // intent is created), so wait for the setup status to settle before charging.
          const status = await waitForSetup(setupIntentId)
          if (status === 'requires_action') {
            throw new WhopApiError('Your bank needs to verify this card. Please try again.', 409, null)
          }
          const setupIntent = await whopApi<SetupIntent>(`/setup_intents/${setupIntentId}`)
          if (setupIntent.status !== 'succeeded' || !setupIntent.payment_method_id || !setupIntent.member_id) {
            throw new WhopApiError('Your card was not saved yet. Please try again.', 409, null)
          }
          if (Date.now() - new Date(setupIntent.created_at).getTime() > MAX_AGE_MS) {
            throw new WhopApiError('This checkout expired. Please start again.', 410, null)
          }

          const depositPlan = requireEnv(site.offers.find((o) => o.key === 'deposit')!.planEnv)
          const payment = await whopApi<{ id: string; status: string; substatus?: string }>('/payments', {
            idempotencyKey: `deposit-${setupIntent.id}`,
            body: {
              account_id: accountId(),
              plan_id: depositPlan,
              member_id: setupIntent.member_id,
              payment_method_id: setupIntent.payment_method_id,
            },
          })
          return Response.json({
            paymentId: payment.id,
            status: payment.status,
            memberId: setupIntent.member_id,
            paymentMethodId: setupIntent.payment_method_id,
          })
        } catch (err) {
          return errorResponse(err)
        }
      },
    },
  },
})
