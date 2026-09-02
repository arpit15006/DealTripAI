import { allMerchants, fail, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'
import { TravelIntentSchema } from '@/lib/dealtrip/types'

import type { Negotiation } from '@/lib/dealtrip/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Open a negotiation from an intent the traveller has confirmed.
 *
 * The intent is re-validated here rather than trusted from the client: the
 * confirmation screen is a UI affordance, not a security boundary.
 */
export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as
    | { intent?: unknown; raw_request?: string }
    | null

  const parsed = TravelIntentSchema.safeParse(body?.intent)

  if (!parsed.success)
    return fail(400, 'Invalid travel intent.', {
      issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
    })

  const store = await getStore()

  await allMerchants() // seeds on first run

  const now = new Date().toISOString()

  const negotiation: Negotiation = {
    id: `neg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    intent: parsed.data,
    raw_request: (body?.raw_request ?? '').slice(0, 2000),
    status: 'extracting',
    created_at: now,
    updated_at: now,
    selected_offer_id: null
  }

  await store.createNegotiation(negotiation)

  await store.appendAudit({
    id: `evt_${Date.now().toString(36)}`,
    negotiation_id: negotiation.id,
    ts: now,
    actor: 'user',
    merchant_id: null,
    action: 'intent_confirmed',
    summary: `Traveller confirmed: ${parsed.data.duration_nights} nights in ${parsed.data.destination} for ${parsed.data.travelers}, up to ₹${parsed.data.budget.max.toLocaleString('en-IN')}.`,
    decision: 'info',
    detail: { intent: parsed.data, raw_request: negotiation.raw_request }
  })

  return json({ negotiation_id: negotiation.id, status: negotiation.status }, { status: 201 })
}

/** Recent negotiations, for the demo's history list. */
export const GET = async () => {
  const store = await getStore()

  return json({ negotiations: await store.listNegotiations(20) })
}
