// Third-party Imports
import { format } from 'date-fns'
import { CalendarIcon, ClockIcon, MapPinIcon, TagIcon, UsersIcon } from 'lucide-react'

// Type Imports
import type { PackageDetail } from '@/types/packages/package-detail-types'

// Component Imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import PackageTypeBadge from '@/views/packages/checkout/package-type-badge'

type OrderSummaryCardProps = {
  packageDetail: PackageDetail
  travelers: number
  travelDate: string
  promoDiscount: number
}

const OrderSummaryCard = ({ packageDetail, travelers, travelDate, promoDiscount }: OrderSummaryCardProps) => {
  const baseTotal = packageDetail.price * travelers
  const finalTotal = baseTotal - promoDiscount

  const formattedDate = (() => {
    try {
      return format(new Date(travelDate), 'dd MMM yyyy')
    } catch {
      return travelDate
    }
  })()

  return (
    <Card className='bg-muted/60 lg:sticky lg:top-35'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-semibold'>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex items-start gap-3'>
          <div className='relative size-16 shrink-0 overflow-hidden rounded-xl'>
            <img src={packageDetail.images[0]} alt={packageDetail.title} className='size-full object-cover' />
          </div>
          <div className='min-w-0'>
            <p className='line-clamp-2 text-sm leading-snug font-semibold'>{packageDetail.title}</p>
            <div className='mt-1.5 flex flex-wrap gap-1'>
              <PackageTypeBadge packageType={packageDetail.packageType} className='text-xs' />
            </div>
          </div>
        </div>

        <Separator />

        <div className='flex flex-col gap-2.5'>
          <div className='flex items-center gap-2 text-sm'>
            <MapPinIcon className='text-muted-foreground size-3.5 shrink-0' />
            <span className='text-muted-foreground'>Location</span>
            <span className='ml-auto font-medium'>{packageDetail.location}</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <CalendarIcon className='text-muted-foreground size-3.5 shrink-0' />
            <span className='text-muted-foreground'>Date</span>
            <span className='ml-auto font-medium'>{formattedDate}</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <ClockIcon className='text-muted-foreground size-3.5 shrink-0' />
            <span className='text-muted-foreground'>Duration</span>
            <span className='ml-auto font-medium'>
              {packageDetail.days}D / {packageDetail.nights}N
            </span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <UsersIcon className='text-muted-foreground size-3.5 shrink-0' />
            <span className='text-muted-foreground'>Travelers</span>
            <span className='ml-auto font-medium'>
              {travelers} {travelers === 1 ? 'person' : 'people'}
            </span>
          </div>
        </div>

        <Separator />

        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-muted-foreground flex items-center gap-1.5'>
              {packageDetail.originalPrice && (
                <span className='line-through'>${packageDetail.originalPrice.toLocaleString()}</span>
              )}
              ${packageDetail.price.toLocaleString()} &times; {travelers}
            </span>
            <span>${baseTotal.toLocaleString()}</span>
          </div>
          {promoDiscount > 0 && (
            <div className='flex items-center justify-between text-sm'>
              <span className='flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400'>
                <TagIcon className='size-3.5' />
                Promo discount
              </span>
              <span className='font-medium text-green-600 dark:text-green-400'>−${promoDiscount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className='flex items-center justify-between'>
          <span className='font-semibold'>Total</span>
          <span className='text-primary text-xl font-bold'>${finalTotal.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderSummaryCard
