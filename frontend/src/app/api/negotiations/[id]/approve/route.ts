import { guardPayment } from '@/lib/dealtrip/commerce-guard'
import { computeQuote, formatINR } from '@/lib/dealtrip/pricing'
import { createOrder, publicKeyId, razorpayConfigured } from '@/lib/dealtrip/razorpay'
import { allMerchants, fail, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The traveller approves one specific offer, and only then does a payable order
 * come into existence.
 *
 * This route re-runs the Commerce Guard from scratch. Passing at ranking time is
 * not passing at payment time: inventory moves, offers expire, and the approval
 * arrives from a browser that could be sending anything. The amount handed to
 * Razorpay is recomputed here from the catalog — not read from the request, not
 * read from the stored quote, and never from a model.
 */
export const POST = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  const body = (await request.json().catch(() => null)) as { offer_id?: string } | null
  const offerId = body?.offer_id

  if (!offerId) return fail(400, 'Provide the offer_id being approved.')

  const store = await getStore()
  const negotiation = await store.getNegotiation(id)

  if (!negotiation) return fail(404, 'Negotiation not found.')

  const offer = await store.getOffer(offerId)

  if (!offer || offer.negotiation_id !== id) return fail(404, 'Offer not found on this negotiation.')

  if (offer.status === 'purchased') return fail(409, 'This offer has already been paid for.')

  const merchants = await allMerchants()
  const merchant = merchants.find(m => m.id === offer.merchant_id)

  if (!merchant) return fail(409, 'The merchant behind this offer is no longer available.')

  const audit = (
    action: string,
    summary: string,
    decision: 'pass' | 'fail' | 'info',
    detail: Record<string, unknown>
  ) =>
    store.appendAudit({
      id: `evt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      negotiation_id: id,
      ts: new Date().toISOString(),
      actor: action.startsWith('user')
        ? 'user'
        : action.startsWith('guard')
          ? 'commerce_guard'
          : action.startsWith('inventory')
            ? 'system'
            : 'razorpay',
      merchant_id: merchant.id,
      action,
      summary,
      decision,
      detail
    })

  await audit(
    'user_approved_offer',
    `Traveller approved ${merchant.name} at ${formatINR(offer.quote.total_price)}.`,
    'info',
    { offer_id: offer.id, price: offer.quote.total_price }
  )

  /* ---- Re-validate. Nothing below runs unless this passes. ---- */
  const verdict = guardPayment({
    merchant,
    offer,
    intent: negotiation.intent,
    rounds_used: offer.round,
    approved_offer_id: offerId
  })

  await store.saveVerdict({ offer_id: offer.id, negotiation_id: id, stage: 'pre_payment', verdict })

  if (!verdict.authorized) {
    await audit(
      'guard_blocked_payment',
      `Payment blocked before any charge. ${verdict.violations.map(v => v.detail).join(' ')}`,
      'fail',
      { offer_id: offer.id, violations: verdict.violations.map(v => ({ id: v.id, detail: v.detail })) }
    )

    return json(
      {
        error: 'This offer can no longer be purchased.',
        verdict,
        remediation: verdict.violations.some(v => v.id === 'offer_not_expired')
          ? 'The held price has lapsed. Re-run the negotiation to get a fresh quote.'
          : 'Re-run the negotiation — the catalog or the traveller’s constraints have moved.'
      },
      { status: 409 }
    )
  }

  /* ---- Hold the room before any order exists ----
   * The guard checks that inventory is non-zero, but a count nobody decrements
   * is only advisory: two travellers approving the last room would both pass.
   * The hold is taken atomically, and released again if the payment fails.  */
  const room = merchant.rooms.find(r => r.id === offer.bundle.room_id)

  const reservation = room
    ? await store.reserveRoom(
        {
          id: `res_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
          negotiation_id: id,
          offer_id: offer.id,
          merchant_id: merchant.id,
          room_id: room.id,
          status: 'held',
          created_at: new Date().toISOString(),
          expires_at: offer.expires_at
        },
        room.inventory_available
      )
    : null

  if (room && !reservation) {
    await audit(
      'inventory_unavailable',
      `${room.name} at ${merchant.name} was taken while this offer was being considered. Nothing was charged.`,
      'fail',
      { offer_id: offer.id, room_id: room.id, capacity: room.inventory_available }
    )

    return json(
      {
        error: `The last ${room.name} at ${merchant.name} has just been taken.`,
        remediation: 'Re-run the negotiation — the desk will find what is still available.'
      },
      { status: 409 }
    )
  }

  if (reservation)
    await audit(
      'inventory_held',
      `One ${room?.name} held at ${merchant.name} until ${new Date(reservation.expires_at).toLocaleTimeString('en-IN')}.`,
      'pass',
      { reservation_id: reservation.id, room_id: reservation.room_id, expires_at: reservation.expires_at }
    )

  /* ---- Amount is derived here, from the catalog, at this moment. ---- */
  const authoritative = computeQuote(merchant, offer.bundle, offer.quote.nights, offer.quote.travelers)

  const order = await createOrder({
    amount_inr: authoritative.total_price,
    receipt: offer.id.slice(0, 40),
    notes: {
      negotiation_id: id,
      offer_id: offer.id,
      merchant: merchant.name,
      nights: String(authoritative.nights),
      travelers: String(authoritative.travelers)
    }
  })

  await store.savePayment({
    id: `pay_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    negotiation_id: id,
    offer_id: offer.id,
    razorpay_order_id: order.id,
    razorpay_payment_id: null,
    amount: authoritative.total_price,
    currency: 'INR',
    status: 'created',
    failure_reason: null,
    created_at: new Date().toISOString(),
    settled_at: null
  })

  await store.updateNegotiation(id, { status: 'payment_pending', selected_offer_id: offer.id })

  await audit(
    'razorpay_order_created',
    `Razorpay order ${order.id} created for ${formatINR(authoritative.total_price)}${order.simulated ? ' (simulated — no API keys configured)' : ' in test mode'}.`,
    'pass',
    {
      order_id: order.id,
      amount_paise: order.amount,
      amount_inr: authoritative.total_price,
      simulated: order.simulated,
      guard_checks_passed: verdict.checks.filter(c => c.passed).length,
      guard_checks_total: verdict.checks.length
    }
  )

  return json({
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      simulated: order.simulated
    },
    key_id: publicKeyId(),
    razorpay_configured: razorpayConfigured(),
    verdict,
    offer_id: offer.id,
    merchant_name: merchant.name,
    amount_inr: authoritative.total_price
  })
}
