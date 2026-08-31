'use client'

// React Imports
import { useEffect } from 'react'

// Third-party Imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toast } from 'sonner'

// Type Imports
import type { Coupon, CouponAppliesTo, CouponDiscountType, UpdateCouponInput } from '@/types/apps/coupon-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import CouponFormFields from '@/views/apps/coupons-promotions/coupon-form-fields'
import type { CouponFormValues } from '@/views/apps/coupons-promotions/coupon-form-schema'
import { buildCouponFormDefaultValues, couponSchema } from '@/views/apps/coupons-promotions/coupon-form-schema'

// Store Imports
import { useCouponsStore } from '@/store/use-coupons-store'

type CouponEditSheetProps = {
  coupon: Coupon
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CouponEditSheet = ({ coupon, open, onOpenChange }: CouponEditSheetProps) => {
  const items = useCouponsStore(state => state.items)
  const updateCoupon = useCouponsStore(state => state.updateCoupon)

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: buildCouponFormDefaultValues(coupon)
  })

  useEffect(() => {
    if (open) reset(buildCouponFormDefaultValues(coupon))
  }, [open, coupon, reset])

  const onSubmit = (values: CouponFormValues) => {
    const normalizedCode = values.code.trim().toUpperCase()

    const isDuplicateCode = items.some(item => item.code === normalizedCode && item.id !== coupon.id)

    if (isDuplicateCode) {
      setError('code', { message: 'This code is already in use' })

      return
    }

    const input: UpdateCouponInput = {
      code: normalizedCode,
      title: values.title,
      description: values.description || undefined,
      image: values.image || undefined,
      discountType: values.discountType as CouponDiscountType,
      discountValue: values.discountValue,
      appliesTo: values.appliesTo as CouponAppliesTo,
      usageLimit: values.usageLimit,
      validFrom: format(values.validFrom, 'yyyy-MM-dd'),
      validUntil: format(values.validUntil, 'yyyy-MM-dd'),
      isActive: values.isActive
    }

    updateCoupon(coupon.id, input)
    toast.success('Coupon updated')
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-2xl!'>
        <SheetHeader>
          <SheetTitle>Edit Coupon</SheetTitle>
          <SheetDescription>Update the details of &ldquo;{coupon.code}&rdquo;.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0 flex-1 overflow-y-auto px-4'>
            <CouponFormFields control={control} errors={errors} />
          </div>

          <SheetFooter className='flex-row justify-end'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              Save Changes
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default CouponEditSheet
