import { z } from 'zod'

import { guardOffer } from '@/lib/dealtrip/commerce-guard'
import { openingOffer, materializeOffer } from '@/lib/dealtrip/merchant-agent'
import { resolveCheckIns } from '@/lib/dealtrip/dates'
import { CatalogError, minimumAllowedPrice } from '@/lib/dealtrip/pricing'
import { agentJson, allMerchants, CORS } from '@/lib/dealtrip/service'
import { BundleSchema, TravelIntentSchema } from '@/lib/dealtrip/types'

import type { Offer } from '@/lib/dealtrip/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RequestSchema = z.object({
  intent: TravelIntentSchema,

  /**
   * Optional. Omit it and the merchant's own agent composes a package for you.
   * Supply it and you are proposing a specific package — which is the honest way
   * to test the Commerce Guard, because you can propose an illegal one.
   */
  bundle: BundleSchema.partial({ check_in: true }).optional()
})

/**
 * Quote endpoint.
 *
 * Two modes, both of which end at the same place: every response carries the
 * Commerce Guard's full verdict, pass or fail. There is no path through this
 * endpoint that returns a price without also returning the twelve checks that
 * price had to survive.
 *
 * Try it. Ask for a 40% discount on a room and read the rejection:
 *
 *   curl -sX POST .../api/agent/oceanvista/quote -H 'content-type: application/json' \
 *     -d '{"intent":{...},"bundle":{"room_id":"ov-premium-beach","addon_ids":[],"discount_pct":40}}'
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
        hint: 'POST { "intent": <TravelIntent>, "bundle"?: { room_id, addon_ids, discount_pct } }. Fetch /api/agent/vocabulary for valid requirement attributes.'
      },
      { status: 400 }
    , request)

  const { intent, bundle } = parsed.data
  const nights = intent.duration_nights
  const travelers = intent.travelers
  const now = new Date()

  // The dates this quote may use, derived from the caller's own intent.
  const allowedCheckIns = resolveCheckIns(intent.check_in, intent.date_flexibility_days, now)
  const defaultCheckIn = allowedCheckIns[0] ?? now.toISOString().slice(0, 10)

  let offer: Offer
  let composedBy: 'merchant_agent' | 'caller'

  try {
    if (bundle) {
      composedBy = 'caller'
      offer = materializeOffer({
        merchant,
        proposal: {
          check_in: bundle.check_in ?? null,
          room_id: bundle.room_id,
          addon_ids: bundle.addon_ids,
          discount_pct: bundle.discount_pct,
          rationale: 'Package specified by the calling agent.',
          changes_from_previous: [],
          can_meet_request: true,
          withdrawal_reason: null
        },
        negotiationId: `ext_${now.getTime().toString(36)}`,
        round: 0,
        nights,
        travelers,
        default_check_in: defaultCheckIn,
        now
      })
    } else {
      composedBy = 'merchant_agent'

      const turn = await openingOffer({ merchant, intent, nights, travelers, allowed_check_ins: allowedCheckIns })

      if (!turn.proposal.can_meet_request)
        return agentJson({
          quoted: false,
          reason: turn.proposal.withdrawal_reason ?? 'No package meets this request within policy.',
          merchant: { id: merchant.id, name: merchant.name }
        }, undefined, request)

      offer = materializeOffer({
        merchant,
        proposal: turn.proposal,
        negotiationId: `ext_${now.getTime().toString(36)}`,
        round: 0,
        nights,
        travelers,
        default_check_in: defaultCheckIn,
        now
      })
    }
  } catch (error) {
    // An id that is not in the catalog never becomes a price.
    return agentJson(
      {
        quoted: false,
        error: error instanceof CatalogError ? error.message : 'Could not price that package.',
        guard: { authorized: false, failed_check: 'catalog_integrity' }
      },
      { status: 422 }, request)
  }

  const verdict = guardOffer({ merchant, offer, intent, rounds_used: 0, allowed_check_ins: allowedCheckIns })

  // When a caller's own package is refused, tell them what would have been
  // legal. Publishing the floor for a package they already named gives away
  // nothing the guard would not have enforced anyway, and makes the endpoint
  // usable rather than merely correct.
  const floor = verdict.authorized ? null : safeFloor(merchant, offer)

  return agentJson(
    {
      quoted: verdict.authorized,
      composed_by: composedBy,
      merchant: { id: merchant.id, slug: merchant.slug, name: merchant.name },
      offer: {
        id: offer.id,
        bundle: offer.bundle,
        rationale: offer.rationale,
        check_in: offer.quote.check_in,
        check_out: offer.quote.check_out,
        weekend_nights: offer.quote.weekend_nights,
        expires_at: offer.expires_at,
        price: {
          list: offer.quote.list_price,
          discount_pct: offer.quote.discount_pct,
          discount_amount: offer.quote.discount_amount,
          total: offer.quote.total_price,
          currency: 'INR'
        },
        lines: offer.quote.lines.map(l => ({
          label: l.label,
          amount: l.amount,
          quantity: l.quantity
        })),
        delivers: offer.quote.attributes
      },
      guard: {
        authorized: verdict.authorized,
        checks: verdict.checks.map(c => ({ id: c.id, label: c.label, passed: c.passed, detail: c.detail })),
        violations: verdict.violations.map(v => ({ id: v.id, detail: v.detail, expected: v.expected, actual: v.actual }))
      },
      lowest_legal_price_for_this_package: floor,
      note: 'Margin floor and discount ceiling are enforced server-side and are not published. A rejected quote is refused, not repriced.'
    },
    { status: verdict.authorized ? 200 : 409 }
  , request)
}

const safeFloor = (merchant: Parameters<typeof minimumAllowedPrice>[0], offer: Offer) => {
  try {
    const { floor, binding } = minimumAllowedPrice(merchant, offer.bundle, offer.quote.nights, offer.quote.travelers)

    return { amount: floor, binding_constraint: binding, currency: 'INR' }
  } catch {
    return null
  }
}

export const OPTIONS = () => new Response(null, { status: 204, headers: CORS })
