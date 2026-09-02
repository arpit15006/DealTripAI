import { formatINR } from '@/lib/dealtrip/pricing'
import { verifyWebhookSignature, webhookConfigured } from '@/lib/dealtrip/razorpay'
import { fail, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Razorpay webhook.
 *
 * Confirmation must not depend on the traveller's browser. If the tab closes
 * between the card being charged and the callback firing, the money has moved
 * and (without this) nothing would ever be booked. Razorpay retries a webhook
 * until it is acknowledged, so this is the path that actually guarantees the
 * ledger catches up with reality.
 *
 * The browser callback stays: it is faster, and it is what lets the traveller
 * see a confirmation immediately. This is the backstop, and the two converge on
 * the same state because both are idempotent.
 *
 * Configure in the Razorpay dashboard against `payment.captured` and
 * `payment.failed`, with RAZORPAY_WEBHOOK_SECRET set to the same secret.
 */
export const POST = async (request: Request) => {
  if (!webhookConfigured()) return fail(503, 'No webhook secret is configured.')

  // Raw bytes: the signature is over exactly what was sent.
  const raw = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!verifyWebhookSignature(raw, signature)) {
    console.warn('[dealtrip] rejected a webhook with an invalid signature')

    return fail(400, 'Invalid webhook signature.')
  }

  let event: {
    event?: string
    payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number; status?: string } } }
  }

  try {
    event = JSON.parse(raw)
  } catch {
    return fail(400, 'Webhook body was not JSON.')
  }

  const entity = event.payload?.payment?.entity
  const orderId = entity?.order_id

  if (!orderId) return json({ received: true, ignored: 'no order id on the event' })

  const store = await getStore()
  const payment = await store.getPaymentByOrderId(orderId)

  if (!payment) return json({ received: true, ignored: 'no payment on record for that order' })

  const audit = (action: string, summary: string, decision: 'pass' | 'fail' | 'info', detail: Record<string, unknown>) =>
    store.appendAudit({
      id: `evt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      negotiation_id: payment.negotiation_id,
      ts: new Date().toISOString(),
      actor: 'razorpay',
      merchant_id: null,
      action,
      summary,
      decision,
      detail
    })

  /* ---- Captured ---- */
  if (event.event === 'payment.captured') {
    if (payment.status === 'paid') return json({ received: true, already: 'paid' })

    // The amount is checked against what we asked for, not what we were told.
    const expectedPaise = payment.amount * 100

    if (Number(entity?.amount) !== expectedPaise) {
      await store.updatePayment(payment.id, {
        status: 'verification_failed',
        failure_reason: `Webhook reported ${Number(entity?.amount) / 100} INR against an approved ${payment.amount} INR.`
      })

      await audit(
        'webhook_amount_mismatch',
        `Webhook reported ${formatINR(Number(entity?.amount) / 100)} for an order approved at ${formatINR(payment.amount)}. Booking withheld.`,
        'fail',
        { order_id: orderId, expected_paise: expectedPaise, actual_paise: entity?.amount }
      )

      return json({ received: true, action: 'withheld' })
    }

    await store.updatePayment(payment.id, {
      status: 'paid',
      razorpay_payment_id: entity?.id ?? null,
      settled_at: new Date().toISOString()
    })
    await store.setOfferStatus(payment.offer_id, 'purchased')
    await store.releaseReservation(payment.offer_id, 'confirmed')
    await store.updateNegotiation(payment.negotiation_id, { status: 'booked' })

    await audit(
      'payment_captured_webhook',
      `Razorpay confirmed ${entity?.id} for ${formatINR(payment.amount)} by webhook. Booking confirmed without relying on the browser.`,
      'pass',
      { order_id: orderId, payment_id: entity?.id, source: 'webhook' }
    )

    return json({ received: true, action: 'booked' })
  }

  /* ---- Failed ---- */
  if (event.event === 'payment.failed') {
    if (payment.status === 'paid') return json({ received: true, ignored: 'already paid' })

    await store.updatePayment(payment.id, {
      status: 'failed',
      failure_reason: `Razorpay reported the payment failed (status "${entity?.status}").`
    })
    await store.releaseReservation(payment.offer_id, 'released')
    await store.updateNegotiation(payment.negotiation_id, { status: 'payment_failed' })

    await audit(
      'payment_failed_webhook',
      'Razorpay reported the payment failed. Nothing was booked and the held room was returned.',
      'fail',
      { order_id: orderId, payment_id: entity?.id, source: 'webhook' }
    )

    return json({ received: true, action: 'released' })
  }

  return json({ received: true, ignored: event.event ?? 'unknown event' })
}
