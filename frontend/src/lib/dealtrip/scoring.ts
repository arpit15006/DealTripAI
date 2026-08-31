/**
 * Deal Utility Score — deterministic, weighted, and fully itemised.
 *
 * The cheapest deal is usually not the best deal, so ranking has to be explicit
 * about the trade it is making. Nothing here is learned or model-generated: the
 * same offers against the same intent always produce the same ranking, and every
 * point awarded carries the sentence that justifies it.
 *
 * Hard constraints are a gate, not a term in the sum. An offer that misses a
 * must-have is ineligible at any price.
 */
import { findRoom, formatINR } from './pricing'
import { ATTRIBUTE_LABELS } from './types'

import type { Attribute, DealScore, Merchant, Offer, RankedOffer, ScoreComponent, TravelIntent, GuardVerdict } from './types'

/** Weights sum to 100 in every profile; only the emphasis moves. */
const WEIGHTS: Record<TravelIntent['priority'], Record<ScoreComponent['id'], number>> = {
  lowest_price: { budget_fit: 40, requirements: 25, preferences: 15, package_value: 10, negotiation_gain: 10 },
  best_value: { budget_fit: 25, requirements: 30, preferences: 20, package_value: 15, negotiation_gain: 10 },
  best_experience: { budget_fit: 15, requirements: 30, preferences: 25, package_value: 20, negotiation_gain: 10 }
}

/** Shaving this much off the opening offer earns full marks on negotiation. */
const FULL_CREDIT_NEGOTIATION_RATIO = 0.1
/** An offer that needed no fixing still banks this share of the negotiation term. */
const CLEAN_OPENING_CREDIT = 0.5
/** Inclusions beyond the ask needed to max out the package term. */
const FULL_CREDIT_EXTRAS = 10

/**
 * Price band the budget term is scored against.
 *
 * Absolute savings-against-budget cannot separate a shortlist where every offer
 * lands within a few percent of the cap — and that is the normal case, because
 * revenue-seeking merchants all price toward the traveller's ceiling. So the
 * budget term is scored across the spread of the shortlist itself: the cheapest
 * eligible offer takes the term in full, the dearest takes none, the rest sit
 * pro-rata. Still deterministic — the same shortlist always yields the same
 * ranking — and it states its comparison out loud rather than hiding a constant.
 */
export interface PriceBand {
  min: number
  max: number
}

export const priceBandOf = (prices: number[]): PriceBand | null => {
  if (prices.length === 0) return null

  return { min: Math.min(...prices), max: Math.max(...prices) }
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const pts = (weight: number, ratio: number) => Math.round(weight * clamp01(ratio) * 10) / 10

interface ScoreInput {
  merchant: Merchant
  offer: Offer
  intent: TravelIntent
  /** This merchant's round-0 offer, for measuring what negotiation actually won. */
  opening_offer: Offer | null
  verdict: GuardVerdict
  /** Spread of the eligible shortlist. Null when this offer stands alone. */
  price_band: PriceBand | null
}

export const scoreOffer = ({ merchant, offer, intent, opening_offer, verdict, price_band }: ScoreInput): DealScore => {
  const weights = WEIGHTS[intent.priority]
  const { quote } = offer
  const delivered = new Set<Attribute>(quote.attributes)

  const entries = Object.entries(intent.requirements) as [Attribute, string][]
  const required = entries.filter(([, s]) => s === 'required').map(([a]) => a)
  const preferred = entries.filter(([, s]) => s === 'preferred').map(([a]) => a)
  const avoided = entries.filter(([, s]) => s === 'avoid').map(([a]) => a)

  /* --- Gate: hard constraints ------------------------------------------- */
  const missingRequired = required.filter(a => !delivered.has(a))
  const presentAvoided = avoided.filter(a => delivered.has(a))
  const overHardBudget = intent.budget.type === 'hard_constraint' && quote.total_price > intent.budget.max

  let ineligibleReason: string | null = null

  if (!verdict.authorized) {
    ineligibleReason = `Blocked by the Commerce Guard: ${verdict.violations.map(v => v.label.toLowerCase()).join(', ')}.`
  } else if (missingRequired.length) {
    ineligibleReason = `Missing must-have${missingRequired.length === 1 ? '' : 's'}: ${missingRequired.map(a => ATTRIBUTE_LABELS[a]).join(', ')}.`
  } else if (presentAvoided.length) {
    ineligibleReason = `Includes ruled-out ${presentAvoided.map(a => ATTRIBUTE_LABELS[a]).join(', ')}.`
  } else if (overHardBudget) {
    ineligibleReason = `${formatINR(quote.total_price)} is over the hard budget of ${formatINR(intent.budget.max)}.`
  }

  /* --- 1. Budget fit, scored across the shortlist's own spread ----------- */
  const savings = intent.budget.max - quote.total_price
  const spread = price_band ? price_band.max - price_band.min : 0

  let budgetRatio: number
  let budgetDetail: string

  if (savings < 0) {
    budgetRatio = 0
    budgetDetail = `${formatINR(quote.total_price)} is ${formatINR(-savings)} over the ${formatINR(intent.budget.max)} budget.`
  } else if (!price_band || spread <= 0) {
    // Nothing to compare against: fitting the budget at all takes the term.
    budgetRatio = 1
    budgetDetail = `${formatINR(quote.total_price)} fits the ${formatINR(intent.budget.max)} budget with ${formatINR(savings)} to spare; no cheaper eligible offer to compare against.`
  } else {
    budgetRatio = (price_band.max - quote.total_price) / spread
    budgetDetail =
      `${formatINR(quote.total_price)} against a shortlist spanning ${formatINR(price_band.min)}–${formatINR(price_band.max)}` +
      (quote.total_price === price_band.min
        ? ' — the cheapest offer that clears every hard constraint.'
        : quote.total_price === price_band.max
          ? ' — the dearest of the eligible offers.'
          : `, i.e. ${formatINR(price_band.max - quote.total_price)} below the dearest eligible offer.`)
  }

  const budgetPoints = pts(weights.budget_fit, budgetRatio)

  /* --- 2. Requirements (binary: they are must-haves) --------------------- */
  const requirementsMet = missingRequired.length === 0 && presentAvoided.length === 0
  const requirementPoints = requirementsMet ? weights.requirements : 0

  const requirementDetail = required.length
    ? requirementsMet
      ? `All ${required.length} must-have${required.length === 1 ? '' : 's'} delivered: ${required.map(a => ATTRIBUTE_LABELS[a]).join(', ')}.`
      : `Missing: ${missingRequired.map(a => ATTRIBUTE_LABELS[a]).join(', ')}.`
    : 'No must-haves declared, so this term is awarded in full.'

  /* --- 3. Preferences (partial credit) ----------------------------------- */
  const metPreferred = preferred.filter(a => delivered.has(a))
  const preferenceRatio = preferred.length === 0 ? 1 : metPreferred.length / preferred.length
  const preferencePoints = pts(weights.preferences, preferenceRatio)

  const preferenceDetail = preferred.length
    ? `${metPreferred.length} of ${preferred.length} nice-to-haves included${metPreferred.length ? `: ${metPreferred.map(a => ATTRIBUTE_LABELS[a]).join(', ')}` : ''}${
        metPreferred.length < preferred.length
          ? `. Not included: ${preferred.filter(a => !delivered.has(a)).map(a => ATTRIBUTE_LABELS[a]).join(', ')}.`
          : '.'
      }`
    : 'No preferences declared, so this term is awarded in full.'

  /* --- 4. Package value: room quality + genuine extras ------------------- */
  const room = findRoom(merchant, offer.bundle.room_id)
  const tierRatio = room ? room.tier / 5 : 0
  const askedFor = new Set<Attribute>([...required, ...preferred])
  const extras = quote.attributes.filter(a => !askedFor.has(a))
  const extrasRatio = clamp01(extras.length / FULL_CREDIT_EXTRAS)
  const packagePoints = pts(weights.package_value, tierRatio * 0.4 + extrasRatio * 0.6)

  const packageDetail = `${room ? `${room.name} (tier ${room.tier}/5)` : 'Room'} plus ${extras.length} inclusion${extras.length === 1 ? '' : 's'} beyond what was asked for${
    extras.length ? `: ${extras.slice(0, 4).map(a => ATTRIBUTE_LABELS[a]).join(', ')}${extras.length > 4 ? '…' : ''}` : ''
  }.`

  /* --- 5. Negotiation gain ----------------------------------------------- */
  let negotiationRatio = CLEAN_OPENING_CREDIT
  let negotiationDetail = 'Opening offer needed no revision; partial credit.'

  if (opening_offer && opening_offer.id !== offer.id) {
    const improvement = opening_offer.quote.total_price - quote.total_price
    const improvementRatio =
      opening_offer.quote.total_price > 0 ? improvement / opening_offer.quote.total_price : 0

    negotiationRatio = Math.max(0, improvementRatio / FULL_CREDIT_NEGOTIATION_RATIO)
    negotiationDetail =
      improvement > 0
        ? `Negotiation moved the price from ${formatINR(opening_offer.quote.total_price)} to ${formatINR(quote.total_price)}, a saving of ${formatINR(improvement)} (${(improvementRatio * 100).toFixed(1)}%).`
        : `Revised package is not cheaper than the ${formatINR(opening_offer.quote.total_price)} opening offer.`
  }

  const negotiationPoints = pts(weights.negotiation_gain, negotiationRatio)

  const components: ScoreComponent[] = [
    { id: 'budget_fit', label: 'Budget fit', points: budgetPoints, max_points: weights.budget_fit, detail: budgetDetail },
    { id: 'requirements', label: 'Must-haves', points: requirementPoints, max_points: weights.requirements, detail: requirementDetail },
    { id: 'preferences', label: 'Preferences', points: preferencePoints, max_points: weights.preferences, detail: preferenceDetail },
    { id: 'package_value', label: 'Package value', points: packagePoints, max_points: weights.package_value, detail: packageDetail },
    { id: 'negotiation_gain', label: 'Negotiated gain', points: negotiationPoints, max_points: weights.negotiation_gain, detail: negotiationDetail }
  ]

  const total = Math.round(components.reduce((sum, c) => sum + c.points, 0) * 10) / 10

  return {
    total,
    components,
    eligible: ineligibleReason === null,
    ineligible_reason: ineligibleReason
  }
}

/**
 * Rank eligible offers first (by score), then ineligible ones so the user can
 * still see what was rejected and why. Ties break toward the lower price, then
 * the higher merchant rating — both deterministic, so ranking is reproducible.
 */
export const rankOffers = (candidates: Omit<RankedOffer, 'rank'>[]): RankedOffer[] =>
  [...candidates]
    .sort((a, b) => {
      if (a.score.eligible !== b.score.eligible) return a.score.eligible ? -1 : 1
      if (b.score.total !== a.score.total) return b.score.total - a.score.total
      if (a.offer.quote.total_price !== b.offer.quote.total_price)
        return a.offer.quote.total_price - b.offer.quote.total_price

      return b.merchant.rating - a.merchant.rating
    })
    .map((c, i) => ({ ...c, rank: i + 1 }))

/** Plain-language account of why the winner beat the runner-up. */
export const explainWinner = (ranked: RankedOffer[]): string => {
  const [winner, runnerUp] = ranked.filter(r => r.score.eligible)

  if (!winner) return 'No offer cleared every hard constraint, so nothing was recommended.'
  if (!runnerUp)
    return `${winner.merchant.name} was the only offer to clear every hard constraint at ${formatINR(winner.offer.quote.total_price)}.`

  const gaps = winner.score.components
    .map(c => {
      const other = runnerUp.score.components.find(o => o.id === c.id)

      return { id: c.id, label: c.label, delta: c.points - (other?.points ?? 0) }
    })
    .filter(g => Math.abs(g.delta) >= 0.5)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

  const wins = gaps.filter(g => g.delta > 0).slice(0, 2)
  const losses = gaps.filter(g => g.delta < 0).slice(0, 1)

  const winClause = wins.length
    ? `it wins on ${wins.map(w => `${w.label.toLowerCase()} (+${w.delta.toFixed(1)})`).join(' and ')}`
    : 'the two are close on every term'

  const lossClause = losses.length
    ? `, trading away ${losses.map(l => `${l.label.toLowerCase()} (${l.delta.toFixed(1)})`).join(' and ')}`
    : ''

  return `${winner.merchant.name} scores ${winner.score.total} against ${runnerUp.merchant.name}'s ${runnerUp.score.total}: ${winClause}${lossClause}.`
}
