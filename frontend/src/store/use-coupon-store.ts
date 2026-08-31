// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { SpecialOffer } from '@/types/pages/home-types'

// Store Imports
import { useCouponsStore } from '@/store/use-coupons-store'

// Utils Imports
import { getCouponStatus, mapCouponToSpecialOffer } from '@/utils/coupon-utils'

const FEATURED_OFFERS_LIMIT = 4

const computeFeaturedOffers = (): SpecialOffer[] =>
  useCouponsStore
    .getState()
    .items.filter(item => item.isFeatured && getCouponStatus(item) === 'active')
    .slice(0, FEATURED_OFFERS_LIMIT)
    .map(mapCouponToSpecialOffer)

interface CouponState {
  coupons: SpecialOffer[]
  appliedCouponCode: string | null
  applyCoupon: (couponCode: string) => boolean
  clearAppliedCoupon: () => void
}

export const useCouponStore = create<CouponState>()((set, get) => ({
  coupons: computeFeaturedOffers(),
  appliedCouponCode: null,

  applyCoupon: couponCode => {
    const coupon = get().coupons.find(c => c.couponCode === couponCode)

    if (!coupon) return false

    set({ appliedCouponCode: coupon.couponCode })

    return true
  },

  clearAppliedCoupon: () => set({ appliedCouponCode: null })
}))

useCouponsStore.subscribe(() => {
  useCouponStore.setState({ coupons: computeFeaturedOffers() })
})
