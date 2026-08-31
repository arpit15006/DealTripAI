// Third-party Imports
import { addDays } from 'date-fns'
import { z } from 'zod'

// Type Imports
import type { Coupon } from '@/types/apps/coupon-types'
import { COUPON_APPLIES_TO_LABELS, COUPON_APPLIES_TO_LIST, COUPON_DISCOUNT_TYPE_LIST } from '@/types/apps/coupon-types'

export const DISCOUNT_TYPE_OPTIONS = COUPON_DISCOUNT_TYPE_LIST.map(value => ({ label: value, value }))
export const APPLIES_TO_OPTIONS = COUPON_APPLIES_TO_LIST.map(value => ({
  label: COUPON_APPLIES_TO_LABELS[value],
  value
}))

export const couponSchema = z
  .object({
    code: z.string().min(3, 'Code must be at least 3 characters').max(20, 'Code must be 20 characters or fewer'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    image: z.string().optional(),
    discountType: z.enum(COUPON_DISCOUNT_TYPE_LIST as [string, ...string[]]),
    discountValue: z.number().min(1, 'Enter a value greater than 0'),
    appliesTo: z.enum(COUPON_APPLIES_TO_LIST as [string, ...string[]]),
    usageLimit: z.number().int().min(1, 'Must allow at least 1 use'),
    validFrom: z.date(),
    validUntil: z.date(),
    isActive: z.boolean()
  })
  .refine(data => data.validUntil >= data.validFrom, {
    message: 'Must be on or after the valid-from date',
    path: ['validUntil']
  })
  .refine(data => data.discountType !== 'percentage' || data.discountValue <= 100, {
    message: 'Percentage discount cannot exceed 100%',
    path: ['discountValue']
  })

export type CouponFormValues = z.infer<typeof couponSchema>

export const buildCouponFormDefaultValues = (coupon: Coupon): CouponFormValues => ({
  code: coupon.code,
  title: coupon.title,
  description: coupon.description ?? '',
  image: coupon.image ?? '',
  discountType: coupon.discountType,
  discountValue: coupon.discountValue,
  appliesTo: coupon.appliesTo,
  usageLimit: coupon.usageLimit,
  validFrom: new Date(coupon.validFrom),
  validUntil: new Date(coupon.validUntil),
  isActive: coupon.isActive
})

const DEFAULT_VALIDITY_DAYS = 30

export const buildBlankCouponFormValues = (): CouponFormValues => ({
  code: '',
  title: '',
  description: '',
  image: '',
  discountType: 'percentage',
  discountValue: 15,
  appliesTo: 'all',
  usageLimit: 100,
  validFrom: new Date(),
  validUntil: addDays(new Date(), DEFAULT_VALIDITY_DAYS),
  isActive: true
})
