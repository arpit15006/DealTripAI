import { fail, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * A failed or abandoned payment.
 *
 * Nothing is marked booked, and (importantly) the negotiated offer is left
 * intact and still authorized. A card declining is not a reason to make the
 * traveller negotiate again from scratch; they retry against the same held
 * price until it expires on its own.
 */
export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as
    | { razorpay_order_id?: string; reason?: string; code?: string }
    | null

  const orderId = body?.razorpay_order_id

  if (!orderId) return fail(400, 'Missing razorpay_order_id.')

  const store = await getStore()
  const payment = await store.getPaymentByOrderId(orderId)

  if (!payment) return fail(404, 'No payment is on record for that order.')

  const reason = (body?.reason ?? 'Payment was not completed.').slice(0, 300)

  await store.updatePayment(payment.id, { status: 'failed', failure_reason: reason })

  // Hand the room back rather than holding it against a sale that did not happen.
  await store.releaseReservation(payment.offer_id, 'released')
  await store.updateNegotiation(payment.negotiation_id, { status: 'payment_failed' })

  const offer = await store.getOffer(payment.offer_id)

  await store.appendAudit({
    id: `evt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    negotiation_id: payment.negotiation_id,
    ts: new Date().toISOString(),
    actor: 'razorpay',
    merchant_id: null,
    action: 'payment_failed',
    summary: `Payment did not complete: ${reason} Nothing was booked; the negotiated offer is held.`,
    decision: 'fail',
    detail: {
      order_id: orderId,
      code: body?.code ?? null,
      offer_id: payment.offer_id,
      offer_held_until: offer?.expires_at ?? null,
      booking_confirmed: false
    }
  })

  return json({
    status: 'failed',
    retryable: true,
    offer_id: payment.offer_id,
    offer_held_until: offer?.expires_at ?? null,
    message: 'Nothing was charged and nothing was booked. The negotiated price is still held, you can retry.'
  })
}
