#!/usr/bin/env node
/**
 * One-time Whop setup for a new roofing client.
 *
 *   node scripts/setup-whop.mjs              # real prices from src/site.config.ts
 *   node scripts/setup-whop.mjs --test-prices # every plan at $1, for end-to-end QA in production
 *
 * Requires a signed-in Whop CLI (`npx whop login`) and a linked app (`whop.app.json`),
 * or pass --app app_xxx. Creates one product plus a one-time plan per offer, then stores
 * the IDs (and a fresh ADMIN_TOKEN) as app secrets so the site picks them up at runtime.
 * Safe to re-run: it creates new plans each time, so only re-run when you want new ones.
 */
import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, writeFileSync } from 'node:fs'
import { site } from '../src/site.config.ts'

const args = process.argv.slice(2)
const testPrices = args.includes('--test-prices')
const appIdx = args.indexOf('--app')
const appArgs = appIdx >= 0 ? ['--app', args[appIdx + 1]] : []

function whop(...cmd) {
  const out = execFileSync('npx', ['--no-install', 'whop', ...cmd, '--format', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  const parsed = JSON.parse(out)
  return parsed?.data ?? parsed
}

const idOf = (obj, prefix) => {
  const id = obj?.id ?? obj?.result?.id
  if (!id || !String(id).startsWith(prefix)) throw new Error(`Unexpected CLI response: ${JSON.stringify(obj).slice(0, 300)}`)
  return id
}

console.log(`Setting up Whop for ${site.company.name}${testPrices ? ' (TEST PRICES: $1 each)' : ''}…`)

const product = whop(
  'products', 'create',
  '--title', `${site.company.name} Services`.slice(0, 80),
  '--description', site.company.tagline,
  '--visibility', 'hidden',
)
const productId = idOf(product, 'prod_')
console.log(`  product  ${productId}`)

const secrets = { WHOP_PRODUCT_ID: productId }
for (const offer of site.offers) {
  const variant = whop(
    'variants', 'create',
    '--product_id', productId,
    '--plan_type', 'one_time',
    '--currency', 'usd',
    '--initial_price', String(testPrices ? 1 : offer.price),
    '--title', testPrices ? `${offer.name} (test)` : offer.name,
    '--description', offer.summary,
  )
  const planId = idOf(variant, 'plan_')
  secrets[offer.planEnv] = planId
  console.log(`  ${offer.key.padEnd(10)} ${planId}  $${testPrices ? 1 : offer.price}`)
}

const adminToken = randomBytes(18).toString('base64url')
secrets.ADMIN_TOKEN = adminToken

const pairs = Object.entries(secrets).flatMap(([k, v]) => ['--secret', `${k}=${v}`])
execFileSync('npx', ['--no-install', 'whop', 'apps', 'secrets', 'set', ...pairs, ...appArgs], { stdio: 'inherit' })

// Keep a local copy for `whop apps dev` overrides and for logging into /admin/billing. Gitignored.
const envLines = Object.entries(secrets).map(([k, v]) => `${k}=${v}`)
writeFileSync('.env.local', `${envLines.join('\n')}\n`, { mode: 0o600 })
console.log(`\nSaved IDs and ADMIN_TOKEN to .env.local (gitignored${existsSync('.gitignore') ? '' : ': add it to .gitignore!'}).`)
console.log('Use ADMIN_TOKEN from that file to sign in at /admin/billing. Next: npm run deploy')
