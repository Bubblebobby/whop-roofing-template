import { createFileRoute } from '@tanstack/react-router'
import { accountId, errorResponse, whopApi, WhopApiError } from '#/server/whop'

/**
 * Step 1 of the deposit: turn the setup-mode confirmation token from
 * <PaymentElement> into a Whop setup intent, which stores the card on file.
 */
export const Route = createFileRoute('/api/deposit/setup-intent')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { confirmationToken, email } = (await request.json().catch(() => ({}))) as {
            confirmationToken?: string
            email?: string
          }
          if (!confirmationToken) throw new WhopApiError('Missing confirmation token.', 400, null)

          const origin = new URL(request.url).origin
          const setupIntent = await whopApi<{ id: string; status: string; client_secret: string }>('/setup_intents', {
            idempotencyKey: `setup-${confirmationToken}`,
            body: {
              account_id: accountId(),
              confirmation_token: confirmationToken,
              currency: 'usd',
              email: email || undefined,
              return_url: `${origin}/book/complete?offer=deposit`,
            },
          })
          return Response.json({
            id: setupIntent.id,
            status: setupIntent.status,
            client_secret: setupIntent.client_secret,
          })
        } catch (err) {
          return errorResponse(err)
        }
      },
    },
  },
})
