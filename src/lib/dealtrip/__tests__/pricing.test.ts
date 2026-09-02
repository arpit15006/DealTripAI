import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { countWeekendNights, resolveCheckIns } from '../dates'
import {
  CatalogError,
  computeQuote,
  discountToReach,
  maxAllowedDiscountPct,
  minimumAllowedPrice
} from '../pricing'
import { SEED_MERCHANTS } from '../seed'

import type { Merchant } from '../types'

const oceanvista = SEED_MERCHANTS.find(m => m.slug === 'oceanvista') as Merchant
const NIGHTS = 3
const PAX = 2

/** A Monday, so no night of a short stay carries the weekend uplift. */
const WEEKDAY = '2026-01-05'

/** A Friday, so the first two nights do. */
const WEEKEND = '2026-01-09'

describe('pricing. Money is derived, never asserted', () => {
  it('prices a room night by night, not as a flat multiple', () => {
    const room = oceanvista.rooms.find(r => r.id === 'ov-premium-beach')!
    const bundle = { room_id: room.id, addon_ids: [], discount_pct: 0, check_in: WEEKDAY, room_count: 1 }

    const quote = computeQuote(oceanvista, bundle, NIGHTS, PAX)

    assert.equal(quote.weekend_nights, 0)
    assert.equal(quote.list_price, room.base_price_per_night * NIGHTS)
  })

  it('applies the weekend uplift only to Friday and Saturday nights', () => {
    const room = oceanvista.rooms.find(r => r.id === 'ov-premium-beach')!

    assert.equal(countWeekendNights(WEEKEND, NIGHTS), 2)

    const weekday = computeQuote(
      oceanvista,
      { room_id: room.id, addon_ids: [], discount_pct: 0, check_in: WEEKDAY, room_count: 1 },
      NIGHTS,
      PAX
    )

    const weekend = computeQuote(
      oceanvista,
      { room_id: room.id, addon_ids: [], discount_pct: 0, check_in: WEEKEND, room_count: 1 },
      NIGHTS,
      PAX
    )

    const uplift = Math.round(room.base_price_per_night * (oceanvista.weekend_uplift_pct / 100))

    assert.equal(weekend.weekend_nights, 2)
    assert.equal(weekend.list_price - weekday.list_price, uplift * 2)
  })

  it('leaves cost flat across the week, so a weekend night is pure margin', () => {
    const room = oceanvista.rooms.find(r => r.id === 'ov-premium-beach')!

    const of = (checkIn: string) =>
      computeQuote(oceanvista, { room_id: room.id, addon_ids: [], discount_pct: 0, check_in: checkIn, room_count: 1 }, NIGHTS, PAX)

    assert.equal(of(WEEKDAY).total_cost, of(WEEKEND).total_cost)
    assert.ok(of(WEEKEND).margin_pct > of(WEEKDAY).margin_pct)
  })

  it('honours per-night and per-person add-on bases', () => {
    // Buffet breakfast at Sunset Bay is per night AND per person.
    const sunsetbay = SEED_MERCHANTS.find(m => m.slug === 'sunsetbay') as Merchant
    const breakfast = sunsetbay.addons.find(a => a.id === 'sb-breakfast')!

    assert.equal(breakfast.per_night, true)
    assert.equal(breakfast.per_person, true)

    const quote = computeQuote(
      sunsetbay,
      { room_id: 'sb-sea', addon_ids: [breakfast.id], discount_pct: 0, check_in: WEEKDAY, room_count: 1 },
      NIGHTS,
      PAX
    )

    const line = quote.lines.find(l => l.ref_id === breakfast.id)!

    assert.equal(line.amount, breakfast.price * NIGHTS * PAX)
  })

  it('never double-bills an add-on listed twice', () => {
    const once = computeQuote(
      oceanvista,
      { room_id: 'ov-premium-beach', addon_ids: ['ov-breakfast'], discount_pct: 0, check_in: WEEKDAY, room_count: 1 },
      NIGHTS,
      PAX
    )

    const twice = computeQuote(
      oceanvista,
      { room_id: 'ov-premium-beach', addon_ids: ['ov-breakfast', 'ov-breakfast'], discount_pct: 0, check_in: WEEKDAY, room_count: 1 },
      NIGHTS,
      PAX
    )

    assert.equal(once.total_price, twice.total_price)
  })

  it('refuses to price inventory that does not exist', () => {
    assert.throws(
      () =>
        computeQuote(
          oceanvista,
          { room_id: 'ov-presidential-penthouse', addon_ids: [], discount_pct: 0, check_in: WEEKDAY, room_count: 1 },
          NIGHTS,
          PAX
        ),
      CatalogError
    )

    assert.throws(
      () =>
        computeQuote(
          oceanvista,
          { room_id: 'ov-premium-beach', addon_ids: ['ov-helicopter'], discount_pct: 0, check_in: WEEKDAY, room_count: 1 },
          NIGHTS,
          PAX
        ),
      CatalogError
    )
  })
})

describe('policy floors, two independent limits, the higher one binds', () => {
  const bundle = { room_id: 'ov-premium-beach', addon_ids: ['ov-breakfast'], discount_pct: 0, check_in: WEEKDAY, room_count: 1 }

  it('reports which of the two floors is binding', () => {
    const floors = minimumAllowedPrice(oceanvista, bundle, NIGHTS, PAX)

    assert.equal(floors.floor, Math.max(floors.discount_floor, floors.margin_floor))
    assert.equal(floors.binding, floors.margin_floor > floors.discount_floor ? 'margin' : 'discount')
  })

  it('never permits a discount that breaches either floor', () => {
    const max = maxAllowedDiscountPct(oceanvista, bundle, NIGHTS, PAX)

    assert.ok(max <= oceanvista.policy.max_discount_pct + 1e-9)

    const atLimit = computeQuote(oceanvista, { ...bundle, discount_pct: max }, NIGHTS, PAX)

    assert.ok(atLimit.margin_pct >= oceanvista.policy.min_margin_pct - 0.01)
  })

  it('returns null when no legal discount reaches a target', () => {
    const { floor } = minimumAllowedPrice(oceanvista, bundle, NIGHTS, PAX)

    assert.equal(discountToReach(oceanvista, bundle, NIGHTS, PAX, floor - 1), null)
    assert.notEqual(discountToReach(oceanvista, bundle, NIGHTS, PAX, floor + 1000), null)
  })

  it("PalmStay's beachfront villa genuinely cannot reach a ₹60,000 budget", () => {
    // The demo's policy-rejection beat is arithmetic, not a staged outcome.
    const palmstay = SEED_MERCHANTS.find(m => m.slug === 'palmstay') as Merchant

    const full = {
      room_id: 'ps-villa',
      addon_ids: palmstay.addons.map(a => a.id),
      discount_pct: 0,
      check_in: WEEKDAY, room_count: 1 }

    const floors = minimumAllowedPrice(palmstay, full, NIGHTS, PAX)

    assert.ok(floors.floor > 60_000, `expected floor above ₹60,000, got ${floors.floor}`)
    assert.equal(floors.binding, 'margin')
  })
})

describe('date resolution', () => {
  // Pinned, because resolveCheckIns filters out dates already past, a test
  // anchored on a real calendar date silently empties as the clock moves.
  const TODAY = new Date('2026-03-01T00:00:00Z')

  it('offers one date when the traveller is not flexible', () => {
    assert.deepEqual(resolveCheckIns('2026-03-10', 0, TODAY), ['2026-03-10'])
  })

  it('offers a symmetric window around the anchor when they are', () => {
    assert.deepEqual(resolveCheckIns('2026-03-10', 2, TODAY), [
      '2026-03-08',
      '2026-03-09',
      '2026-03-10',
      '2026-03-11',
      '2026-03-12'
    ])
  })

  it('anchors three weeks out when no date is given', () => {
    const dates = resolveCheckIns(null, 0, TODAY)

    assert.deepEqual(dates, ['2026-03-22'])
  })

  it('never proposes a stay that has already begun', () => {
    const today = new Date('2026-03-10T00:00:00Z')
    const dates = resolveCheckIns('2026-03-10', 5, today)

    assert.ok(dates.every(d => d >= '2026-03-10'))
  })
})
