import { z } from 'zod'

import { guardOffer } from '@/lib/dealtrip/commerce-guard'
import { diffBundles, materializeOffer, reviseOffer } from '@/lib/dealtrip/merchant-agent'
import { resolveCheckIns } from '@/lib/dealtrip/dates'
import { computeQuote, CatalogError } from '@/lib/dealtrip/pricing'
import { agentJson, allMerchants, CORS } from '@/lib/dealtrip/service'
import { BundleSchema, CounterRequestSchema, TravelIntentSchema } from '@/lib/dealtrip/types'

import type { Offer } from '@/lib/dealtrip/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RequestSchema = z.object({
  intent: TravelIntentSchema,

  /** The package you are countering. Normally the one a quote returned. */
  previous_bundle: BundleSchema.partial({ check_in: true }),
  counter: CounterRequestSchema,
  round: z.number().int().min(1).max(5).default(1)
})

/**
 * Negotiate endpoint, the same structured exchange DealTrip's own orchestrator
 * uses, exposed so an external AI buyer can run it directly.
 *
 * Send a COUNTER_REQUEST naming a target price, the attributes that must
 * survive, and the add-on groups you will accept changes to. The merchant agent
 * revises within its policy; the Commerce Guard rules on the result. A merchant
 * that cannot reach your target says so instead of pretending.
 */
export const POST = async (request: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const merchant = (await allMerchants()).find(m => m.slug === slug || m.id === slug)

  if (!merchant) return agentJson({ error: 'Unknown merchant.' }, { status: 404 }, request)

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success)
    return agentJson(
      {
        error: 'Invalid request.',
        issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
        hint: 'POST { intent, previous_bundle, counter: { type: "COUNTER_REQUEST", max_price, preserve[], preferred[], substitution_allowed[], message }, round }'
      },
      { status: 400 }
    , request)

  const { intent, previous_bundle, counter, round } = parsed.data
  const nights = intent.duration_nights
  const travelers = intent.travelers

  const allowedCheckIns = resolveCheckIns(intent.check_in, intent.date_flexibility_days)
  const defaultCheckIn = previous_bundle.check_in ?? allowedCheckIns[0] ?? new Date().toISOString().slice(0, 10)
  const previousBundle = { ...previous_bundle, check_in: defaultCheckIn }

  if (round > merchant.policy.max_counter_rounds)
    return agentJson(
      {
        revised: false,
        reason: `${merchant.name} permits ${merchant.policy.max_counter_rounds} revision(s); this would be round ${round}.`,
        max_counter_rounds: merchant.policy.max_counter_rounds
      },
      { status: 409 }, request)

  let previous: Offer

  try {
    previous = {
      id: 'ext_previous',
      negotiation_id: 'ext',
      merchant_id: merchant.id,
      round: round - 1,
      bundle: previousBundle,
      quote: computeQuote(merchant, previousBundle, nights, travelers),
      rationale: '',
      changes_from_previous: [],
      status: 'superseded',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 600_000).toISOString()
    }
  } catch (error) {
    return agentJson({ revised: false, error: error instanceof CatalogError ? error.message : 'previous_bundle could not be priced.' }, { status: 422 }, request)
  }

  const turn = await reviseOffer({
    merchant,
    intent,
    nights,
    travelers,
    counter,
    previous,
    rejection: null,
    round,
    allowed_check_ins: allowedCheckIns
  })

  if (!turn.proposal.can_meet_request)
    return agentJson({
      revised: false,
      reason: turn.proposal.withdrawal_reason ?? 'The target is not reachable within this merchant’s boundaries.',
      merchant: { id: merchant.id, name: merchant.name },
      note: 'A merchant declining is a valid outcome. Its margin floor and discount ceiling are enforced server-side and are not published.'
    }, undefined, request)

  let offer: Offer

  try {
    offer = materializeOffer({
      merchant,
      proposal: turn.proposal,
      negotiationId: 'ext',
      round,
      nights,
      travelers,
      default_check_in: defaultCheckIn
    })
  } catch (error) {
    return agentJson({ revised: false, error: error instanceof CatalogError ? error.message : 'Could not price the revision.' }, { status: 422 }, request)
  }

  const verdict = guardOffer({ merchant, offer, intent, rounds_used: round, allowed_check_ins: allowedCheckIns })

  const changes = offer.changes_from_previous.length
    ? offer.changes_from_previous
    : diffBundles(merchant, previousBundle, offer.bundle)

  return agentJson(
    {
      revised: verdict.authorized,
      merchant: { id: merchant.id, slug: merchant.slug, name: merchant.name },
      offer: {
        id: offer.id,
        round,
        bundle: offer.bundle,
        rationale: offer.rationale,
        changes_from_previous: changes,
        expires_at: offer.expires_at,
        price: {
          list: offer.quote.list_price,
          discount_pct: offer.quote.discount_pct,
          total: offer.quote.total_price,
          currency: 'INR'
        },
        delivers: offer.quote.attributes
      },
      movement: {
        previous_total: previous.quote.total_price,
        new_total: offer.quote.total_price,
        delta: previous.quote.total_price - offer.quote.total_price
      },
      guard: {
        authorized: verdict.authorized,
        checks: verdict.checks.map(c => ({ id: c.id, label: c.label, passed: c.passed, detail: c.detail })),
        violations: verdict.violations.map(v => ({ id: v.id, detail: v.detail }))
      },
      rounds_remaining: Math.max(0, merchant.policy.max_counter_rounds - round)
    },
    { status: verdict.authorized ? 200 : 409 }
  , request)
}

export const OPTIONS = () => new Response(null, { status: 204, headers: CORS })
