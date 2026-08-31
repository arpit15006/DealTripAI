'use client'

// Third-party Imports
import { toast } from 'sonner'

// Component Imports
import { Badge } from '@/components/ui/badge'
import SpecialOfferCard from '@/views/pages/home/special-offer-card'

// Store Imports
import { useCouponStore } from '@/store/use-coupon-store'

const SpecialOffers = () => {
  const specialOffers = useCouponStore(state => state.coupons)
  const appliedCouponCode = useCouponStore(state => state.appliedCouponCode)

  if (specialOffers.length === 0) return null

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode)
    toast.success(`Coupon code "${couponCode}" copied!`)
  }

  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-360 px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <Badge className='h-auto text-sm font-normal' variant='outline'>
            Gifts
          </Badge>
          <h2 className='text-3xl font-bold'>Special Offers & Coupons</h2>
          <p className='text-muted-foreground'>Limited-time deals to make your next trip more affordable.</p>
        </div>
        <div className='flex flex-wrap justify-center gap-6'>
          {specialOffers.map(offer => (
            <SpecialOfferCard
              key={offer.id}
              offer={offer}
              isApplied={offer.couponCode === appliedCouponCode}
              onCopyCode={handleCopyCode}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default SpecialOffers
