// Third-party Imports
import { addDays, isSameDay } from 'date-fns'

// Type Imports
import type { Booking } from '@/types/account/booking-types'
import type { TourCalendarEvent } from '@/types/packages/tour-calendar-types'
import type { TourPackage, TourPackageCategory } from '@/types/packages/tour-package-types'

// Utils Imports
import { cn } from '@/lib/utils'

export const CATEGORY_FILTER_OPTIONS: { value: TourPackageCategory; label: string; dotClass: string }[] = [
  { value: 'beach', label: 'Beach', dotClass: 'bg-sky-400' },
  { value: 'adventure', label: 'Adventure', dotClass: 'bg-emerald-400' },
  { value: 'cultural', label: 'Cultural', dotClass: 'bg-amber-400' },
  { value: 'honeymoon', label: 'Honeymoon', dotClass: 'bg-rose-400' },
  { value: 'wildlife', label: 'Wildlife', dotClass: 'bg-violet-400' }
]

export const buildTourCalendarEvents = (bookings: Booking[], packages: TourPackage[]): TourCalendarEvent[] => {
  const packageBySlug = new Map(packages.map(tourPackage => [tourPackage.slug, tourPackage]))

  return bookings.reduce<TourCalendarEvent[]>((events, booking) => {
    if (booking.status === 'cancelled') return events

    const tourPackage = packageBySlug.get(booking.packageSlug)

    if (!tourPackage) return events

    const start = new Date(`${booking.travelDate}T00:00:00`)
    const end = addDays(start, Math.max(booking.packageDays - 1, 0))

    events.push({
      id: booking.id,
      bookingId: booking.id,
      packageId: tourPackage.id,
      bookingRef: booking.bookingRef,
      title: booking.packageTitle,
      location: booking.packageLocation,
      image: booking.packageImage,
      category: tourPackage.category,
      contactName: booking.contactName,
      travelers: booking.travelers,
      totalAmount: booking.totalAmount,
      start,
      end
    })

    return events
  }, [])
}

export const getCategoryColorClasses = (category: TourPackageCategory): string => {
  switch (category) {
    case 'beach':
      return 'bg-sky-200/50 text-sky-950/80 hover:bg-sky-200/70 dark:bg-sky-400/25 dark:text-sky-200 dark:hover:bg-sky-400/35 shadow-sky-700/8'
    case 'adventure':
      return 'bg-emerald-200/50 text-emerald-950/80 hover:bg-emerald-200/70 dark:bg-emerald-400/25 dark:text-emerald-200 dark:hover:bg-emerald-400/35 shadow-emerald-700/8'
    case 'cultural':
      return 'bg-amber-200/50 text-amber-950/80 hover:bg-amber-200/70 dark:bg-amber-400/25 dark:text-amber-200 dark:hover:bg-amber-400/35 shadow-amber-700/8'
    case 'honeymoon':
      return 'bg-rose-200/50 text-rose-950/80 hover:bg-rose-200/70 dark:bg-rose-400/25 dark:text-rose-200 dark:hover:bg-rose-400/35 shadow-rose-700/8'
    case 'wildlife':
      return 'bg-violet-200/50 text-violet-950/80 hover:bg-violet-200/70 dark:bg-violet-400/25 dark:text-violet-200 dark:hover:bg-violet-400/35 shadow-violet-700/8'
  }
}

export const isMultiDayEvent = (event: TourCalendarEvent): boolean => !isSameDay(event.start, event.end)

export const getEventsForDay = (events: TourCalendarEvent[], day: Date): TourCalendarEvent[] =>
  events.filter(event => isSameDay(event.start, day)).sort((a, b) => a.start.getTime() - b.start.getTime())

export const getSpanningEventsForDay = (events: TourCalendarEvent[], day: Date): TourCalendarEvent[] =>
  events.filter(
    event => isMultiDayEvent(event) && !isSameDay(event.start, day) && day > event.start && day <= event.end
  )

export const getAllEventsForDay = (events: TourCalendarEvent[], day: Date): TourCalendarEvent[] =>
  events.filter(event => day >= event.start && day <= event.end)

export const sortEvents = (events: TourCalendarEvent[]): TourCalendarEvent[] =>
  [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a)
    const bIsMultiDay = isMultiDayEvent(b)

    if (aIsMultiDay && !bIsMultiDay) return -1
    if (!aIsMultiDay && bIsMultiDay) return 1

    return a.start.getTime() - b.start.getTime()
  })

export const getBorderRadiusClasses = (isFirstDay: boolean, isLastDay: boolean): string => {
  if (isFirstDay && isLastDay) return 'rounded-sm'
  if (isFirstDay) return 'rounded-l-sm rounded-tr-none rounded-br-none'
  if (isLastDay) return 'rounded-r-sm rounded-tl-none rounded-bl-none'

  return 'rounded-none'
}

export const getMonthViewBleedClasses = (spansRight: boolean): string => {
  if (!spansRight) return ''

  return cn(
    'overflow-visible',
    'after:absolute after:top-0 after:bottom-0 after:left-full after:z-0 after:w-[calc(0.125rem+1px+0.125rem)] after:rounded-none after:bg-inherit after:content-[""] sm:after:w-[calc(0.25rem+1px+0.25rem)]'
  )
}

export const getMonthViewEventPaddingClasses = (spansLeft: boolean, spansRight: boolean): string => {
  if (!spansLeft && !spansRight) return 'px-1 sm:px-2'

  return cn(!spansLeft && 'pl-1 sm:pl-2', !spansRight && 'pr-1 sm:pr-2', spansLeft && 'pl-0', spansRight && 'pr-0')
}
