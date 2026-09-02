/**
 * Shared server helpers for the API layer.
 */
import { SEED_MERCHANTS } from './seed'
import { getStore } from './store'

import type { DealTripStore } from './store'
import type { Merchant } from './types'

/**
 * Seeds the marketplace on first use so a fresh database needs no setup step.
 *
 * Also re-seeds when a stored merchant predates a field the catalog now
 * requires. Merchants are stored as JSONB, so an older row does not fail to
 * load, it loads with holes, and a missing number propagates into pricing.
 * Detecting that here is cheaper than defending against it everywhere.
 */
/**
 * Seeds the marketplace on first use, and keeps the seeded catalog current.
 *
 * Merchants live in JSONB, so a stored row never fails to load when the catalog
 * changes, it just loads with holes, or with fields that no longer mean
 * anything. Detecting drift by comparing the stored document against the seed
 * catches both directions: a field added since it was written, and a field
 * since removed.
 *
 * The merchant's POLICY is deliberately excluded from that comparison and
 * carried across untouched. Those numbers are the operator's, edited in the
 * Policy Studio, and re-seeding is not a reason to silently discard them.
 */
declare global {
   
  var __dealtripSeeded: Promise<DealTripStore> | undefined
}

/**
 * Runs once per process, not once per request.
 *
 * The drift check reads every merchant and compares it against the catalog.
 * That is cheap but not free, and it was happening on every single call to
 * allMerchants() — which is most requests. On a serverless platform that is a
 * database round trip per invocation for an answer that cannot change while the
 * instance lives.
 */
export const ensureSeeded = (): Promise<DealTripStore> => (globalThis.__dealtripSeeded ??= seedOnce())

const seedOnce = async (): Promise<DealTripStore> => {
  const store = await getStore()

  if (store.kind === 'memory' && process.env.VERCEL)
    console.error(
      '[dealtrip] Running on Vercel without a reachable database. Each invocation gets its own ' +
        'in-memory store, so a negotiation created by one request will not exist for the next. ' +
        'Set DATABASE_URL.'
    )

  const existing = await store.listMerchants()

  if (existing.length === 0) {
    for (const merchant of SEED_MERCHANTS) await store.upsertMerchant(merchant)
    console.info(`[dealtrip] seeded ${SEED_MERCHANTS.length} merchants`)

    return store
  }

  // Compare everything except the policy, which belongs to the operator.
  const catalogOf = (merchant: Merchant) =>
    JSON.stringify(Object.fromEntries(Object.entries(merchant).filter(([key]) => key !== 'policy')))

  const drifted: string[] = []

  for (const seed of SEED_MERCHANTS) {
    const stored = existing.find(m => m.slug === seed.slug)

    if (stored && catalogOf(stored) === catalogOf(seed)) continue

    // Keep whatever policy the operator has set; refresh everything else.
    await store.upsertMerchant({ ...seed, policy: stored?.policy ?? seed.policy })
    drifted.push(seed.slug)
  }

  /*
   * Onboarded merchants are not ours to reshape, but they must still parse.
   *
   * A stored document does not gain a field just because the schema did: Zod
   * defaults apply when something is parsed, and these rows are read straight
   * back as JSON. Every field added since a row was written has to be filled
   * in explicitly here or it stays undefined forever, which is how `bedrooms`
   * and `rooms` both ended up reading as NaN somewhere downstream.
   */
  for (const merchant of existing) {
    if (SEED_MERCHANTS.some(s => s.slug === merchant.slug)) continue

    const complete =
      Number.isFinite(merchant.weekend_uplift_pct) &&
      merchant.image !== undefined &&
      merchant.rooms.every(r => Number.isFinite(r.bedrooms))

    if (complete) continue

    await store.upsertMerchant({
      ...merchant,
      weekend_uplift_pct: merchant.weekend_uplift_pct ?? 20,
      image: merchant.image ?? '',
      rooms: merchant.rooms.map(r => ({
        ...r,
        bedrooms: Number.isFinite(r.bedrooms) ? r.bedrooms : 1
      }))
    })
    drifted.push(merchant.slug)
  }

  if (drifted.length > 0)
    console.info(`[dealtrip] refreshed ${drifted.length} merchant catalog(s): ${drifted.join(', ')}`)

  return store
}

export const allMerchants = async (): Promise<Merchant[]> => {
  const store = await ensureSeeded()

  return store.listMerchants()
}

/**
 * Prefer the host the request actually arrived on, so published profile URLs are
 * always reachable from wherever the caller is. NEXT_PUBLIC_APP_URL is only a
 * fallback. Hard-coding it ahead of the real host means a profile fetched on
 * one port advertises endpoints on another.
 */
export const baseUrlFrom = (request: Request): string => {
  const url = new URL(request.url)
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? url.host

  if (host) {
    const proto = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '')

    return `${proto}://${host}`
  }

  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export const json = (data: unknown, init?: ResponseInit) =>
  Response.json(data, {
    ...init,
    headers: { 'cache-control': 'no-store', ...(init?.headers ?? {}) }
  })

export const fail = (status: number, message: string, extra?: Record<string, unknown>) =>
  json({ error: message, ...extra }, { status })

/** Agent-facing endpoints are readable by any client, including other agents. */
export const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type'
}

/**
 * Agent-facing JSON response.
 *
 * Minified for machines, indented for people. The distinction is drawn from the
 * caller's own Accept header: a browser asks for text/html first, an agent does
 * not. Same bytes of meaning either way, but these endpoints are the evidence
 * that the catalog really is machine-readable, so the one time a human opens
 * one it should be legible without them having to find a checkbox.
 */
export const agentJson = (data: unknown, init?: ResponseInit, request?: Request) => {
  const wantsHtml = request?.headers.get('accept')?.includes('text/html') ?? false
  const body = wantsHtml ? JSON.stringify(data, null, 2) : JSON.stringify(data)

  return new Response(body, {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...CORS,
      ...(init?.headers ?? {})
    }
  })
}
