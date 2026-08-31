// Third-party Imports
import type { LucideIcon } from 'lucide-react'
import { CompassIcon, HeartIcon, LandmarkIcon, LayoutGridIcon, PawPrintIcon, UmbrellaIcon } from 'lucide-react'

// Type Imports
import type { CouponAppliesTo } from '@/types/apps/coupon-types'

export const COUPON_BOARD_ICONS: Record<CouponAppliesTo, LucideIcon> = {
  all: LayoutGridIcon,
  beach: UmbrellaIcon,
  adventure: CompassIcon,
  cultural: LandmarkIcon,
  honeymoon: HeartIcon,
  wildlife: PawPrintIcon
}

export const COUPON_BOARD_SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Highest Discount', value: 'discount' },
  { label: 'Ending Soon', value: 'ending-soon' }
] as const

export type CouponBoardSortValue = (typeof COUPON_BOARD_SORT_OPTIONS)[number]['value']
