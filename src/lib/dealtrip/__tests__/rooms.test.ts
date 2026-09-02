/**
 * Room counts.
 *
 * The bug these exist for: a party of four asking for two rooms was matched
 * against `room.max_occupancy >= travelers`, which demands that ONE room sleep
 * everybody. Properties whose largest room sleeps three were eliminated before
 * they could quote, and the one property with a bigger room offered a single
 * unit that the traveller had explicitly not asked for. Both readings of the
 * request were wrong, and both failed silently.
 *
 * Occupancy is a per-room limit. The party is fitted across rooms.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { guardOffer } from '../commerce-guard'
import { materializeOffer } from '../merchant-agent'
import { planBundle } from '../merchant-planner'
import { computeQuote, roomsNeeded } from '../pricing'
import { SEED_MERCHANTS } from '../seed'

import type { Merchant, Room, TravelIntent } from '../types'

const oceanvista = SEED_MERCHANTS.find(m => m.slug === 'oceanvista') as Merchant

/** Sleeps 3, six units in stock. */
const garden = oceanvista.rooms.find(r => r.id === 'ov-garden') as Room

/** Sleeps 2, four in stock. */
const standard = oceanvista.rooms.find(r => r.id === 'ov-standard-beach') as Room

const WEEKDAY = '2026-01-05'
const NIGHTS = 3

const intentFor = (travelers: number, rooms: number | null, budget = 400_000): TravelIntent => ({
  destination: 'Goa',
  travelers,
  rooms,
  duration_nights: NIGHTS,
  budget: { max: budget, currency: 'INR', type: 'soft_target' },
  requirements: {},
  date_flexibility_days: 0,
  check_in: WEEKDAY,
  priority: 'best_value',
  notes: ''
})

describe('how many rooms a party needs', () => {
  it('splits a party across rooms rather than demanding one that fits everybody', () => {
    // Four people, rooms that sleep two: two rooms, not "impossible".
    assert.equal(roomsNeeded(standard, 4, null), 2)
    assert.equal(roomsNeeded(standard, 5, null), 3)
    assert.equal(roomsNeeded(garden, 4, null), 2)
  })

  it('honours a stated count above the minimum', () => {
    // Four people fit in two garden rooms, but asking for three is a request
    // for space, not a mistake to be corrected downward.
    assert.equal(roomsNeeded(garden, 4, 3), 3)
  })

  it('will not go below what legally holds the party', () => {
    // Occupancy is a safety limit. "One room for four" in a double is not a
    // discount opportunity, it is an unbookable stay.
    assert.equal(roomsNeeded(standard, 4, 1), 2)
  })

  it('caps the absurd end without arguing', () => {
    assert.equal(roomsNeeded(garden, 2, 9), 2)
    assert.equal(roomsNeeded(garden, 1, 5), 1)
  })
})

describe('pricing scales with rooms, and only where it should', () => {
  it('multiplies the room line and nothing else', () => {
    const one = computeQuote(
      oceanvista,
      { room_id: garden.id, addon_ids: [], discount_pct: 0, check_in: WEEKDAY, room_count: 1 },
      NIGHTS,
      2
    )

    const two = computeQuote(
      oceanvista,
      { room_id: garden.id, addon_ids: [], discount_pct: 0, check_in: WEEKDAY, room_count: 2 },
      NIGHTS,
      4
    )

    assert.equal(two.list_price, one.list_price * 2)
    assert.equal(two.total_cost, one.total_cost * 2)
    assert.equal(two.lines[0].quantity, NIGHTS * 2)
    assert.match(two.lines[0].label, /2 rooms/)
  })

  it('keeps per-person add-ons on people, not on rooms', () => {
    // Water sports is per person. Four travellers in two rooms buy four, not
    // eight. Multiplying every line by room count is the obvious wrong fix.
    const quote = computeQuote(
      oceanvista,
      { room_id: garden.id, addon_ids: ['ov-watersports'], discount_pct: 0, check_in: WEEKDAY, room_count: 2 },
      NIGHTS,
      4
    )

    const watersports = quote.lines.find(l => l.ref_id === 'ov-watersports')!
    const unit = oceanvista.addons.find(a => a.id === 'ov-watersports')!

    assert.equal(watersports.amount, unit.price * 4, 'four guests, four packages')
  })

  it('prices a bundle written before room counts existed exactly as it did then', () => {
    const legacy = { room_id: garden.id, addon_ids: [], discount_pct: 0, check_in: WEEKDAY } as never

    assert.equal(
      computeQuote(oceanvista, legacy, NIGHTS, 2).total_price,
      computeQuote(
        oceanvista,
        { room_id: garden.id, addon_ids: [], discount_pct: 0, check_in: WEEKDAY, room_count: 1 },
        NIGHTS,
        2
      ).total_price
    )
  })
})

describe('the planner quotes parties it used to turn away', () => {
  it('offers two rooms for four travellers who asked for two', () => {
    const candidate = planBundle({
      merchant: oceanvista,
      intent: intentFor(4, 2),
      nights: NIGHTS,
      travelers: 4,
      allowed_check_ins: [WEEKDAY],
      target_price: null
    })

    assert.ok(candidate, 'a property with six free garden rooms must be able to quote four people')
    assert.equal(candidate.bundle.room_count, 2)
    assert.equal(candidate.quote.travelers, 4)
  })

  it('still quotes when the traveller names no room count', () => {
    const candidate = planBundle({
      merchant: oceanvista,
      intent: intentFor(4, null),
      nights: NIGHTS,
      travelers: 4,
      allowed_check_ins: [WEEKDAY],
      target_price: null
    })

    assert.ok(candidate)
    assert.ok(candidate.bundle.room_count >= 2, 'four people cannot share one room that sleeps three')
  })

  it('declines when it cannot supply the units, rather than quoting fewer', () => {
    // Premium sleeps 3 with two in stock. Asking for four of them is a real
    // shortfall, and a smaller booking is not an answer to it.
    const thin: Merchant = {
      ...oceanvista,
      rooms: [{ ...oceanvista.rooms.find(r => r.id === 'ov-premium-beach')!, inventory_available: 2 }]
    }

    const candidate = planBundle({
      merchant: thin,
      intent: intentFor(9, 4),
      nights: NIGHTS,
      travelers: 9,
      allowed_check_ins: [WEEKDAY],
      target_price: null
    })

    assert.equal(candidate, null)
  })
})

describe('the guard checks the count it was asked for', () => {
  const offerOf = (roomCount: number, travelers: number) =>
    materializeOffer({
      merchant: oceanvista,
      proposal: {
        check_in: WEEKDAY,
        room_id: garden.id,
        addon_ids: [],
        discount_pct: 0,
        rationale: 'test',
        changes_from_previous: [],
        can_meet_request: true,
        withdrawal_reason: null
      },
      negotiationId: 'neg_test',
      round: 0,
      nights: NIGHTS,
      travelers,
      requested_rooms: roomCount,
      default_check_in: WEEKDAY
    })

  const verdictFor = (offer: ReturnType<typeof offerOf>, intent: TravelIntent) =>
    guardOffer({
      merchant: oceanvista,
      offer,
      intent,
      rounds_used: 0,
      allowed_check_ins: [WEEKDAY],
      now: new Date(`${WEEKDAY}T00:00:00Z`)
    })

  it('passes occupancy across rooms instead of within one', () => {
    const verdict = verdictFor(offerOf(2, 4), intentFor(4, 2))
    const occupancy = verdict.checks.find(c => c.id === 'occupancy_fits')!

    assert.ok(occupancy.passed, occupancy.detail)
    assert.match(occupancy.detail, /sleeps 6/)
  })

  it('catches an offer that quietly sells fewer rooms than were asked for', () => {
    // The offer is built for two rooms, then adjudicated against a traveller
    // who asked for three. Nothing about the arithmetic is wrong, which is
    // exactly why this needs its own check.
    const verdict = verdictFor(offerOf(2, 4), intentFor(4, 3))
    const count = verdict.checks.find(c => c.id === 'room_count_matches_request')!

    assert.equal(count.passed, false)
    assert.equal(verdict.authorized, false)
    assert.match(count.detail, /where 3 were asked for/)
  })

  it('fails inventory against the units the offer takes, not against one', () => {
    const scarce: Merchant = {
      ...oceanvista,
      rooms: oceanvista.rooms.map(r => (r.id === garden.id ? { ...r, inventory_available: 1 } : r))
    }

    const verdict = guardOffer({
      merchant: scarce,
      offer: offerOf(2, 4),
      intent: intentFor(4, 2),
      rounds_used: 0,
      allowed_check_ins: [WEEKDAY],
      now: new Date(`${WEEKDAY}T00:00:00Z`)
    })

    const inventory = verdict.checks.find(c => c.id === 'inventory_available')!

    assert.equal(inventory.passed, false, 'one unit cannot satisfy a two room offer')
    assert.match(inventory.detail, /needs 2 units/)
  })
})
