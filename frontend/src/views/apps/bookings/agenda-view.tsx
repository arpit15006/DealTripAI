'use client'

// React Imports
import { useMemo } from 'react'

// Third-party Imports
import { addDays, format, isToday } from 'date-fns'
import { CalendarXIcon } from 'lucide-react'

// Type Imports
import type { TourCalendarEvent } from '@/types/packages/tour-calendar-types'

// Component Imports
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import EventItem from './event-item'

// Store Imports
import { AGENDA_DAYS_TO_SHOW } from '@/store/use-tour-calendar-store'

// Utils Imports
import { getAllEventsForDay, sortEvents } from '@/utils/tour-calendar-utils'

type AgendaViewProps = {
  currentDate: Date
  events: TourCalendarEvent[]
  onEventSelect: (event: TourCalendarEvent) => void
}

const AgendaView = ({ currentDate, events, onEventSelect }: AgendaViewProps) => {
  const days = useMemo(
    () => Array.from({ length: AGENDA_DAYS_TO_SHOW }, (_, i) => addDays(new Date(currentDate), i)),
    [currentDate]
  )

  const handleEventClick = (event: TourCalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  const hasEvents = days.some(day => getAllEventsForDay(events, day).length > 0)

  if (!hasEvents) {
    return (
      <Empty className='min-h-[70svh]'>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <CalendarXIcon />
          </EmptyMedia>
          <EmptyTitle>No departures found</EmptyTitle>
          <EmptyDescription>There are no departures scheduled for this period.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className='border-border/70 border-t px-4'>
      {days.map(day => {
        const dayEvents = sortEvents(getAllEventsForDay(events, day))

        if (dayEvents.length === 0) return null

        return (
          <div key={day.toISOString()} className='border-border/70 relative my-12 border-t'>
            <span
              className='bg-background absolute -top-3 left-0 flex h-6 items-center pe-4 text-[10px] uppercase data-today:font-medium sm:pe-4 sm:text-xs'
              data-today={isToday(day) || undefined}
            >
              {format(day, 'd MMM, EEEE')}
            </span>
            <div className='mt-6 space-y-2'>
              {dayEvents.map(event => (
                <EventItem key={event.id} event={event} view='agenda' onClick={e => handleEventClick(event, e)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AgendaView
