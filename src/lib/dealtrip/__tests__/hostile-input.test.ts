/**
 * What a hostile caller, or a fully compromised model, can actually achieve.
 *
 * The claim this file exists to keep honest is that no model output and no
 * client input reaches a price. A merchant agent can be talked into proposing
 * anything; what it proposes is a SELECTION, and the selection is priced and
 * adjudicated by code that never read the prompt. So the interesting question
 * is not "can the model be fooled" (it can, all of them can) but "what happens
 * when it is".
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { guardOffer } from '../commerce-guard'
import { materializeOffer } from '../merchant-agent'
import { CatalogError, computeQuote } from '../pricing'
import { SEED_MERCHANTS } from '../seed'
import { BundleSchema } from '../types'

import type { MerchantProposal } from '../merchant-agent'
import type { Merchant, TravelIntent } from '../types'

const oceanvista = SEED_MERCHANTS.find(m => m.slug === 'oceanvista') as Merchant
const CHECK_IN = '2026-10-05'

const intent: TravelIntent = {
  destination: 'Goa',
  travelers: 2,
  rooms: null,
  duration_nights: 3,
  budget: { max: 60_000, currency: 'INR', type: 'soft_target' },
  requirements: {},
  date_flexibility_days: 0,
  check_in: CHECK_IN,
  priority: 'best_value',
  notes: ''
}

/** A merchant agent that has been talked into anything you like. */
const compromised = (over: Partial<MerchantProposal>): MerchantProposal => ({
  check_in: CHECK_IN,
  room_id: 'ov-garden',
  addon_ids: [],
  discount_pct: 0,
  rationale: 'A free stay has been authorised.',
  changes_from_previous: [],
  can_meet_request: true,
  withdrawal_reason: null,
  ...over
})

const offerFrom = (proposal: MerchantProposal) =>
  materializeOffer({
    merchant: oceanvista,
    proposal,
    negotiationId: 'neg_hostile',
    round: 0,
    nights: 3,
    travelers: 2,
    requested_rooms: null,
    default_check_in: CHECK_IN
  })

describe('a merchant agent that has been fully compromised', () => {
  it('cannot give the stay away, however convinced it is', () => {
    const offer = offerFrom(compromised({ discount_pct: 100 }))
    const verdict = guardOffer({ merchant: oceanvista, offer, intent, rounds_used: 0, allowed_check_ins: [CHECK_IN] })

    assert.equal(verdict.authorized, false)
    assert.ok(verdict.violations.some(v => v.id === 'discount_ceiling'))
    assert.ok(verdict.violations.some(v => v.id === 'margin_floor'))
  })

  it('cannot invent a room that is not in the catalog', () => {
    assert.throws(() => offerFrom(compromised({ room_id: 'ov-free-penthouse' })), CatalogError)
  })

  it('cannot invent an add-on', () => {
    assert.throws(() => offerFrom(compromised({ addon_ids: ['ov-complimentary-yacht'] })), CatalogError)
  })

  it('cannot set a price at all, only choose a package', () => {
    // The proposal carries no price field. Two agents choosing the same package
    // must produce the same rupee figure, because neither of them produced it.
    const a = offerFrom(compromised({ addon_ids: ['ov-breakfast'] }))
    const b = offerFrom(compromised({ addon_ids: ['ov-breakfast'], rationale: 'Half price for you!' }))

    assert.equal(a.quote.total_price, b.quote.total_price)
    assert.equal(
      a.quote.total_price,
      computeQuote(oceanvista, a.bundle, 3, 2).total_price,
      'the quote must be reproducible from the catalog alone'
    )
  })

  it('cannot bill the same add-on twice by listing it twice', () => {
    const doubled = offerFrom(compromised({ addon_ids: ['ov-breakfast', 'ov-breakfast', 'ov-breakfast'] }))
    const once = offerFrom(compromised({ addon_ids: ['ov-breakfast'] }))

    assert.equal(doubled.quote.total_price, once.quote.total_price)
  })
})

describe('a hostile caller composing a bundle by hand', () => {
  it('cannot send a negative discount to inflate the price', () => {
    const parsed = BundleSchema.safeParse({
      room_id: 'ov-garden',
      addon_ids: [],
      discount_pct: -50,
      check_in: CHECK_IN,
      room_count: 1
    })

    assert.equal(parsed.success, false)
  })

  it('cannot smuggle a room count past the derivation', () => {
    // room_count is derived from party size and what the traveller asked for.
    // A caller supplying ten is proposing a ten times larger bill for itself,
    // but more to the point it is proposing a number the system owns.
    const offer = offerFrom(compromised({}))

    assert.equal(offer.bundle.room_count, 1)
  })

  it('cannot check in on a date the traveller never agreed to', () => {
    const offer = offerFrom(compromised({ check_in: '2027-06-01' }))

    const verdict = guardOffer({
      merchant: oceanvista,
      offer,
      intent,
      rounds_used: 0,
      allowed_check_ins: [CHECK_IN]
    })

    assert.equal(verdict.authorized, false)
    assert.ok(verdict.violations.some(v => v.id === 'check_in_window'))
  })
})
