'use client'

// Third-party Imports
import { isPast } from 'date-fns'
import { MapPinIcon, UsersIcon } from 'lucide-react'

// Type Imports
import type { TourCalendarEvent } from '@/types/packages/tour-calendar-types'

// Component Imports
import { Button } from '@/components/ui/button'

// Utils Imports
import { cn } from '@/lib/utils'
import {
  getBorderRadiusClasses,
  getCategoryColorClasses,
  getMonthViewBleedClasses,
  getMonthViewEventPaddingClasses
} from '@/utils/tour-calendar-utils'

type EventItemProps = {
  event: TourCalendarEvent
  view: 'month' | 'agenda'
  onClick: (e: React.MouseEvent) => void
  isFirstDay?: boolean
  isLastDay?: boolean
  spansLeft?: boolean
  spansRight?: boolean
}

const EventItem = ({
  event,
  view,
  onClick,
  isFirstDay = true,
  isLastDay = true,
  spansLeft = false,
  spansRight = false
}: EventItemProps) => {
  const isPastEvent = isPast(event.end)

  if (view === 'month') {
    return (
      <div className='relative mt-[var(--event-gap)] w-full'>
        <Button
          variant='ghost'
          onClick={onClick}
          data-past-event={isPastEvent || undefined}
          className={cn(
            'relative h-[var(--event-height)] w-full min-w-0 items-center justify-start overflow-hidden border-0 text-[10px] font-medium data-[past-event=true]:opacity-60 sm:text-xs',
            getCategoryColorClasses(event.category),
            getBorderRadiusClasses(isFirstDay, isLastDay),
            getMonthViewBleedClasses(spansRight),
            getMonthViewEventPaddingClasses(spansLeft, spansRight)
          )}
        >
          {isFirstDay ? (
            <span className='relative z-10 block min-w-0 flex-1 truncate'>{event.title}</span>
          ) : (
            <span className='sr-only'>{event.title}</span>
          )}
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant='ghost'
      onClick={onClick}
      data-past-event={isPastEvent || undefined}
      className={cn(
        'h-auto w-full flex-col items-start justify-start gap-1.5 rounded-lg border-0 p-3 text-left data-[past-event=true]:opacity-70',
        getCategoryColorClasses(event.category)
      )}
    >
      <span className='truncate text-sm font-semibold'>{event.title}</span>
      <span className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-80'>
        <span className='flex items-center gap-1'>
          <MapPinIcon className='size-3' />
          {event.location}
        </span>
        <span className='flex items-center gap-1'>
          <UsersIcon className='size-3' />
          {event.travelers} {event.travelers === 1 ? 'traveler' : 'travelers'}
        </span>
      </span>
    </Button>
  )
}

export default EventItem
