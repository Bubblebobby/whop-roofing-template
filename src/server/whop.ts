/**
 * Server-only helpers for the Whop REST API.
 *
 * On Whop hosting, outbound requests to WHOP_API_ORIGIN are signed by the
 * platform proxy, so no key is ever in this code. Locally, `whop apps dev`
 * injects a short-lived WHOP_API_KEY, which we attach ourselves.
 */

export class WhopApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown,
  ) {
    super(message)
  }
}

export function env(name: string): string | undefined {
  const value = process.env[name]
  return value && value.trim() !== '' ? value.trim() : undefined
}

export function requireEnv(name: string): string {
  const value = env(name)
  if (!value) throw new WhopApiError(`Missing environment variable ${name}`, 500, null)
  return value
}

export function accountId() {
  return requireEnv('WHOP_ACCOUNT_ID')
}

function apiBase() {
  if (env('WHOP_API_ORIGIN')) return `${env('WHOP_API_ORIGIN')}/api/v1`
  return env('WHOP_ENVIRONMENT') === 'sandbox'
    ? 'https://sandbox-api.whop.com/api/v1'
    : 'https://api.whop.com/api/v1'
}

export async function whopApi<T = any>(
  path: string,
  init: { method?: string; body?: unknown; idempotencyKey?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = { accept: 'application/json' }
  if (init.body !== undefined) headers['content-type'] = 'application/json'
  const key = env('WHOP_API_KEY')
  if (key) headers.authorization = `Bearer ${key}`
  if (init.idempotencyKey) headers['idempotency-key'] = init.idempotencyKey

  const method = init.method ?? (init.body === undefined ? 'GET' : 'POST')
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    const message = data?.error?.message ?? data?.message ?? `Whop API ${res.status}`
    console.error(`[whop] ${method} ${path.split('?')[0]} → ${res.status}`, text.slice(0, 500))
    throw new WhopApiError(message, res.status, data)
  }
  return data as T
}

/** JSON error response that never leaks stack traces to the browser. */
export function errorResponse(err: unknown) {
  if (err instanceof WhopApiError) {
    const status = err.status >= 400 && err.status < 600 ? err.status : 500
    return Response.json({ error: err.message }, { status })
  }
  console.error('[server] unexpected error', err)
  return Response.json({ error: 'Something went wrong. Please call us instead.' }, { status: 500 })
}

/** Admin endpoints are gated by a shared secret set with `whop apps secrets set`. */
export function assertAdmin(request: Request) {
  const expected = env('ADMIN_TOKEN')
  const given = request.headers.get('x-admin-token')
  if (!expected) throw new WhopApiError('ADMIN_TOKEN is not configured on this site.', 503, null)
  if (given !== expected) throw new WhopApiError('Invalid admin token.', 401, null)
}
