// Third-party Imports
import {
  CalendarCheckIcon,
  CheckIcon,
  ClipboardCheckIcon,
  CreditCardIcon,
  PackageSearchIcon,
  UsersIcon
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Type Imports
import type { Booking, TrackingStage } from '@/types/account/booking-types'
import { TRACKING_STAGE_DESCRIPTIONS, TRACKING_STAGE_LABELS, TRACKING_STAGE_LIST } from '@/types/account/booking-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Utils Imports
import { cn } from '@/lib/utils'
import { deriveTrackingStage } from '@/utils/booking-utils'

type StageStatus = 'completed' | 'active' | 'upcoming'

const STAGE_ICONS: Record<TrackingStage, LucideIcon> = {
  'package-selection': PackageSearchIcon,
  'travelers-information': UsersIcon,
  payment: CreditCardIcon,
  'confirm-booking': ClipboardCheckIcon,
  'pre-trip-meeting': CalendarCheckIcon
}

const getStageStatus = (stage: TrackingStage, currentStage: TrackingStage): StageStatus => {
  const stageIndex = TRACKING_STAGE_LIST.indexOf(stage)
  const currentIndex = TRACKING_STAGE_LIST.indexOf(currentStage)

  if (stageIndex === currentIndex) return 'active'
  if (stageIndex < currentIndex) return 'completed'

  return 'upcoming'
}

type BookingTimelineProps = {
  booking: Booking
}

const BookingTimeline = ({ booking }: BookingTimelineProps) => {
  const currentStage = deriveTrackingStage(booking.status)

  if (!currentStage) return null

  const formattedBookedAt = new Date(booking.bookedAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return (
    <Card>
      <CardContent className='flex flex-col gap-1'>
        <div className='mb-4'>
          <p className='font-semibold'>{booking.packageTitle}</p>
          <p className='text-muted-foreground text-sm'>Ref: {booking.bookingRef}</p>
        </div>

        <div className='flex flex-col'>
          {TRACKING_STAGE_LIST.map((stage, index) => {
            const status = getStageStatus(stage, currentStage)
            const isLast = index === TRACKING_STAGE_LIST.length - 1
            const Icon = STAGE_ICONS[stage]

            return (
              <div key={stage} className='flex gap-4'>
                <div className='flex flex-col items-center'>
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                      status === 'completed' &&
                        'border-primary bg-primary text-primary-foreground shadow-primary/30 shadow-sm',
                      status === 'active' && 'border-primary bg-primary/10 text-primary animate-pulse',
                      status === 'upcoming' && 'border-muted-foreground/30 bg-muted text-muted-foreground'
                    )}
                  >
                    {status === 'completed' ? (
                      <CheckIcon className='size-4' strokeWidth={2.5} />
                    ) : (
                      <Icon className='size-4' />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        'my-1 h-12 w-0.5 flex-1 rounded-full transition-all duration-500',
                        status === 'completed' ? 'bg-primary' : 'bg-muted-foreground/20'
                      )}
                    />
                  )}
                </div>
                <div className={cn('pb-9', isLast && 'pb-0')}>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p
                      className={cn(
                        'text-base font-medium',
                        status === 'completed' && 'text-primary',
                        status === 'active' && 'text-foreground font-semibold',
                        status === 'upcoming' && 'text-muted-foreground'
                      )}
                    >
                      {TRACKING_STAGE_LABELS[stage]}
                    </p>
                    {status === 'completed' && (
                      <span className='text-muted-foreground text-xs'>{formattedBookedAt}</span>
                    )}
                    {status === 'active' && (
                      <Badge variant='outline' className='text-primary border-primary/30 text-xs'>
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <p className='text-muted-foreground mt-0.5 text-sm'>{TRACKING_STAGE_DESCRIPTIONS[stage]}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingTimeline
