// Third-party Imports
import { CreditCardIcon, SmartphoneIcon, TagIcon } from 'lucide-react'

// Type Imports
import type { Booking } from '@/types/account/booking-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// Utils Imports
import { cn } from '@/lib/utils'
import { derivePaymentStatus, PAYMENT_STATUS_CLASSNAME, PAYMENT_STATUS_LABEL } from '@/utils/booking-utils'

type PriceBreakdownCardProps = {
  booking: Booking
}

const PriceBreakdownCard = ({ booking }: PriceBreakdownCardProps) => {
  const discountAmount = booking.discountAmount ?? 0
  const baseAmount = booking.baseAmount ?? booking.totalAmount + discountAmount
  const paymentStatus = derivePaymentStatus(booking.status)

  return (
    <Card className='bg-muted/60 shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-semibold'>Price Breakdown</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground'>Package Price</span>
            <span>${baseAmount.toLocaleString()}</span>
          </div>

          {booking.couponCode && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground flex items-center gap-1.5'>
                <TagIcon className='size-3.5' />
                Coupon Applied
              </span>
              <Badge variant='outline' className='font-mono text-xs'>
                {booking.couponCode}
              </Badge>
            </div>
          )}

          {discountAmount > 0 && (
            <div className='flex items-center justify-between text-sm'>
              <span className='font-medium text-green-600 dark:text-green-400'>Discount</span>
              <span className='font-medium text-green-600 dark:text-green-400'>
                −${discountAmount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className='flex items-center justify-between'>
          <span className='font-semibold'>Final Amount</span>
          <span className='text-primary text-xl font-bold'>${booking.totalAmount.toLocaleString()}</span>
        </div>

        <Separator />

        <div className='flex items-center justify-between text-sm'>
          <span className='text-muted-foreground'>Payment Status</span>
          <Badge variant='outline' className={cn(PAYMENT_STATUS_CLASSNAME[paymentStatus])}>
            {PAYMENT_STATUS_LABEL[paymentStatus]}
          </Badge>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-muted-foreground flex items-center gap-1.5'>
            {booking.paymentResult.method === 'card' ? (
              <CreditCardIcon className='size-3.5' />
            ) : (
              <SmartphoneIcon className='size-3.5' />
            )}
            Payment Method
          </span>
          <span className='font-medium'>
            {booking.paymentResult.method === 'card' ? `Card •••• ${booking.paymentResult.cardLast4 ?? '----'}` : 'UPI'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default PriceBreakdownCard
