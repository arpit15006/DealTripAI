/**
 * Revenue simulator.
 *
 * ⚠ Everything this produces is a SYNTHETIC EVALUATION on synthetic inventory.
 * It is not a measurement of real merchant performance and must never be
 * presented as one. What it can honestly show is the mechanism: given the same
 * synthetic demand and the same catalogs, what does structured negotiation do
 * that a static price list does not?
 *
 * The baseline is deliberately not a strawman. "Static selling" here means what
 * a competent booking site already does: the traveller sees every room, ticks
 * the add-ons that satisfy their must-haves, pays the published price, and
 * books the best package that fits their budget. No discount, no substitution,
 * no negotiation. If nothing fits, the sale is simply lost — which is the
 * baseline's real cost, and the thing negotiation is supposed to recover.
 *
 * Runs entirely on the deterministic planner (use_llm: false), so a run is
 * reproducible from its seed and costs nothing in tokens.
 */
import { guardOffer } from './commerce-guard'
import { resolveCheckIns } from './dates'
import { runNegotiation } from './orchestrator'
import { computeQuote } from './pricing'
import { priceBandOf, scoreOffer } from './scoring'
import { createMemoryStore } from './store'

import type { Attribute, Bundle, Merchant, Negotiation, Quote, RequirementStrength, TravelIntent } from './types'

/* ------------------------------------------------------------------ *
 * Seeded RNG — a run is reproducible from its seed.
 * ------------------------------------------------------------------ */
const mulberry32 = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0

  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)

  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const pick = <T,>(rng: () => number, items: T[]): T => items[Math.floor(rng() * items.length)]
const between = (rng: () => number, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))

/* ------------------------------------------------------------------ *
 * Synthetic demand
 * ------------------------------------------------------------------ */
const REQUIREMENT_POOL: Attribute[] = [
  'beachfront', 'breakfast', 'sea_view', 'pool', 'airport_transfer',
  'spa', 'quiet', 'romantic', 'family_friendly', 'free_cancellation'
]

export const generateIntents = (count: number, destination: string, seed: number): TravelIntent[] => {
  const rng = mulberry32(seed)
  const intents: TravelIntent[] = []

  for (let i = 0; i < count; i++) {
    const travelers = pick(rng, [2, 2, 2, 3, 4])
    const nights = pick(rng, [2, 3, 3, 4, 5])

    // Budget scales with the trip so demand is not systematically unaffordable.
    const perNightPerHead = between(rng, 3800, 9500)
    const budget = Math.round((perNightPerHead * nights * Math.max(2, travelers)) / 500) * 500

    const requirements: Partial<Record<Attribute, RequirementStrength>> = {}
    const requiredCount = pick(rng, [0, 1, 1, 1, 2])
    const preferredCount = pick(rng, [0, 1, 1, 2, 2])
    const pool = [...REQUIREMENT_POOL].sort(() => rng() - 0.5)

    pool.slice(0, requiredCount).forEach(a => (requirements[a] = 'required'))
    pool.slice(requiredCount, requiredCount + preferredCount).forEach(a => (requirements[a] = 'preferred'))

    intents.push({
      destination,
      travelers,
      duration_nights: nights,
      budget: {
        max: budget,
        currency: 'INR',
        type: rng() < 0.7 ? 'hard_constraint' : 'soft_target'
      },
      requirements,
      date_flexibility_days: pick(rng, [0, 0, 1, 2, 3]),
      check_in: null,
      priority: pick(rng, ['best_value', 'best_value', 'lowest_price', 'best_experience']),
      notes: ''
    })
  }

  return intents
}

/* ------------------------------------------------------------------ *
 * Baseline: static selling
 * ------------------------------------------------------------------ */
interface Sale {
  merchant_id: string
  merchant_name: string
  price: number
  cost: number
  margin: number
  score: number
}

const requirementsOf = (intent: TravelIntent, strength: RequirementStrength): Attribute[] =>
  (Object.entries(intent.requirements) as [Attribute, RequirementStrength][])
    .filter(([, s]) => s === strength)
    .map(([a]) => a)

/**
 * What the traveller would buy off a normal booking page: published prices, the
 * add-ons needed to meet their must-haves, nothing negotiated.
 */
const staticSale = (merchants: Merchant[], intent: TravelIntent): Sale | null => {
  const staticCheckIn = resolveCheckIns(intent.check_in, 0)[0] ?? new Date().toISOString().slice(0, 10)
  const required = requirementsOf(intent, 'required')
  const preferred = requirementsOf(intent, 'preferred')
  const avoid = new Set(requirementsOf(intent, 'avoid'))
  const nights = intent.duration_nights
  const travelers = intent.travelers

  const options: { merchant: Merchant; bundle: Bundle; quote: Quote }[] = []

  for (const merchant of merchants) {
    for (const room of merchant.rooms) {
      if (room.inventory_available <= 0 || room.max_occupancy < travelers) continue

      const delivered = new Set<Attribute>([...merchant.attributes, ...room.attributes])
      const chosen = [...merchant.policy.locked_addons]
      const usedGroups = new Set<string>()

      // Tick the cheapest add-on that supplies each unmet must-have, then each
      // unmet nice-to-have — exactly what a person does on a booking page.
      for (const wanted of [...required, ...preferred]) {
        if (delivered.has(wanted)) continue

        const candidates = merchant.addons
          .filter(a => a.attributes.includes(wanted))
          .filter(a => !a.attributes.some(x => avoid.has(x)))
          .filter(a => !a.group || !usedGroups.has(a.group))
          .sort(
            (x, y) =>
              x.price * (x.per_night ? nights : 1) * (x.per_person ? travelers : 1) -
              y.price * (y.per_night ? nights : 1) * (y.per_person ? travelers : 1)
          )

        const choice = candidates[0]

        if (!choice) continue

        chosen.push(choice.id)
        if (choice.group) usedGroups.add(choice.group)
        choice.attributes.forEach(a => delivered.add(a))
      }

      if (!required.every(a => delivered.has(a))) continue
      if ([...avoid].some(a => delivered.has(a))) continue

      // The static shelf shows one published date — a booking page does not
      // shop the calendar for you. That difference is part of what negotiation
      // is being measured against, so it must not be quietly equalised.
      const bundle: Bundle = {
        room_id: room.id,
        addon_ids: [...new Set(chosen)],
        discount_pct: 0,
        check_in: staticCheckIn
      }

      try {
        const quote = computeQuote(merchant, bundle, nights, travelers)

        if (quote.total_price > intent.budget.max) continue
        options.push({ merchant, bundle, quote })
      } catch {
        continue
      }
    }
  }

  if (options.length === 0) return null

  // Rank with the same scorer the agentic path uses, so the comparison is
  // like-for-like and the baseline is not handicapped by a different yardstick.
  const band = priceBandOf(options.map(o => o.quote.total_price))
  const now = new Date()

  const scored = options.map(o => {
    const offer = {
      id: `static_${o.merchant.id}_${o.bundle.room_id}`,
      negotiation_id: 'static',
      merchant_id: o.merchant.id,
      round: 0,
      bundle: o.bundle,
      quote: o.quote,
      rationale: '',
      changes_from_previous: [],
      status: 'authorized' as const,
      created_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 3600_000).toISOString()
    }

    const verdict = guardOffer({ merchant: o.merchant, offer, intent, rounds_used: 0 })

    return {
      option: o,
      verdict,
      score: scoreOffer({
        merchant: o.merchant,
        offer,
        intent,
        opening_offer: null,
        verdict,
        price_band: band
      })
    }
  })

  const eligible = scored.filter(s => s.score.eligible).sort((a, b) => b.score.total - a.score.total)
  const best = eligible[0]

  if (!best) return null

  return {
    merchant_id: best.option.merchant.id,
    merchant_name: best.option.merchant.name,
    price: best.option.quote.total_price,
    cost: best.option.quote.total_cost,
    margin: best.option.quote.margin_amount,
    score: best.score.total
  }
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */
export interface SimulationConfig {
  intents: number
  destination: string
  seed: number
}

/** One traveller's outcome under both arms, emitted as the run proceeds. */
export interface SimulationTick {
  index: number
  total: number
  travelers: number
  nights: number
  budget: number

  /** What the static shelf sold them, if anything. */
  static_sale: { merchant: string; price: number } | null

  /** What the deal desk sold them, if anything. */
  agentic_sale: { merchant: string; price: number; rounds: number } | null
  counters: number
  blocked: number

  /** Running totals, so a viewer never has to add up the stream themselves. */
  running: { static_revenue: number; agentic_revenue: number; static_bookings: number; agentic_bookings: number }
}

export type ProgressSink = (tick: SimulationTick) => void | Promise<void>

export interface ArmMetrics {
  bookings: number
  conversion_rate: number
  revenue: number
  cost: number
  margin: number
  margin_pct: number
  aov: number
  revenue_per_intent: number
  mean_score: number
}

export interface SimulationResult {
  config: SimulationConfig
  intents: number
  static_selling: ArmMetrics
  agentic: ArmMetrics
  delta: {
    revenue: number
    revenue_pct: number
    bookings: number
    conversion_points: number
    aov: number
    margin: number
    margin_pct_points: number
  }
  negotiation: {
    total_counters: number
    offers_blocked_by_guard: number
    sales_recovered_from_no_deal: number
    mean_rounds_per_booking: number
  }
  by_merchant: { merchant: string; static_bookings: number; agentic_bookings: number; agentic_revenue: number }[]
  disclosure: string
}

const emptyArm = (): ArmMetrics => ({
  bookings: 0,
  conversion_rate: 0,
  revenue: 0,
  cost: 0,
  margin: 0,
  margin_pct: 0,
  aov: 0,
  revenue_per_intent: 0,
  mean_score: 0
})

const finalize = (arm: ArmMetrics, intents: number, scoreSum: number): ArmMetrics => ({
  ...arm,
  conversion_rate: intents ? round(arm.bookings / intents, 4) : 0,
  margin_pct: arm.revenue ? round((arm.margin / arm.revenue) * 100, 2) : 0,
  aov: arm.bookings ? Math.round(arm.revenue / arm.bookings) : 0,
  revenue_per_intent: intents ? Math.round(arm.revenue / intents) : 0,
  mean_score: arm.bookings ? round(scoreSum / arm.bookings, 1) : 0
})

const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp

export const runSimulation = async (
  merchants: Merchant[],
  config: SimulationConfig,
  onProgress?: ProgressSink
): Promise<SimulationResult> => {
  const intents = generateIntents(config.intents, config.destination, config.seed)
  const store = await createMemoryStore()

  const staticArm = emptyArm()
  const agenticArm = emptyArm()

  let staticScoreSum = 0
  let agenticScoreSum = 0
  let totalCounters = 0
  let blocked = 0
  let recovered = 0
  let roundsOnBookings = 0

  const perMerchant = new Map<string, { static_bookings: number; agentic_bookings: number; agentic_revenue: number }>()

  for (const merchant of merchants) perMerchant.set(merchant.name, { static_bookings: 0, agentic_bookings: 0, agentic_revenue: 0 })

  // Both arms must shop the same shelf. The orchestrator filters by destination
  // during discovery, so the baseline has to as well — otherwise the static arm
  // "books" a Manali lodge for a Goa trip and the comparison is meaningless.
  const inDestination = merchants.filter(
    m => m.destination.toLowerCase() === config.destination.toLowerCase()
  )

  for (const [index, intent] of intents.entries()) {
    /* --- baseline --- */
    const baseline = staticSale(inDestination, intent)

    if (baseline) {
      staticArm.bookings += 1
      staticArm.revenue += baseline.price
      staticArm.cost += baseline.cost
      staticArm.margin += baseline.margin
      staticScoreSum += baseline.score
      perMerchant.get(baseline.merchant_name)!.static_bookings += 1
    }

    /* --- agentic --- */
    const negotiation: Negotiation = {
      id: `sim_${config.seed}_${index}`,
      intent,
      raw_request: '(synthetic)',
      status: 'negotiating',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      selected_offer_id: null
    }

    await store.createNegotiation(negotiation)

    const outcome = await runNegotiation({
      negotiation,
      merchants,
      store,
      use_llm: false
    })

    const winner = outcome.ranked.find(r => r.score.eligible)

    const events = await store.listAudit(negotiation.id)

    totalCounters += events.filter(e => e.action === 'counter_request').length
    blocked += events.filter(e => e.action === 'offer_rejected').length

    if (winner) {
      agenticArm.bookings += 1
      agenticArm.revenue += winner.offer.quote.total_price
      agenticArm.cost += winner.offer.quote.total_cost
      agenticArm.margin += winner.offer.quote.margin_amount
      agenticScoreSum += winner.score.total
      roundsOnBookings += winner.offer.round
      perMerchant.get(winner.merchant.name)!.agentic_bookings += 1
      perMerchant.get(winner.merchant.name)!.agentic_revenue += winner.offer.quote.total_price

      if (!baseline) recovered += 1
    }

    await onProgress?.({
      index: index + 1,
      total: intents.length,
      travelers: intent.travelers,
      nights: intent.duration_nights,
      budget: intent.budget.max,
      static_sale: baseline ? { merchant: baseline.merchant_name, price: baseline.price } : null,
      agentic_sale: winner
        ? { merchant: winner.merchant.name, price: winner.offer.quote.total_price, rounds: winner.offer.round }
        : null,
      counters: events.filter(e => e.action === 'counter_request').length,
      blocked: events.filter(e => e.action === 'offer_rejected').length,
      running: {
        static_revenue: staticArm.revenue,
        agentic_revenue: agenticArm.revenue,
        static_bookings: staticArm.bookings,
        agentic_bookings: agenticArm.bookings
      }
    })
  }

  const staticFinal = finalize(staticArm, intents.length, staticScoreSum)
  const agenticFinal = finalize(agenticArm, intents.length, agenticScoreSum)

  return {
    config,
    intents: intents.length,
    static_selling: staticFinal,
    agentic: agenticFinal,
    delta: {
      revenue: agenticFinal.revenue - staticFinal.revenue,
      revenue_pct: staticFinal.revenue ? round(((agenticFinal.revenue - staticFinal.revenue) / staticFinal.revenue) * 100, 2) : 0,
      bookings: agenticFinal.bookings - staticFinal.bookings,
      conversion_points: round((agenticFinal.conversion_rate - staticFinal.conversion_rate) * 100, 2),
      aov: agenticFinal.aov - staticFinal.aov,
      margin: agenticFinal.margin - staticFinal.margin,
      margin_pct_points: round(agenticFinal.margin_pct - staticFinal.margin_pct, 2)
    },
    negotiation: {
      total_counters: totalCounters,
      offers_blocked_by_guard: blocked,
      sales_recovered_from_no_deal: recovered,
      mean_rounds_per_booking: agenticFinal.bookings ? round(roundsOnBookings / agenticFinal.bookings, 2) : 0
    },
    by_merchant: [...perMerchant.entries()]
      .map(([merchant, v]) => ({ merchant, ...v }))
      .sort((a, b) => b.agentic_revenue - a.agentic_revenue),
    disclosure:
      'Synthetic evaluation on synthetic inventory and synthetic demand. Not a measurement of real merchant performance. Both arms are scored with the same ranking function and the same catalogs; the only difference is whether structured negotiation is allowed.'
  }
}
