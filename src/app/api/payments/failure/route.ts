import { fail, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * A failed or abandoned payment, as reported by the browser.
 *
 * This endpoint is advisory and deliberately changes nothing.
 *
 * It used to release the inventory hold and mark the negotiation failed on the
 * strength of an order id and nothing else. Order ids are handed to the browser
 * when an order is created, so anyone who read one out of a network tab could
 * post it here and free the room out from under a traveller who was at that
 * moment on the Razorpay modal paying for it. Unauthenticated input decided
 * whether a booking survived.
 *
 * Real failures already have a trustworthy path: Razorpay's signed
 * `payment.failed` webhook, which does release the hold. The browser saying the
 * modal closed is a hint, worth recording and worth showing the traveller, and
 * not evidence of anything. If they genuinely walked away, the hold expires
 * with the offer, which is what the expiry is for.
 *
 * Nothing is marked booked, and the negotiated offer is left intact and still
 * authorized. A card declining is not a reason to make the traveller negotiate
 * again from scratch; they retry against the same held price.
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
  const offer = await store.getOffer(payment.offer_id)

  await store.appendAudit({
    id: `evt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    negotiation_id: payment.negotiation_id,
    ts: new Date().toISOString(),

    // The browser, not Razorpay. Attributing an unverified client report to the
    // payment provider is the kind of small lie an audit trail cannot afford.
    actor: 'user',
    merchant_id: null,
    action: 'payment_not_completed',
    summary: `The browser reported that payment did not complete: ${reason} Nothing was booked, and the room stays held until the offer expires.`,
    decision: 'info',
    detail: {
      order_id: orderId,
      code: body?.code ?? null,
      offer_id: payment.offer_id,
      offer_held_until: offer?.expires_at ?? null,
      booking_confirmed: false,
      reported_by: 'browser',
      authoritative: false
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
