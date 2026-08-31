// Type Imports
import type { TourPackageCategory } from '@/types/packages/tour-package-types'
import { TOUR_PACKAGE_CATEGORY_LIST } from '@/types/packages/tour-package-types'

export type CouponDiscountType = 'percentage' | 'fixed'

export const COUPON_DISCOUNT_TYPE_LIST: CouponDiscountType[] = ['percentage', 'fixed']

export const COUPON_DISCOUNT_TYPE_LABELS: Record<CouponDiscountType, string> = {
  percentage: 'Percentage',
  fixed: 'Fixed'
}

export type CouponStatus = 'active' | 'inactive' | 'expired'

export const COUPON_STATUS_LIST: CouponStatus[] = ['active', 'inactive', 'expired']

export const COUPON_STATUS_STYLES: Record<CouponStatus, { dot: string; text: string; bg: string }> = {
  active: {
    dot: 'bg-green-600 dark:bg-green-400',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-600/10 dark:bg-green-400/10'
  },
  inactive: {
    dot: 'bg-amber-600 dark:bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-600/10 dark:bg-amber-400/10'
  },
  expired: { dot: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10' }
}

export type CouponAppliesTo = 'all' | TourPackageCategory

export const COUPON_APPLIES_TO_LIST: CouponAppliesTo[] = ['all', ...TOUR_PACKAGE_CATEGORY_LIST]

export const COUPON_APPLIES_TO_LABELS: Record<CouponAppliesTo, string> = {
  all: 'All Packages',
  beach: 'Beach',
  adventure: 'Adventure',
  cultural: 'Cultural',
  honeymoon: 'Honeymoon',
  wildlife: 'Wildlife'
}

export interface Coupon {
  id: string
  code: string
  title: string
  description?: string

  image?: string

  discountType: CouponDiscountType
  appliesTo: CouponAppliesTo
  discountValue: number

  usageLimit: number
  usedCount: number
  validFrom: string
  validUntil: string

  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export type CreateCouponInput = Omit<
  Coupon,
  'id' | 'usedCount' | 'isActive' | 'isFeatured' | 'createdAt' | 'updatedAt'
> &
  Partial<Pick<Coupon, 'usedCount' | 'isActive' | 'isFeatured' | 'createdAt' | 'updatedAt'>>

export type UpdateCouponInput = Omit<Coupon, 'id' | 'usedCount' | 'isFeatured' | 'createdAt' | 'updatedAt'>
