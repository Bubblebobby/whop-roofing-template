import { createFileRoute } from '@tanstack/react-router'
import { site } from '#/site.config'
import { accountId, errorResponse, requireEnv, whopApi, WhopApiError } from '#/server/whop'

type SetupIntent = {
  id: string
  status: string
  created_at: string
  member_id: string | null
  payment_method_id: string | null
  last_setup_error: { message?: string } | null
}

const MAX_AGE_MS = 60 * 60 * 1000
const SETTLE_TIMEOUT_MS = 20_000
const POLL_INTERVAL_MS = 750

/**
 * Whop saves the card asynchronously: the setup intent reports success a moment
 * before the saved card and member are attached to it. Poll until both are present,
 * the setup fails, or the timeout passes.
 */
async function waitForSetup(setupIntentId: string) {
  const deadline = Date.now() + SETTLE_TIMEOUT_MS
  for (;;) {
    const setupIntent = await whopApi<SetupIntent>(`/setup_intents/${setupIntentId}`)
    const ready = setupIntent.status === 'succeeded' && !!setupIntent.payment_method_id && !!setupIntent.member_id
    // Intermediate statuses can appear before success, so only a cancel or a recorded error ends the wait early.
    const failed = setupIntent.status === 'canceled' || !!setupIntent.last_setup_error
    if (ready || failed || Date.now() > deadline) {
      console.log(`[deposit] ${setupIntentId} settled as ${setupIntent.status}, ready=${ready}`)
      return setupIntent
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
}

/** A new off-session payment starts "open" and usually settles within a second or two. */
async function waitForPayment(payment: { id: string; status: string }) {
  const deadline = Date.now() + 10_000
  while (payment.status === 'open' || payment.status === 'pending') {
    if (Date.now() > deadline) break
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
    payment = await whopApi<{ id: string; status: string }>(`/payments/${payment.id}`)
  }
  return payment
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

          const setupIntent = await waitForSetup(setupIntentId)
          if (setupIntent.last_setup_error) {
            throw new WhopApiError(setupIntent.last_setup_error.message ?? 'Your card could not be saved. Please try another.', 402, null)
          }
          if (setupIntent.status !== 'succeeded' || !setupIntent.payment_method_id || !setupIntent.member_id) {
            throw new WhopApiError('Your card was not saved yet. Please try again.', 409, null)
          }
          if (Date.now() - new Date(setupIntent.created_at).getTime() > MAX_AGE_MS) {
            throw new WhopApiError('This checkout expired. Please start again.', 410, null)
          }

          const depositPlan = requireEnv(site.offers.find((o) => o.key === 'deposit')!.planEnv)
          const created = await whopApi<{ id: string; status: string; substatus?: string }>('/payments', {
            idempotencyKey: `deposit-${setupIntent.id}`,
            body: {
              account_id: accountId(),
              plan_id: depositPlan,
              member_id: setupIntent.member_id,
              payment_method_id: setupIntent.payment_method_id,
            },
          })
          const payment = await waitForPayment(created)
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
