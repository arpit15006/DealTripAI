/**
 * Shared server helpers for the API layer.
 */
import { SEED_MERCHANTS } from './seed'
import { getStore } from './store'

import type { DealTripStore } from './store'
import type { Merchant } from './types'

/** Seeds the marketplace on first use so a fresh database needs no setup step. */
export const ensureSeeded = async (): Promise<DealTripStore> => {
  const store = await getStore()
  const existing = await store.listMerchants()

  if (existing.length === 0) {
    for (const merchant of SEED_MERCHANTS) await store.upsertMerchant(merchant)
    console.info(`[dealtrip] seeded ${SEED_MERCHANTS.length} merchants`)
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
