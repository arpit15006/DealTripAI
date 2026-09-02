import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { createMemoryStore } from '../store'

import type { PaymentRecord, Reservation } from '../store'

const hold = (overrides: Partial<Reservation> = {}): Reservation => ({
  id: `res_${Math.random().toString(36).slice(2, 8)}`,
  negotiation_id: 'neg',
  offer_id: `off_${Math.random().toString(36).slice(2, 8)}`,
  merchant_id: 'mch_oceanvista',
  room_id: 'ov-premium-beach',
  units: 1,
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

  it('counts units, not rows, so a two-room hold takes two', async () => {
    const store = await createMemoryStore()

    assert.ok(await store.reserveRoom(hold({ units: 2 }), 3), 'a party needing two rooms fits in three')
    assert.equal(
      await store.countActiveReservations('mch_oceanvista', 'ov-premium-beach'),
      2,
      'one row holding two rooms must count as two units'
    )

    // One unit is left, so a second two-room party cannot be squeezed in even
    // though only a single row exists. Counting rows would have allowed it.
    assert.equal(await store.reserveRoom(hold({ units: 2 }), 3), null, 'two more must not fit in one')
    assert.ok(await store.reserveRoom(hold({ units: 1 }), 3), 'the remaining single unit is still sellable')
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

describe('payment slots — one live order per offer', () => {
  const slot = (offerId: string, overrides: Partial<PaymentRecord> = {}): PaymentRecord => ({
    id: `pay_${Math.random().toString(36).slice(2, 8)}`,
    negotiation_id: 'neg',
    offer_id: offerId,
    razorpay_order_id: null,
    razorpay_payment_id: null,
    amount: 50_000,
    currency: 'INR',
    status: 'created',
    failure_reason: null,
    created_at: new Date().toISOString(),
    settled_at: null,
    ...overrides
  })

  it('lets exactly one caller claim an offer', async () => {
    const store = await createMemoryStore()

    assert.ok(await store.claimPaymentSlot(slot('off_a')), 'first claim should win')
    assert.equal(await store.claimPaymentSlot(slot('off_a')), null, 'second claim must lose')
  })

  it('keeps different offers independent', async () => {
    const store = await createMemoryStore()

    assert.ok(await store.claimPaymentSlot(slot('off_a')))
    assert.ok(await store.claimPaymentSlot(slot('off_b')), 'a different offer is unaffected')
  })

  it('releases a claim abandoned before an order was raised', async () => {
    const store = await createMemoryStore()

    // A request that won the slot and then died: no order id, and stale.
    await store.claimPaymentSlot(
      slot('off_a', { created_at: new Date(Date.now() - 5 * 60_000).toISOString() })
    )

    assert.ok(
      await store.claimPaymentSlot(slot('off_a')),
      'an abandoned claim must not block the offer forever'
    )
  })

  it('does not release a claim that already has an order', async () => {
    const store = await createMemoryStore()

    await store.claimPaymentSlot(
      slot('off_a', {
        razorpay_order_id: 'order_live',
        created_at: new Date(Date.now() - 5 * 60_000).toISOString()
      })
    )

    assert.equal(
      await store.claimPaymentSlot(slot('off_a')),
      null,
      'a live order must keep the slot however old it is'
    )
  })
})

describe('payment updates persist every field they are given', () => {
  it('attaches an order id, so the payment can be found at verification', async () => {
    const store = await createMemoryStore()

    const claimed = await store.claimPaymentSlot({
      id: 'pay_1',
      negotiation_id: 'neg',
      offer_id: 'off_a',
      razorpay_order_id: null,
      razorpay_payment_id: null,
      amount: 50_000,
      currency: 'INR',
      status: 'created',
      failure_reason: null,
      created_at: new Date().toISOString(),
      settled_at: null
    })

    assert.ok(claimed)
    await store.updatePayment(claimed.id, { razorpay_order_id: 'order_xyz' })

    // The whole verification path looks a payment up by its order id. If the
    // update drops the field, a real payment can never be confirmed.
    const found = await store.getPaymentByOrderId('order_xyz')

    assert.ok(found, 'payment must be findable by the order it was given')
    assert.equal(found.offer_id, 'off_a')
  })
})
