// Type Imports
import type { SpecialOffer } from '@/types/pages/home-types'

export const resolveCoupon = (
  rawCode: string,
  coupons: SpecialOffer[],
  baseAmount: number
): { amount: number; code: string | undefined; valid: boolean } => {
  const trimmed = rawCode.trim()

  if (!trimmed) return { amount: 0, code: undefined, valid: true }

  const coupon = coupons.find(item => item.couponCode === trimmed.toUpperCase())

  if (!coupon) return { amount: 0, code: undefined, valid: false }

  return { amount: Math.round((baseAmount * coupon.discountPercent) / 100), code: coupon.couponCode, valid: true }
}

export const generateBookingRef = () => {
  const ts = Date.now().toString(36).toUpperCase().slice(-6)
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `TRV-${ts}-${rnd}`
}
