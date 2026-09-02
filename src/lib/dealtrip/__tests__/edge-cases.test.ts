/**
 * Inputs that are wrong rather than merely unusual.
 *
 * The theme running through every case here is the one that produced the
 * original complaint: the system reaching a defensible-looking outcome for a
 * reason that was not true. A withdrawal citing a price of infinity, a 502 that
 * blames the server for a typo, a guard rejecting a real offer because a field
 * was undefined rather than null. Each is a correct-looking failure, and each
 * is worse than the honest answer because there is nothing the traveller can
 * act on.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { isIsoDate, resolveCheckIns } from '../dates'
import { heuristicIntent } from '../intent'
import { explainNoCandidate } from '../merchant-planner'
import { roomsNeeded } from '../pricing'
import { SEED_MERCHANTS } from '../seed'
import { IntentExtractionSchema, TravelIntentSchema } from '../types'

import type { Merchant, TravelIntent } from '../types'

const KNOWN = ['Goa', 'Manali', 'Udaipur']
const oceanvista = SEED_MERCHANTS.find(m => m.slug === 'oceanvista') as Merchant

const intentOf = (over: Partial<TravelIntent> = {}): TravelIntent => ({
  destination: 'Goa',
  travelers: 2,
  rooms: null,
  duration_nights: 3,
  budget: { max: 60_000, currency: 'INR', type: 'soft_target' },
  requirements: {},
  date_flexibility_days: 0,
  check_in: null,
  priority: 'best_value',
  notes: '',
  ...over
})

describe('the fallback parser cannot emit something its own schema rejects', () => {
  // It is the guarantee that DealTrip survives its model provider being down.
  // Output that fails validation broke that guarantee at the exact moment it
  // was needed, and surfaced as a 502 blaming the server for the user's typo.
  const cases = [
    '400 nights in Goa for 90 people, budget 100 rupees',
    '0 nights in Goa for 0 people',
    '50 rooms in Goa for 2 people, 3 nights',
    'Goa for 2, 3 nights, budget 60000, flexible 90 days',
    '',
    'aaaaaaaa'
  ]

  for (const text of cases) {
    it(`produces a valid intent for ${JSON.stringify(text.slice(0, 34))}`, () => {
      const parsed = IntentExtractionSchema.safeParse(heuristicIntent(text, KNOWN))

      assert.ok(
        parsed.success,
        parsed.success ? '' : parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
      )
    })
  }

  it('says what it clamped rather than silently correcting it', () => {
    const intent = heuristicIntent('400 nights in Goa for 90 people', KNOWN)

    assert.equal(intent.duration_nights, 30)
    assert.equal(intent.travelers, 20)
    assert.ok(intent.ambiguities.some(a => /400 nights/.test(a)))
    assert.ok(intent.ambiguities.some(a => /90 travellers/.test(a)))
  })

  it('keeps the restatement in step with the values it actually produced', () => {
    // The sentence the traveller checks the parse against read from the
    // pre-clamp locals, so it could claim 400 nights for an intent of 30.
    const intent = heuristicIntent('400 nights in Goa for 90 people', KNOWN)

    assert.match(intent.restatement, /30 nights/)
    assert.doesNotMatch(intent.restatement, /400/)
  })
})

describe('dates that cannot be booked', () => {
  it('rejects anything that is not a real calendar day', () => {
    // Date.parse rolls 2026-02-30 into March, so a day nobody can check into
    // would otherwise be priced without complaint.
    assert.equal(isIsoDate('2026-02-30'), false)
    assert.equal(isIsoDate('next friday'), false)
    assert.equal(isIsoDate('05/01/2026'), false)
    assert.equal(isIsoDate('2026-01-05'), true)
  })

  it('refuses a malformed check_in at the boundary rather than deep inside', () => {
    // check_in is written by a model, and resolveCheckIns throws where nothing
    // catches it, so one bad token would fail a whole negotiation.
    assert.equal(TravelIntentSchema.safeParse(intentOf({ check_in: 'next friday' })).success, false)
    assert.equal(TravelIntentSchema.safeParse(intentOf({ check_in: '2026-01-05' })).success, true)
  })

  it('explains an empty date window instead of quoting a price of infinity', () => {
    const past = resolveCheckIns('2019-05-01', 0)

    assert.deepEqual(past, [], 'a stay that has already started is not offerable')

    const reason = explainNoCandidate({
      merchant: oceanvista,
      intent: intentOf({ check_in: '2019-05-01' }),
      nights: 3,
      travelers: 2,
      allowed_check_ins: past,
      target_price: null
    })

    assert.match(reason, /has already passed/)
    assert.doesNotMatch(reason, /₹∞|Infinity|NaN/)
  })
})

describe('records written before a field existed', () => {
  it('reads a missing room count as unstated, not as NaN', () => {
    // Zod defaults apply when a document is parsed, and nothing re-parses rows
    // already in the database. A strict === null test therefore let undefined
    // through into Math.trunc, and the guard rejected real offers citing
    // "1 unit where NaN would do". Every older negotiation was unbookable.
    const room = oceanvista.rooms.find(r => r.max_occupancy === 3)!

    assert.equal(roomsNeeded(room, 4, undefined), 2)
    assert.equal(roomsNeeded(room, 4, NaN), 2)
    assert.equal(roomsNeeded(room, 4, null), 2)
  })
})
