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
 * load — it loads with holes, and a missing number propagates into pricing.
 * Detecting that here is cheaper than defending against it everywhere.
 */
export const ensureSeeded = async (): Promise<DealTripStore> => {
  const store = await getStore()
  const existing = await store.listMerchants()

  /*
   * A stored merchant is stale when it lacks a top-level field the current
   * catalog defines. Merchants live in JSONB, so an older row does not fail to
   * load — it loads with holes, and a missing number reaches pricing. Keying on
   * the shape rather than on one named field means the next field added is
   * caught without anyone remembering to update this line.
   */
  const seeded = new Set(SEED_MERCHANTS.map(m => m.slug))
  const expectedKeys = Object.keys(SEED_MERCHANTS[0] ?? {})

  const stale = existing
    .filter(m => expectedKeys.some(key => (m as Record<string, unknown>)[key] === undefined))
    .map(m => m.slug)

  if (existing.length === 0) {
    for (const merchant of SEED_MERCHANTS) await store.upsertMerchant(merchant)
    console.info(`[dealtrip] seeded ${SEED_MERCHANTS.length} merchants`)
  } else if (stale.length > 0) {
    // Refresh only the seeded properties; a merchant someone onboarded is
    // theirs, so it is repaired in place rather than overwritten.
    for (const merchant of SEED_MERCHANTS) await store.upsertMerchant(merchant)

    for (const slug of stale.filter(s => !seeded.has(s))) {
      const merchant = existing.find(m => m.slug === slug)

      if (merchant)
        await store.upsertMerchant({
          ...merchant,
          weekend_uplift_pct: merchant.weekend_uplift_pct ?? 20,
          image: merchant.image ?? '',
          rooms: merchant.rooms.map(room => ({ ...room, image: room.image ?? '' }))
        })
    }

    console.info(`[dealtrip] refreshed ${stale.length} merchant(s) with an outdated catalog shape`)
  }

  return store
}

export const allMerchants = async (): Promise<Merchant[]> => {
  const store = await ensureSeeded()

  return store.listMerchants()
}

/**
 * Prefer the host the request actually arrived on, so published profile URLs are
 * always reachable from wherever the caller is. NEXT_PUBLIC_APP_URL is only a
 * fallback — hard-coding it ahead of the real host means a profile fetched on
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

export const agentJson = (data: unknown, init?: ResponseInit) =>
  json(data, { ...init, headers: { ...CORS, ...(init?.headers ?? {}) } })
