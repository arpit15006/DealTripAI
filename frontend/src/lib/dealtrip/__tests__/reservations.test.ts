import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createMemoryStore } from '../store'

import type { Reservation } from '../store'

const hold = (overrides: Partial<Reservation> = {}): Reservation => ({
  id: `res_${Math.random().toString(36).slice(2, 8)}`,
  negotiation_id: 'neg',
  offer_id: `off_${Math.random().toString(36).slice(2, 8)}`,
  merchant_id: 'mch_oceanvista',
  room_id: 'ov-premium-beach',
  status: 'held',
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 20 * 60_000).toISOString(),
  ...overrides
})

describe('inventory reservations, the last room cannot be sold twice', () => {
  it('grants holds up to capacity and refuses beyond it', async () => {
    const store = await createMemoryStore()

    assert.ok(await store.reserveRoom(hold(), 2), 'first hold should be granted')
    assert.ok(await store.reserveRoom(hold(), 2), 'second hold should be granted')
    assert.equal(await store.reserveRoom(hold(), 2), null, 'a third must be refused at capacity 2')
  })

  it('is idempotent for the same offer', async () => {
    const store = await createMemoryStore()
    const one = hold()

    const first = await store.reserveRoom(one, 1)
    const again = await store.reserveRoom({ ...one, id: 'res_different' }, 1)

    // Re-approving the same offer must not consume a second unit.
    assert.ok(first)
    assert.equal(again?.offer_id, one.offer_id)
    assert.equal(await store.countActiveReservations(one.merchant_id, one.room_id), 1)
  })

  it('returns the unit when a payment fails', async () => {
    const store = await createMemoryStore()
    const only = hold()

    await store.reserveRoom(only, 1)
    assert.equal(await store.reserveRoom(hold(), 1), null, 'room is held')

    await store.releaseReservation(only.offer_id, 'released')

    assert.equal(await store.countActiveReservations(only.merchant_id, only.room_id), 0)
    assert.ok(await store.reserveRoom(hold(), 1), 'the released unit is available again')
  })

  it('keeps the unit permanently once the booking confirms', async () => {
    const store = await createMemoryStore()
    const sold = hold()

    await store.reserveRoom(sold, 1)
    await store.releaseReservation(sold.offer_id, 'confirmed')

    assert.equal(await store.countActiveReservations(sold.merchant_id, sold.room_id), 1)
    assert.equal(await store.reserveRoom(hold(), 1), null, 'a sold room is not available')
  })

  it('frees a unit whose hold has lapsed', async () => {
    const store = await createMemoryStore()

    await store.reserveRoom(hold({ expires_at: new Date(Date.now() - 1000).toISOString() }), 1)

    assert.equal(await store.countActiveReservations('mch_oceanvista', 'ov-premium-beach'), 0)
    assert.ok(await store.reserveRoom(hold(), 1), 'an expired hold must not block a sale')
  })

  it('counts rooms independently', async () => {
    const store = await createMemoryStore()

    await store.reserveRoom(hold({ room_id: 'ov-premium-beach' }), 1)

    assert.ok(await store.reserveRoom(hold({ room_id: 'ov-garden' }), 1), 'a different room is unaffected')
  })
})
