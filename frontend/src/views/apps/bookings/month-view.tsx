'use client'

// React Imports
import { useMemo } from 'react'

// Third-party Imports
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek
} from 'date-fns'

// Type Imports
import type { TourCalendarEvent } from '@/types/packages/tour-calendar-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import EventItem from './event-item'

// Utils Imports
import { getAllEventsForDay, getEventsForDay, getSpanningEventsForDay, sortEvents } from '@/utils/tour-calendar-utils'

const MAX_VISIBLE_EVENTS_PER_DAY = 3

type MonthViewProps = {
  currentDate: Date
  events: TourCalendarEvent[]
  onEventSelect: (event: TourCalendarEvent) => void
}

const MonthView = ({ currentDate, events, onEventSelect }: MonthViewProps) => {
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const result: Date[][] = []

    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7))
    }

    return result
  }, [currentDate])

  const weekdays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 })

    return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'EEE'))
  }, [])

  const handleEventClick = (event: TourCalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation()
    onEventSelect(event)
  }

  return (
    <div className='contents'>
      <div className='border-border/70 grid grid-cols-7 border-b'>
        {weekdays.map(day => (
          <div key={day} className='text-muted-foreground/70 py-2 text-center text-sm'>
            {day}
          </div>
        ))}
      </div>
      <div className='grid flex-1 auto-rows-fr'>
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className='grid grid-cols-7 [&:last-child>*]:border-b-0'>
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(events, day)
              const spanningEvents = getSpanningEventsForDay(events, day)
              const allDayEvents = sortEvents([...spanningEvents, ...dayEvents])
              const allEvents = sortEvents(getAllEventsForDay(events, day))
              const isCurrentMonth = isSameMonth(day, currentDate)

              const visibleEvents = allDayEvents.slice(0, MAX_VISIBLE_EVENTS_PER_DAY)
              const remainingCount = allDayEvents.length - visibleEvents.length

              return (
                <div
                  key={day.toISOString()}
                  className='group border-border/70 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70 border-r border-b p-1 last:border-r-0'
                  data-today={isToday(day) || undefined}
                  data-outside-cell={!isCurrentMonth || undefined}
                >
                  <div className='group-data-today:bg-primary group-data-today:text-primary-foreground mt-1 inline-flex size-6 items-center justify-center rounded-full text-sm'>
                    {format(day, 'd')}
                  </div>
                  <div className='min-h-[calc((var(--event-height)+var(--event-gap))*2)] overflow-visible sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]'>
                    {visibleEvents.map(event => {
                      const isFirstDay = isSameDay(day, event.start)
                      const isLastDay = isSameDay(day, event.end)
                      const spansRight = !isLastDay && dayIndex < 6
                      const spansLeft = !isFirstDay && dayIndex > 0

                      return (
                        <EventItem
                          key={`${event.id}-${day.toISOString()}`}
                          event={event}
                          view='month'
                          onClick={e => handleEventClick(event, e)}
                          isFirstDay={isFirstDay}
                          isLastDay={isLastDay}
                          spansLeft={spansLeft}
                          spansRight={spansRight}
                        />
                      )
                    })}

                    {remainingCount > 0 && (
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              variant='ghost'
                              onClick={e => e.stopPropagation()}
                              className='text-muted-foreground hover:text-foreground mt-[var(--event-gap)] h-[var(--event-height)] w-full items-center justify-start px-1 text-[10px] font-normal sm:px-2 sm:text-xs'
                            />
                          }
                        >
                          <span>
                            + {remainingCount} <span className='max-sm:sr-only'>more</span>
                          </span>
                        </PopoverTrigger>
                        <PopoverContent align='center' className='max-w-56 p-3'>
                          <div className='space-y-2'>
                            <div className='text-sm font-medium'>{format(day, 'EEE d')}</div>
                            <div className='space-y-1.5'>
                              {allEvents.map(event => (
                                <EventItem
                                  key={event.id}
                                  event={event}
                                  view='month'
                                  onClick={e => handleEventClick(event, e)}
                                  isFirstDay={isSameDay(day, event.start)}
                                  isLastDay={isSameDay(day, event.end)}
                                />
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MonthView
