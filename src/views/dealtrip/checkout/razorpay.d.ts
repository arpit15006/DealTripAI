/** Razorpay Checkout is loaded from their CDN at runtime, so it needs declaring. */
export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description: string
  theme?: { color?: string }
  prefill?: { name?: string; email?: string; contact?: string }
  notes?: Record<string, string>
  handler: (response: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => void
  modal?: { ondismiss?: () => void }
}

export interface RazorpayInstance {
  open: () => void
  on: (event: string, handler: (response: { error?: { description?: string; code?: string } }) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}
