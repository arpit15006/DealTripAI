import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { guardOffer, guardPayment } from '../commerce-guard'
import { computeQuote } from '../pricing'
import { SEED_MERCHANTS } from '../seed'

import type { Bundle, Merchant, Offer, TravelIntent } from '../types'

const oceanvista = SEED_MERCHANTS.find(m => m.slug === 'oceanvista') as Merchant
const CHECK_IN = '2026-01-05' // a Monday
const WINDOW = ['2026-01-04', '2026-01-05', '2026-01-06']

const intent: TravelIntent = {
  destination: 'Goa',
  travelers: 2,
  rooms: null,
  duration_nights: 3,
  budget: { max: 60_000, currency: 'INR', type: 'hard_constraint' },
  requirements: { beachfront: 'required', breakfast: 'preferred' },
  date_flexibility_days: 1,
  check_in: CHECK_IN,
  priority: 'best_value',
  notes: ''
}

const offerFor = (bundle: Bundle, overrides: Partial<Offer> = {}): Offer => {
  const quote = computeQuote(oceanvista, bundle, 3, 2)

  return {
    id: 'off_test',
    negotiation_id: 'neg_test',
    merchant_id: oceanvista.id,
    round: 0,
    bundle,
    quote,
    rationale: '',
    changes_from_previous: [],
    status: 'proposed',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 20 * 60_000).toISOString(),
    ...overrides
  }
}

/** A package that satisfies every constraint: beachfront room, breakfast, in budget. */
const legal: Bundle = {
  room_id: 'ov-standard-beach',
  addon_ids: ['ov-breakfast'],
  discount_pct: 0,
  check_in: CHECK_IN, room_count: 1 }

const check = (offer: Offer, id: string) =>
  guardOffer({ merchant: oceanvista, offer, intent, rounds_used: 0, allowed_check_ins: WINDOW }).checks.find(
    c => c.id === id
  )!

describe('Commerce Guard. Authorizes what is legal', () => {
  it('passes every check on a compliant offer', () => {
    const verdict = guardOffer({
      merchant: oceanvista,
      offer: offerFor(legal),
      intent,
      rounds_used: 0,
      allowed_check_ins: WINDOW
    })

    assert.equal(verdict.authorized, true, verdict.violations.map(v => v.detail).join('; '))
    assert.equal(verdict.violations.length, 0)
    assert.ok(verdict.checks.length >= 12)
  })
})

describe('Commerce Guard. Refuses what is not', () => {
  it('blocks a discount beyond the merchant ceiling', () => {
    const offer = offerFor({ ...legal, discount_pct: 40 })
    const verdict = guardOffer({ merchant: oceanvista, offer, intent, rounds_used: 0, allowed_check_ins: WINDOW })

    assert.equal(verdict.authorized, false)
    assert.equal(check(offer, 'discount_ceiling').passed, false)
  })

  it('blocks an offer that would breach the margin floor', () => {
    const offer = offerFor({ ...legal, discount_pct: 40 })

    assert.equal(check(offer, 'margin_floor').passed, false)
  })

  /*
   * The load-bearing test.
   *
   * An agent (or anything downstream of one) hands over a quote claiming a
   * price the catalog does not support. The guard recomputes independently and
   * must notice, because "the model cannot invent a price" is only true if
   * something actually checks.
   */
  it('catches a tampered price by recomputing from the catalog', () => {
    const honest = offerFor(legal)
    const tampered = offerFor(legal)

    tampered.quote = { ...tampered.quote, total_price: 1, discount_amount: honest.quote.list_price - 1 }

    const verdict = guardOffer({
      merchant: oceanvista,
      offer: tampered,
      intent,
      rounds_used: 0,
      allowed_check_ins: WINDOW
    })

    assert.equal(verdict.authorized, false)
    assert.equal(verdict.checks.find(c => c.id === 'price_integrity')!.passed, false)
  })

  it('refuses a package naming inventory that does not exist', () => {
    const offer = offerFor(legal)

    offer.bundle = { ...offer.bundle, room_id: 'ov-presidential-penthouse' }

    const verdict = guardOffer({ merchant: oceanvista, offer, intent, rounds_used: 0, allowed_check_ins: WINDOW })

    assert.equal(verdict.authorized, false)
    assert.equal(verdict.checks.find(c => c.id === 'catalog_integrity')!.passed, false)
  })

  it('blocks a stay outside the dates the traveller accepted', () => {
    const offer = offerFor({ ...legal, check_in: '2026-02-20' })
    const verdict = guardOffer({ merchant: oceanvista, offer, intent, rounds_used: 0, allowed_check_ins: WINDOW })

    assert.equal(verdict.authorized, false)
    assert.equal(verdict.checks.find(c => c.id === 'check_in_window')!.passed, false)
  })

  it('blocks a package missing a must-have, however cheap', () => {
    // The Garden Room is not beachfront-facing… but the property is, so use a
    // requirement the catalog genuinely cannot deliver instead.
    const strict: TravelIntent = { ...intent, requirements: { ...intent.requirements, kitchenette: 'required' } }

    const verdict = guardOffer({
      merchant: oceanvista,
      offer: offerFor(legal),
      intent: strict,
      rounds_used: 0,
      allowed_check_ins: WINDOW
    })

    assert.equal(verdict.authorized, false)
    assert.equal(verdict.checks.find(c => c.id === 'hard_requirements')!.passed, false)
  })

  it('blocks an expired offer', () => {
    const offer = offerFor(legal, { expires_at: new Date(Date.now() - 1000).toISOString() })
    const verdict = guardOffer({ merchant: oceanvista, offer, intent, rounds_used: 0, allowed_check_ins: WINDOW })

    assert.equal(verdict.authorized, false)
    assert.equal(verdict.checks.find(c => c.id === 'offer_not_expired')!.passed, false)
  })

  it('blocks more revisions than the merchant permits', () => {
    const offer = offerFor(legal, { round: oceanvista.policy.max_counter_rounds + 1 })
    const verdict = guardOffer({ merchant: oceanvista, offer, intent, rounds_used: 0, allowed_check_ins: WINDOW })

    assert.equal(verdict.authorized, false)
    assert.equal(verdict.checks.find(c => c.id === 'round_limit')!.passed, false)
  })
})

describe('Commerce Guard. Hard versus soft budget', () => {
  const dear: Bundle = {
    room_id: 'ov-premium-beach',
    addon_ids: ['ov-half-board', 'ov-private-transfer', 'ov-spa'],
    discount_pct: 0,
    check_in: CHECK_IN, room_count: 1 }

  it('blocks an over-budget offer when the budget is hard', () => {
    const offer = offerFor(dear)

    assert.ok(offer.quote.total_price > intent.budget.max)

    const verdict = guardOffer({ merchant: oceanvista, offer, intent, rounds_used: 0, allowed_check_ins: WINDOW })

    assert.equal(verdict.authorized, false)
    assert.equal(verdict.checks.find(c => c.id === 'hard_budget')!.passed, false)
  })

  it('only advises when the budget is a soft target', () => {
    const soft: TravelIntent = { ...intent, budget: { ...intent.budget, type: 'soft_target' } }

    const verdict = guardOffer({
      merchant: oceanvista,
      offer: offerFor(dear),
      intent: soft,
      rounds_used: 0,
      allowed_check_ins: WINDOW
    })

    const budgetCheck = verdict.checks.find(c => c.id === 'hard_budget')!

    assert.equal(budgetCheck.passed, false)
    assert.equal(budgetCheck.advisory, true)
    assert.equal(verdict.authorized, true, 'a soft target must not block a sale')
  })
})

describe('guardPayment, the last gate before money moves', () => {
  it('refuses to charge for an offer the traveller did not approve', () => {
    const verdict = guardPayment({
      merchant: oceanvista,
      offer: offerFor(legal),
      intent,
      rounds_used: 0,
      allowed_check_ins: WINDOW,
      approved_offer_id: 'off_something_else'
    })

    assert.equal(verdict.authorized, false)
  })

  it('authorizes the exact approved offer', () => {
    const offer = offerFor(legal)

    const verdict = guardPayment({
      merchant: oceanvista,
      offer,
      intent,
      rounds_used: 0,
      allowed_check_ins: WINDOW,
      approved_offer_id: offer.id
    })

    assert.equal(verdict.authorized, true, verdict.violations.map(v => v.detail).join('; '))
  })
})
