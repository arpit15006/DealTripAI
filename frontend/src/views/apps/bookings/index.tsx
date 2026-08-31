'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { addDays, format, isSameMonth } from 'date-fns'
import {
  CalendarCheckIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  PlusIcon,
  TableIcon
} from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import AgendaView from './agenda-view'
import CalendarSidebar from './calendar-sidebar'
import DepartureDialog from './departure-dialog'
import MonthView from './month-view'
import { bookingColumns } from './table/columns'
import { BookingsDataTable } from './table/data-table'

// Data Imports
import { db as calendarOnlyBookings } from '@/fake-db/packages/tour-calendar-bookings'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'
import {
  AGENDA_DAYS_TO_SHOW,
  useFilteredTourCalendarEvents,
  useTourCalendarDialog,
  useTourCalendarNavigation,
  useTourCalendarStore
} from '@/store/use-tour-calendar-store'
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

// Utils Imports
import { buildTourCalendarEvents } from '@/utils/tour-calendar-utils'

const EVENT_HEIGHT = 24
const EVENT_GAP = 4

type BookingsLayout = 'calendar' | 'table'

const BookingsView = () => {
  const [layout, setLayout] = useState<BookingsLayout>('calendar')

  const bookings = useBookingsStore(state => state.bookings)
  const packages = useTourPackagesStore(state => state.items)

  const { currentDate, view, setView, goToPrevious, goToNext, goToToday } = useTourCalendarNavigation()
  const { isDialogOpen, selectedEvent, openDialog, closeDialog } = useTourCalendarDialog()

  const initialize = useTourCalendarStore(state => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        layout !== 'calendar' ||
        isDialogOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 'm':
          setView('month')
          break
        case 'a':
          setView('agenda')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [layout, isDialogOpen, setView])

  const allBookings = useMemo(() => [...bookings, ...calendarOnlyBookings], [bookings])

  const calendarEvents = useMemo(() => buildTourCalendarEvents(allBookings, packages), [allBookings, packages])

  const filteredEvents = useFilteredTourCalendarEvents(calendarEvents)

  const eventDates = useMemo(() => filteredEvents.map(event => event.start), [filteredEvents])

  const viewTitle = useMemo(() => {
    if (view === 'agenda') {
      const start = currentDate
      const end = addDays(currentDate, AGENDA_DAYS_TO_SHOW - 1)

      return isSameMonth(start, end)
        ? format(start, 'MMMM yyyy')
        : `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`
    }

    return format(currentDate, 'MMMM yyyy')
  }, [currentDate, view])

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold'>All Bookings</h1>
          <p className='text-muted-foreground text-sm'>
            {layout === 'calendar'
              ? 'View and manage all bookings in the calendar.'
              : 'View and manage all bookings in a table.'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <ToggleGroup
            variant='outline'
            value={[layout]}
            spacing={0}
            onValueChange={value => value[0] && setLayout(value[0] as BookingsLayout)}
          >
            <ToggleGroupItem value='calendar' aria-label='Calendar view'>
              <CalendarDaysIcon className='size-4' />
            </ToggleGroupItem>
            <ToggleGroupItem value='table' aria-label='Table view'>
              <TableIcon className='size-4' />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button render={<Link href='/dashboard/bookings/create' />} nativeButton={false}>
            <PlusIcon className='size-4' />
            New Booking
          </Button>
        </div>
      </div>
      {layout === 'table' ? (
        <Card className='w-full gap-0 py-0'>
          <BookingsDataTable columns={bookingColumns} data={allBookings} />
        </Card>
      ) : (
        <div className='bg-card grid grid-cols-1 rounded-lg border lg:grid-cols-[280px_1fr]'>
          <div className='divide-y border-r max-lg:hidden'>
            <CalendarSidebar eventDates={eventDates} />
          </div>
          <div
            className='flex flex-col'
            style={{ '--event-height': `${EVENT_HEIGHT}px`, '--event-gap': `${EVENT_GAP}px` } as React.CSSProperties}
          >
            <div className='flex items-center justify-between gap-1 p-2 sm:p-4'>
              <div className='flex items-center gap-1'>
                <Sheet>
                  <SheetTrigger render={<Button variant='outline' size='icon-sm' />} className='lg:hidden'>
                    <MenuIcon />
                  </SheetTrigger>
                  <SheetContent side='left' className='max-w-72! divide-y border-r'>
                    <SheetHeader className='sr-only'>
                      <SheetTitle>Calendar filters</SheetTitle>
                    </SheetHeader>
                    <CalendarSidebar eventDates={eventDates} />
                  </SheetContent>
                </Sheet>
                <Button variant='outline' className='max-sm:hidden' onClick={goToToday}>
                  <CalendarCheckIcon size={16} aria-hidden='true' />
                  <span>Today</span>
                </Button>
                <Button variant='outline' size='icon-sm' className='sm:hidden' onClick={goToToday}>
                  <CalendarCheckIcon size={16} aria-hidden='true' />
                </Button>
              </div>
              <div className='flex items-center gap-1'>
                <Button variant='ghost' size='icon-sm' onClick={goToPrevious} aria-label='Previous'>
                  <ChevronLeftIcon size={16} aria-hidden='true' />
                </Button>
                <h2 className='text-sm font-semibold sm:text-lg md:text-xl'>{viewTitle}</h2>
                <Button variant='ghost' size='icon-sm' onClick={goToNext} aria-label='Next'>
                  <ChevronRightIcon size={16} aria-hidden='true' />
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant='outline' />}>
                  <span>{view.charAt(0).toUpperCase() + view.slice(1)}</span>
                  <ChevronDownIcon className='-me-1 opacity-60' size={16} aria-hidden='true' />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='min-w-32'>
                  <DropdownMenuItem onClick={() => setView('month')}>
                    Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setView('agenda')}>
                    Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className='flex flex-1 flex-col'>
              {view === 'month' ? (
                <MonthView currentDate={currentDate} events={filteredEvents} onEventSelect={openDialog} />
              ) : (
                <AgendaView currentDate={currentDate} events={filteredEvents} onEventSelect={openDialog} />
              )}
            </div>
          </div>
          <DepartureDialog event={selectedEvent} isOpen={isDialogOpen} onClose={closeDialog} />
        </div>
      )}
    </div>
  )
}

export default BookingsView
