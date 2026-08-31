'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { CouponAppliesTo, CouponDiscountType, CreateCouponInput } from '@/types/apps/coupon-types'

// Component Imports
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import CouponFormFields from '@/views/apps/coupons-promotions/coupon-form-fields'
import type { CouponFormValues } from '@/views/apps/coupons-promotions/coupon-form-schema'
import { buildBlankCouponFormValues, couponSchema } from '@/views/apps/coupons-promotions/coupon-form-schema'

// Store Imports
import { useCouponsStore } from '@/store/use-coupons-store'

const CouponCreateSheet = () => {
  const items = useCouponsStore(state => state.items)
  const addCoupon = useCouponsStore(state => state.addCoupon)

  const [open, setOpen] = useState(false)

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: buildBlankCouponFormValues()
  })

  const onSubmit = (values: CouponFormValues) => {
    const normalizedCode = values.code.trim().toUpperCase()

    const isDuplicateCode = items.some(item => item.code === normalizedCode)

    if (isDuplicateCode) {
      setError('code', { message: 'This code is already in use' })

      return
    }

    const input: CreateCouponInput = {
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

    addCoupon(input)
    toast.success(`${normalizedCode} created`)
    setOpen(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen)
        if (!nextOpen) reset(buildBlankCouponFormValues())
      }}
    >
      <SheetTrigger render={<Button />}>
        <PlusIcon className='size-4' />
        New Coupon
      </SheetTrigger>
      <SheetContent className='w-full sm:max-w-2xl!'>
        <SheetHeader>
          <SheetTitle>New Coupon</SheetTitle>
          <SheetDescription>Create a new discount coupon.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0 flex-1 overflow-y-auto px-4'>
            <CouponFormFields control={control} errors={errors} />
          </div>

          <SheetFooter className='flex-row justify-end'>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              Create Coupon
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default CouponCreateSheet
