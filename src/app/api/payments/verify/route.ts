import { formatINR } from '@/lib/dealtrip/pricing'
import { fetchPayment, razorpayConfigured, verifyPaymentSignature } from '@/lib/dealtrip/razorpay'
import { fail, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Server-side payment verification.
 *
 * The browser's word that a payment succeeded is not evidence. A booking is
 * confirmed only when the HMAC signature over `order_id|payment_id` verifies
 * against the key secret, and (when keys are live) Razorpay itself confirms
 * the payment is captured for the amount we asked for.
 */
export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as {
    razorpay_order_id?: string
    razorpay_payment_id?: string
    razorpay_signature?: string
  } | null

  const orderId = body?.razorpay_order_id
  const paymentId = body?.razorpay_payment_id
  const signature = body?.razorpay_signature

  if (!orderId || !paymentId) return fail(400, 'Missing razorpay_order_id or razorpay_payment_id.')

  const store = await getStore()
  const payment = await store.getPaymentByOrderId(orderId)

  if (!payment) return fail(404, 'No payment is on record for that order.')
  if (payment.status === 'paid') return json({ status: 'paid', already_verified: true, payment })

  const audit = (
    action: string,
    summary: string,
    decision: 'pass' | 'fail' | 'info',
    detail: Record<string, unknown>
  ) =>
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

  /* ---- 1. Signature ---- */
  const signatureOk = verifyPaymentSignature({
    order_id: orderId,
    payment_id: paymentId,
    signature: signature ?? ''
  })

  if (!signatureOk) {
    /*
     * A signature that does not verify says something about the caller, not
     * about the payment. Marking the payment failed here let anyone holding an
     * order id post one junk signature and kill a booking that was at that
     * moment being paid for. The attempt is recorded, because an unsigned
     * caller reaching this endpoint is worth seeing in the audit trail, and
     * nothing about the booking moves.
     */
    await audit(
      'payment_verification_rejected',
      'A payment confirmation arrived with a signature that did not verify. It was rejected and the booking is untouched.',
      'fail',
      { order_id: orderId, payment_id: paymentId, state_changed: false }
    )

    return fail(400, 'Payment signature verification failed. Nothing has been booked.')
  }

  /* ---- 2. Ask Razorpay directly, rather than believing the callback ---- */
  if (razorpayConfigured()) {
    const remote = await fetchPayment(paymentId)

    if (remote) {
      const capturedPaise = Number(remote.amount)
      const expectedPaise = payment.amount * 100
      const captured = remote.status === 'captured' || remote.status === 'authorized'

      if (!captured || capturedPaise !== expectedPaise) {
        await store.updatePayment(payment.id, {
          status: 'verification_failed',
          failure_reason: `Razorpay reports status "${remote.status}" for ${capturedPaise / 100} INR; expected a captured ${payment.amount} INR.`
        })

        await audit(
          'payment_amount_mismatch',
          `Signature verified but Razorpay reports ${formatINR(capturedPaise / 100)} with status "${remote.status}". Booking withheld.`,
          'fail',
          { order_id: orderId, payment_id: paymentId, expected_paise: expectedPaise, actual_paise: capturedPaise, remote_status: remote.status }
        )

        return fail(409, 'The captured amount does not match the approved offer. Nothing has been booked.')
      }
    }
  }

  /* ---- 3. Confirmed ---- */
  const settledAt = new Date().toISOString()

  await store.updatePayment(payment.id, {
    status: 'paid',
    razorpay_payment_id: paymentId,
    settled_at: settledAt
  })

  await store.setOfferStatus(payment.offer_id, 'purchased')

  // The hold becomes permanent: this unit is now sold, not merely spoken for.
  await store.releaseReservation(payment.offer_id, 'confirmed')
  await store.updateNegotiation(payment.negotiation_id, { status: 'booked' })

  await audit(
    'payment_verified',
    `Payment ${paymentId} verified server-side for ${formatINR(payment.amount)}. Booking confirmed.`,
    'pass',
    { order_id: orderId, payment_id: paymentId, amount_inr: payment.amount, method: razorpayConfigured() ? 'razorpay_test_mode' : 'simulated' }
  )

  return json({
    status: 'paid',
    payment: { ...payment, status: 'paid', razorpay_payment_id: paymentId, settled_at: settledAt },
    negotiation_id: payment.negotiation_id
  })
}
