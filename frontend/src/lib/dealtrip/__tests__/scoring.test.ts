import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { guardOffer } from '../commerce-guard'
import { computeQuote } from '../pricing'
import { priceBandOf, rankOffers, scoreOffer } from '../scoring'
import { SEED_MERCHANTS } from '../seed'

import type { Bundle, Merchant, Offer, TravelIntent } from '../types'

const oceanvista = SEED_MERCHANTS.find(m => m.slug === 'oceanvista') as Merchant
const CHECK_IN = '2026-01-05'

const intent: TravelIntent = {
  destination: 'Goa',
  travelers: 2,
  duration_nights: 3,
  budget: { max: 60_000, currency: 'INR', type: 'hard_constraint' },
  requirements: { beachfront: 'required', breakfast: 'preferred' },
  date_flexibility_days: 0,
  check_in: CHECK_IN,
  priority: 'best_value',
  notes: ''
}

const offerFor = (bundle: Bundle, id = 'off_a'): Offer => ({
  id,
  negotiation_id: 'neg',
  merchant_id: oceanvista.id,
  round: 0,
  bundle,
  quote: computeQuote(oceanvista, bundle, 3, 2),
  rationale: '',
  changes_from_previous: [],
  status: 'authorized',
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 20 * 60_000).toISOString()
})

const scoreOf = (offer: Offer, band = priceBandOf([offer.quote.total_price])) =>
  scoreOffer({
    merchant: oceanvista,
    offer,
    intent,
    opening_offer: null,
    verdict: guardOffer({ merchant: oceanvista, offer, intent, rounds_used: 0 }),
    price_band: band
  })

const withBreakfast: Bundle = { room_id: 'ov-standard-beach', addon_ids: ['ov-breakfast'], discount_pct: 0, check_in: CHECK_IN }
const withoutBreakfast: Bundle = { room_id: 'ov-standard-beach', addon_ids: [], discount_pct: 0, check_in: CHECK_IN }

describe('deal scoring — hard constraints gate, they do not merely subtract', () => {
  it('marks an offer ineligible when a must-have is missing, at any price', () => {
    const strict: TravelIntent = { ...intent, requirements: { kitchenette: 'required' } }
    const offer = offerFor(withBreakfast)

    const score = scoreOffer({
      merchant: oceanvista,
      offer,
      intent: strict,
      opening_offer: null,
      verdict: guardOffer({ merchant: oceanvista, offer, intent: strict, rounds_used: 0 }),
      price_band: priceBandOf([offer.quote.total_price])
    })

    assert.equal(score.eligible, false)
    assert.ok(score.ineligible_reason)
  })

  it('rewards a met preference over an unmet one at the same price band', () => {
    const a = offerFor(withBreakfast, 'a')
    const b = offerFor(withoutBreakfast, 'b')
    const band = priceBandOf([a.quote.total_price, b.quote.total_price])

    const withPref = scoreOf(a, band).components.find(c => c.id === 'preferences')!
    const withoutPref = scoreOf(b, band).components.find(c => c.id === 'preferences')!

    assert.ok(withPref.points > withoutPref.points)
  })

  it('scores the budget term across the shortlist, not against an absolute rule', () => {
    const cheap = offerFor(withoutBreakfast, 'cheap')
    const dear = offerFor(withBreakfast, 'dear')
    const band = priceBandOf([cheap.quote.total_price, dear.quote.total_price])

    assert.ok(cheap.quote.total_price < dear.quote.total_price)

    const cheapBudget = scoreOf(cheap, band).components.find(c => c.id === 'budget_fit')!
    const dearBudget = scoreOf(dear, band).components.find(c => c.id === 'budget_fit')!

    // Cheapest eligible offer takes the term in full; the dearest takes none.
    assert.equal(cheapBudget.points, cheapBudget.max_points)
    assert.equal(dearBudget.points, 0)
  })

  it('credits a larger negotiated saving more than a smaller one', () => {
    const opening = offerFor(withBreakfast, 'opening')

    const gainAt = (discount: number) => {
      const revised = offerFor({ ...withBreakfast, discount_pct: discount }, `r${discount}`)

      return scoreOffer({
        merchant: oceanvista,
        offer: revised,
        intent,
        opening_offer: opening,
        verdict: guardOffer({ merchant: oceanvista, offer: revised, intent, rounds_used: 0 }),
        price_band: priceBandOf([revised.quote.total_price])
      }).components.find(c => c.id === 'negotiation_gain')!.points
    }

    assert.ok(gainAt(5) > gainAt(1))

    // A merchant whose opening needed no fixing still banks partial credit —
    // getting it right first time is not a failure to negotiate.
    const clean = scoreOf(opening).components.find(c => c.id === 'negotiation_gain')!

    assert.ok(clean.points > 0)
  })
})

describe('ranking is deterministic and puts eligible offers first', () => {
  const rows = (ids: string[]) =>
    ids.map(id => {
      const offer = offerFor(id === 'no-breakfast' ? withoutBreakfast : withBreakfast, id)

      return {
        offer,
        merchant: { id: oceanvista.id, name: oceanvista.name, slug: oceanvista.slug, rating: oceanvista.rating, tagline: oceanvista.tagline },
        verdict: guardOffer({ merchant: oceanvista, offer, intent, rounds_used: 0 }),
        score: scoreOf(offer)
      }
    })

  it('produces the same order for the same input', () => {
    const input = rows(['a', 'b', 'no-breakfast'])

    assert.deepEqual(
      rankOffers(input).map(r => r.offer.id),
      rankOffers([...input].reverse()).map(r => r.offer.id)
    )
  })

  it('never ranks an ineligible offer above an eligible one', () => {
    const ranked = rankOffers(rows(['a', 'b']))
    const firstIneligible = ranked.findIndex(r => !r.score.eligible)

    if (firstIneligible !== -1)
      assert.ok(ranked.slice(firstIneligible).every(r => !r.score.eligible))
  })
})
