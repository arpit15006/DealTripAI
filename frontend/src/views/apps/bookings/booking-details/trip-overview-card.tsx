// Third-party Imports
import { addDays, format } from 'date-fns'
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from 'lucide-react'

// Type Imports
import type { Booking } from '@/types/account/booking-types'

// Component Imports
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Utils Imports
import { cn } from '@/lib/utils'
import {
  BOOKING_STATUS_BADGE_CLASSNAME,
  BOOKING_STATUS_BADGE_VARIANT,
  BOOKING_STATUS_LABEL
} from '@/utils/booking-utils'

type TripOverviewCardProps = {
  booking: Booking
}

const TripOverviewCard = ({ booking }: TripOverviewCardProps) => {
  const travelDate = new Date(`${booking.travelDate}T00:00:00`)
  const returnDate = addDays(travelDate, Math.max(booking.packageDays - 1, 0))

  return (
    <Card className='shadow-none'>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Trip Overview</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex items-start justify-between gap-4 max-sm:flex-col'>
          <div className='flex items-center gap-4'>
            <div className='size-20 shrink-0 overflow-hidden rounded-xl'>
              <img src={booking.packageImage} alt={booking.packageTitle} className='size-full object-cover' />
            </div>
            <div className='min-w-0 space-y-2'>
              <Badge
                variant={BOOKING_STATUS_BADGE_VARIANT[booking.status]}
                className={cn(BOOKING_STATUS_BADGE_CLASSNAME[booking.status])}
              >
                {BOOKING_STATUS_LABEL[booking.status]}
              </Badge>
              <div>
                <p className='text-base font-semibold'>{booking.packageTitle}</p>
                <div className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                  <MapPinIcon className='size-3.5 shrink-0' />
                  {booking.packageLocation}
                </div>
              </div>
            </div>
          </div>
          <div className='sm:text-right'>
            <p className='text-muted-foreground text-xs'>Booking ID</p>
            <p className='font-mono text-sm font-semibold'>{booking.bookingRef}</p>
          </div>
        </div>

        <Separator />

        <div className='grid grid-cols-2 items-center gap-4 text-sm sm:grid-cols-4'>
          <div className='flex flex-col gap-1'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <CalendarIcon className='size-3.5' />
              Travel Date
            </div>
            <p className='font-semibold'>{format(travelDate, 'dd MMM yyyy')}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <CalendarIcon className='size-3.5' />
              Return Date
            </div>
            <p className='font-semibold'>{format(returnDate, 'dd MMM yyyy')}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <ClockIcon className='size-3.5' />
              Duration
            </div>
            <p className='font-semibold'>
              {booking.packageDays}D / {booking.packageNights}N
            </p>
          </div>
          <div className='flex flex-col gap-1'>
            <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
              <UsersIcon className='size-3.5' />
              Members
            </div>
            <p className='font-semibold'>
              {booking.travelers} {booking.travelers === 1 ? 'Traveler' : 'Travelers'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TripOverviewCard
