// Third-party Imports
import { format } from 'date-fns'

// Type Imports
import type { Coupon, CouponStatus } from '@/types/apps/coupon-types'
import type { SpecialOffer } from '@/types/pages/home-types'

export const getCouponStatus = (coupon: Coupon, referenceDate: Date = new Date()): CouponStatus => {
  if (coupon.validUntil < format(referenceDate, 'yyyy-MM-dd')) return 'expired'

  return coupon.isActive ? 'active' : 'inactive'
}

export const formatCouponDiscount = (coupon: Pick<Coupon, 'discountType' | 'discountValue'>): string =>
  coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`

const COUPON_BANNER_IMAGES = [
  '/images/coupons/coupon-1.webp',
  '/images/coupons/coupon-2.webp',
  '/images/coupons/coupon-3.webp',
  '/images/coupons/coupon-4.webp'
]

export const getCouponBannerImage = (coupon: Pick<Coupon, 'id' | 'image'>): string => {
  if (coupon.image) return coupon.image

  const hash = [...coupon.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return COUPON_BANNER_IMAGES[hash % COUPON_BANNER_IMAGES.length]
}

export const mapCouponToSpecialOffer = (coupon: Coupon): SpecialOffer => ({
  id: coupon.id,
  title: coupon.title,
  discountLabel: `${formatCouponDiscount(coupon)} OFF`,
  description: coupon.description || "Limited-time offer — don't miss out.",
  couponCode: coupon.code,
  validUntil: coupon.validUntil,
  image: getCouponBannerImage(coupon),
  discountPercent: coupon.discountType === 'percentage' ? coupon.discountValue : 0
})
