'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { CheckIcon, InfoIcon, TagIcon, TicketPercentIcon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { PackageDetail } from '@/types/packages/package-detail-types'
import type { SpecialOffer } from '@/types/pages/home-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

// Store Imports
import { useCouponStore } from '@/store/use-coupon-store'

type PromoCodeSectionProps = {
  packageDetail: PackageDetail
  travelers: number
  onDiscountChange: (discount: number) => void
}

const PromoCodeSection = ({ packageDetail, travelers, onDiscountChange }: PromoCodeSectionProps) => {
  const coupons = useCouponStore(state => state.coupons)
  const appliedCouponCode = useCouponStore(state => state.appliedCouponCode)
  const applyCoupon = useCouponStore(state => state.applyCoupon)
  const clearAppliedCoupon = useCouponStore(state => state.clearAppliedCoupon)

  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)

  const applyCouponOffer = (offer: SpecialOffer) => {
    const baseTotal = packageDetail.price * travelers
    const discount = Math.round((baseTotal * offer.discountPercent) / 100)

    applyCoupon(offer.couponCode)
    setPromoCode(offer.couponCode)
    setPromoDiscount(discount)
    setPromoApplied(true)
    setPromoError('')
    onDiscountChange(discount)
    setIsCouponDialogOpen(false)
    toast.success(`Promo code applied! You saved $${discount.toLocaleString()}`)
  }

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase()

    if (!code) {
      setPromoError('Enter a promo code')

      return
    }

    const offer = coupons.find(c => c.couponCode === code)

    if (!offer) {
      setPromoError('Invalid promo code')

      return
    }

    applyCouponOffer(offer)
  }

  const handleRemovePromo = () => {
    setPromoApplied(false)
    setPromoDiscount(0)
    setPromoCode('')
    setPromoError('')
    clearAppliedCoupon()
    onDiscountChange(0)
  }

  return (
    <Card className='shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-semibold'>Discounts &amp; Promo Codes</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <div className='flex flex-wrap gap-2'>
          <div className='relative min-w-48 flex-1'>
            <TagIcon className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input
              placeholder='CODEXX'
              value={promoCode}
              onChange={e => {
                setPromoCode(e.target.value)
                setPromoError('')
              }}
              className='pl-9'
              disabled={promoApplied}
            />
          </div>
          <Button type='button' variant='outline' onClick={promoApplied ? handleRemovePromo : handleApplyPromo}>
            {promoApplied ? 'Remove' : 'Apply'}
          </Button>
          <Button type='button' variant='outline' onClick={() => setIsCouponDialogOpen(true)}>
            <TicketPercentIcon className='size-4' />
            Coupons
          </Button>
        </div>

        {promoError && (
          <p className='text-destructive flex items-center gap-1.5 text-sm'>
            <InfoIcon className='size-3.5 shrink-0' />
            {promoError}
          </p>
        )}

        {promoApplied && (
          <p className='flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400'>
            <CheckIcon className='size-3.5 shrink-0' />
            Promo code applied! You saved ${promoDiscount.toLocaleString()}
          </p>
        )}

        {!promoApplied && (
          <p className='text-muted-foreground text-xs'>
            Platform promo codes and payment discounts are applied at this stage
          </p>
        )}
      </CardContent>

      <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Available Coupons</DialogTitle>
            <DialogDescription>Pick a coupon to apply its discount to this booking</DialogDescription>
          </DialogHeader>
          <ScrollArea className='max-h-100'>
            <div className='flex flex-col gap-3 pr-3'>
              {coupons.map(offer => {
                const isApplied = offer.couponCode === appliedCouponCode

                return (
                  <div
                    key={offer.id}
                    className='border-primary/40 flex items-center justify-between gap-3 rounded-xl border border-dashed p-3 data-[applied=true]:opacity-60'
                    data-applied={isApplied}
                  >
                    <div className='flex min-w-0 flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-primary text-xs font-medium tracking-widest'>{offer.couponCode}</span>
                        <span className='text-primary text-xs font-semibold'>{offer.discountLabel}</span>
                      </div>
                      <span className='text-sm font-semibold'>{offer.title}</span>
                      <p className='text-muted-foreground text-xs'>{offer.description}</p>
                    </div>
                    <Button
                      type='button'
                      size='sm'
                      variant={isApplied ? 'secondary' : 'outline'}
                      disabled={isApplied}
                      onClick={() => applyCouponOffer(offer)}
                    >
                      {isApplied ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default PromoCodeSection
