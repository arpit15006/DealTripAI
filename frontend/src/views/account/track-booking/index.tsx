'use client'

// React Imports
import { useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// Component Imports
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import BookingTimeline from '@/views/account/track-booking/booking-timeline'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'
import { useProfileStore } from '@/store/use-profile-store'

// SVGs Imports
import BookingSvg from '@/assets/svg/booking-svg'
import { Card, CardContent } from '@/components/ui/card'

const TrackBookingView = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookings = useBookingsStore(state => state.bookings)
  const user = useProfileStore(state => state.user)

  const upcomingBookings = useMemo(
    () => bookings.filter(booking => booking.contactEmail === user.email && booking.status === 'upcoming'),
    [bookings, user.email]
  )

  const bookingIdFromUrl = searchParams.get('bookingId')
  const [manualSelectionId, setManualSelectionId] = useState<string | null>(null)

  const selectedBookingId =
    manualSelectionId && upcomingBookings.some(booking => booking.id === manualSelectionId)
      ? manualSelectionId
      : (bookingIdFromUrl ?? upcomingBookings[0]?.id ?? '')

  const selectedBooking = useMemo(
    () => upcomingBookings.find(booking => booking.id === selectedBookingId) ?? null,
    [upcomingBookings, selectedBookingId]
  )

  const bookingOptions = useMemo(
    () =>
      upcomingBookings.map(booking => ({
        label: `${booking.packageTitle} — ${booking.bookingRef}`,
        value: booking.id
      })),
    [upcomingBookings]
  )

  const handleSelectBooking = (id: string) => {
    setManualSelectionId(id)
    router.replace(`/my-dashboard/track-booking?bookingId=${id}`)
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold'>Booking Status</h1>
        <p className='text-muted-foreground text-sm'>Follow the progress of your upcoming trips</p>
      </div>

      {upcomingBookings.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='default'>
              <Card className='bg-muted-foreground/5'>
                <CardContent className='flex items-center justify-center'>
                  <BookingSvg className='size-30' />
                </CardContent>
              </Card>
            </EmptyMedia>
            <EmptyTitle className='text-2xl font-semibold'>No Booking yet</EmptyTitle>
            <EmptyDescription>Book a tour package to see its live tracking status here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href='/tour-packages' />} nativeButton={false}>
              Browse Tour Packages
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className='flex flex-col gap-6'>
          <Select
            items={bookingOptions}
            value={selectedBookingId}
            onValueChange={value => value && handleSelectBooking(value)}
          >
            <SelectTrigger className='w-full sm:w-96'>
              <SelectValue placeholder='Select a booking' />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {bookingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className='[&>div]:truncate'>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {selectedBooking && <BookingTimeline booking={selectedBooking} />}
        </div>
      )}
    </div>
  )
}

export default TrackBookingView
