/**
 * Razorpay integration (test mode).
 *
 * The agent never charges anyone. The only path to a charge is:
 *
 *   traveller approves a specific offer id
 *     → server re-runs the Commerce Guard on that exact offer
 *       → server creates the Razorpay Order, from the server-recomputed amount
 *         → Checkout runs in the traveller's browser
 *           → server verifies the signature before anything is called booked
 *
 * The amount sent to Razorpay is recomputed from the catalog at order time. It
 * is never taken from the client, and never from a model.
 */
import crypto from 'node:crypto'

import Razorpay from 'razorpay'

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
  /** true when no API keys are configured and the order is a local stand-in. */
  simulated: boolean
}

export const razorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

export const publicKeyId = () =>
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID ?? ''

const client = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string
  })

/**
 * Create an order for a rupee amount. Razorpay works in paise, so the
 * conversion happens exactly once, here.
 */
export const createOrder = async (args: {
  amount_inr: number
  receipt: string
  notes: Record<string, string>
}): Promise<RazorpayOrder> => {
  const amountPaise = Math.round(args.amount_inr * 100)

  if (!razorpayConfigured()) {
    // Keys absent: keep the whole flow exercisable, but say so loudly rather
    // than dressing a stub up as a real payment.
    return {
      id: `order_sim_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      amount: amountPaise,
      currency: 'INR',
      receipt: args.receipt,
      status: 'created',
      simulated: true
    }
  }

  const order = await client().orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: args.receipt,
    notes: args.notes
  })

  return {
    id: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    receipt: String(order.receipt ?? args.receipt),
    status: order.status,
    simulated: false
  }
}

/**
 * Verify a Checkout callback. Razorpay signs `order_id|payment_id` with the key
 * secret; a payment whose signature does not match is treated as unpaid.
 * Compared in constant time so the check cannot be probed byte by byte.
 */
export const verifyPaymentSignature = (args: {
  order_id: string
  payment_id: string
  signature: string
}): boolean => {
  if (!razorpayConfigured()) return args.order_id.startsWith('order_sim_')

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${args.order_id}|${args.payment_id}`)
    .digest('hex')

  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(args.signature ?? '', 'utf8')

  if (a.length !== b.length) return false

  return crypto.timingSafeEqual(a, b)
}

/**
 * Ask Razorpay what it thinks the payment's state is, rather than trusting the
 * browser's word for it. Used to confirm the captured amount matches the order.
 */
export const fetchPayment = async (paymentId: string) => {
  if (!razorpayConfigured()) return null

  try {
    return await client().payments.fetch(paymentId)
  } catch (error) {
    console.error('[dealtrip:razorpay] payment fetch failed', error)

    return null
  }
}
