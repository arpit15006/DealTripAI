'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { differenceInCalendarDays, format, isSameDay } from 'date-fns'
import { ArrowRightIcon, CalendarIcon, MapPinIcon, MoonIcon, UserIcon, UsersIcon } from 'lucide-react'

// Type Imports
import type { TourCalendarEvent } from '@/types/packages/tour-calendar-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type DepartureDialogProps = {
  event: TourCalendarEvent | null
  isOpen: boolean
  onClose: () => void
}

const DepartureDialog = ({ event, isOpen, onClose }: DepartureDialogProps) => {
  const days = event ? differenceInCalendarDays(event.end, event.start) + 1 : 0

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className='overflow-hidden p-0 sm:max-w-sm'>
        {event && (
          <>
            <img src={event.image} alt={event.title} className='h-40 w-full object-cover' />

            <div className='flex flex-col gap-4 p-4'>
              <DialogHeader>
                <div className='flex items-start justify-between gap-2'>
                  <DialogTitle className='text-base'>{event.title}</DialogTitle>
                  <Badge variant='outline' className='shrink-0 capitalize'>
                    {event.category}
                  </Badge>
                </div>
              </DialogHeader>

              <div className='text-muted-foreground flex flex-col gap-2 text-sm'>
                <span className='flex items-center gap-2'>
                  <MapPinIcon className='size-4 shrink-0' />
                  {event.location}
                </span>
                <span className='flex items-center gap-2'>
                  <CalendarIcon className='size-4 shrink-0' />
                  {isSameDay(event.start, event.end)
                    ? format(event.start, 'MMM d, yyyy')
                    : `${format(event.start, 'MMM d')} – ${format(event.end, 'MMM d, yyyy')}`}
                </span>
                <span className='flex items-center gap-2'>
                  <MoonIcon className='size-4 shrink-0' />
                  {days} days / {Math.max(days - 1, 0)} nights
                </span>
                <span className='flex items-center gap-2'>
                  <UsersIcon className='size-4 shrink-0' />
                  {event.travelers} {event.travelers === 1 ? 'traveler' : 'travelers'}
                </span>
                <span className='flex items-center gap-2'>
                  <UserIcon className='size-4 shrink-0' />
                  {event.contactName} <span className='opacity-70'>· {event.bookingRef}</span>
                </span>
              </div>

              <div className='flex items-center justify-between border-t pt-3'>
                <span className='text-lg font-bold'>
                  ${event.totalAmount.toLocaleString()}
                  <span className='text-muted-foreground text-xs font-normal'> total</span>
                </span>
                <div className='flex items-center gap-2'>
                  <Button
                    render={<Link href={`/dashboard/bookings/${event.bookingId}`} />}
                    nativeButton={false}
                    variant='outline'
                    size='sm'
                  >
                    View booking
                  </Button>
                  <Button
                    render={<Link href={`/dashboard/tour-packages/${event.packageId}`} />}
                    nativeButton={false}
                    size='sm'
                  >
                    View package
                    <ArrowRightIcon className='size-3.5' />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DepartureDialog
