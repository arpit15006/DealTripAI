/**
 * Browser-side API client.
 *
 * Thin and typed. Every call returns parsed JSON or throws an Error carrying
 * the server's own message, so screens can surface the real reason a thing
 * failed — "₹65,998 exceeds the traveller's hard limit" — instead of a generic
 * "something went wrong".
 */
import type { DeskEvent } from './orchestrator'
import type { PaymentRecord } from './store'
import type { AuditEvent, Merchant, MerchantPolicy, Negotiation, Offer, RankedOffer, TravelIntent } from './types'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) }
  })

  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const message =
      (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string' && body.error) ||
      `Request failed with ${res.status}`

    throw new ApiError(message, res.status, body)
  }

  return body as T
}

/* ------------------------------------------------------------------ *
 * Intent
 * ------------------------------------------------------------------ */
export interface IntentResponse {
  intent: TravelIntent
  ambiguities: string[]
  restatement: string
  known_destinations: string[]
  extraction: { source: 'model' | 'fallback'; model: string; latency_ms: number; note: string | null }
}

export const extractIntent = (raw: string) =>
  request<IntentResponse>('/api/intent', { method: 'POST', body: JSON.stringify({ request: raw }) })

/* ------------------------------------------------------------------ *
 * Negotiations
 * ------------------------------------------------------------------ */
export const openNegotiation = (intent: TravelIntent, rawRequest: string) =>
  request<{ negotiation_id: string; status: string }>('/api/negotiations', {
    method: 'POST',
    body: JSON.stringify({ intent, raw_request: rawRequest })
  })

export interface NegotiationState {
  negotiation: Negotiation
  ranked: RankedOffer[]
  explanation: string
  offers: Offer[]
  audit: AuditEvent[]
  payments: PaymentRecord[]
  merchants: Pick<Merchant, 'id' | 'name' | 'slug' | 'tagline' | 'rating' | 'destination' | 'image' | 'rooms'>[]
}

export const getNegotiation = (id: string) => request<NegotiationState>(`/api/negotiations/${id}`)

export const listNegotiations = () => request<{ negotiations: Negotiation[] }>('/api/negotiations')

/* ------------------------------------------------------------------ *
 * Approval and payment
 * ------------------------------------------------------------------ */
export interface ApprovalResponse {
  order: { id: string; amount: number; currency: string; simulated: boolean }
  key_id: string
  razorpay_configured: boolean
  verdict: { authorized: boolean; checks: { id: string; label: string; passed: boolean; detail: string }[] }
  offer_id: string
  merchant_name: string
  amount_inr: number
}

export const approveOffer = (negotiationId: string, offerId: string) =>
  request<ApprovalResponse>(`/api/negotiations/${negotiationId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ offer_id: offerId })
  })

export const verifyPayment = (payload: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}) => request<{ status: string; negotiation_id: string }>('/api/payments/verify', {
  method: 'POST',
  body: JSON.stringify(payload)
})

export const reportPaymentFailure = (orderId: string, reason: string) =>
  request<{ status: string; retryable: boolean; offer_held_until: string | null; message: string }>(
    '/api/payments/failure',
    { method: 'POST', body: JSON.stringify({ razorpay_order_id: orderId, reason }) }
  )

/* ------------------------------------------------------------------ *
 * Merchants
 * ------------------------------------------------------------------ */
export type MerchantListItem = Merchant & {
  profile_url: string
  published: {
    negotiable: boolean
    max_counter_rounds: number
    substitutable: string[]
    always_included_addons: string[]
    offer_ttl_minutes: number
    note: string
  }
}

export const listMerchants = () => request<{ merchants: MerchantListItem[] }>('/api/merchants')

export const getMerchant = (id: string) => request<{ merchant: Merchant }>(`/api/merchants/${id}`)

export const updateMerchantPolicy = (id: string, policy: Partial<MerchantPolicy>) =>
  request<{ merchant: Merchant }>(`/api/merchants/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ policy })
  })

export interface OnboardResponse {
  merchant: Merchant
  saved: boolean
  profile_url: string
  extraction: { source: 'model' | 'fallback'; model: string; latency_ms: number; note: string | null }
}

export const onboardMerchant = (text: string, save: boolean) =>
  request<OnboardResponse>('/api/merchants/onboard', {
    method: 'POST',
    body: JSON.stringify({ text, save })
  })

/* ------------------------------------------------------------------ *
 * Simulator and health
 * ------------------------------------------------------------------ */
export const runSimulation = (config: { intents: number; destination: string; seed: number }) =>
  request<import('./simulator').SimulationResult & { runtime_ms: number }>('/api/simulate', {
    method: 'POST',
    body: JSON.stringify(config)
  })

export interface HealthResponse {
  ok: boolean
  persistence: string
  language_model: { configured: boolean; model?: string; note?: string }
  payments: { configured: boolean; mode?: string; note?: string }
  marketplace: { merchants: number; destinations: string[] }
}

export const getHealth = () => request<HealthResponse>('/api/health')

export type { DeskEvent }
