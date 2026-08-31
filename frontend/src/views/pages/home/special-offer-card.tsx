'use client'

// Third-party Imports
import { format } from 'date-fns'
import { CalendarIcon, CheckIcon, CopyIcon } from 'lucide-react'

// Type Imports
import type { SpecialOffer } from '@/types/pages/home-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

type SpecialOfferCardProps = {
  offer: SpecialOffer
  isApplied: boolean
  onCopyCode: (couponCode: string) => void
}

const SpecialOfferCard = ({ offer, isApplied, onCopyCode }: SpecialOfferCardProps) => {
  return (
    <Card className='relative w-72 gap-0 overflow-hidden py-0 data-[used=true]:opacity-60' data-used={isApplied}>
      <img src={offer.image} alt={offer.title} className='h-36 w-full object-cover' />

      {isApplied && (
        <Badge
          variant='secondary'
          className='absolute top-3 left-3 gap-1.5 bg-white/90 text-neutral-900 shadow-sm backdrop-blur dark:bg-neutral-900/80 dark:text-neutral-100'
        >
          <CheckIcon className='size-3' />
          Used
        </Badge>
      )}

      <div className='flex flex-1'>
        <CardContent className='flex flex-1 flex-col gap-3 py-4'>
          <div>
            <h3 className='text-primary text-lg font-semibold text-balance'>{offer.title}</h3>
            <p className='text-muted-foreground mt-1 text-xs font-medium tracking-wide uppercase'>Up to</p>
            <p className='text-primary text-3xl font-bold'>{offer.discountLabel}</p>
          </div>

          <p className='text-muted-foreground line-clamp-2 text-sm'>{offer.description}</p>

          <div className='text-muted-foreground mt-auto flex items-center gap-1.5 text-xs'>
            <CalendarIcon className='size-3.5' />
            Valid till {format(new Date(offer.validUntil), 'dd MMM yyyy')}
          </div>
        </CardContent>

        <div className='border-primary/40 flex w-9 shrink-0 items-center justify-center border-l border-dashed'>
          <span
            className='text-primary rotate-180 text-xs font-semibold tracking-widest'
            style={{ writingMode: 'vertical-rl' }}
          >
            {offer.couponCode}
          </span>
        </div>
      </div>

      <CardFooter className='bg-card border-t'>
        <Button
          className='w-full gap-1.5'
          disabled={isApplied}
          onClick={() => onCopyCode(offer.couponCode)}
          aria-label={
            isApplied ? `Coupon code ${offer.couponCode} already used` : `Copy coupon code ${offer.couponCode}`
          }
        >
          {isApplied ? 'Already Used' : 'Copy Code'}
          <CopyIcon className='size-3.5' />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default SpecialOfferCard
