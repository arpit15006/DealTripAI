'use client'

// Next Imports
import Link from 'next/link'

// Component Imports
import { Button } from '@/components/ui/button'
import BookingForm from '@/views/apps/bookings/booking-form'

// Data Imports
import { db as calendarOnlyBookings } from '@/fake-db/packages/tour-calendar-bookings'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'

type EditBookingViewProps = {
  id: string
}

const EditBookingView = ({ id }: EditBookingViewProps) => {
  const storeBooking = useBookingsStore(state => state.bookings.find(item => item.id === id))

  const booking = storeBooking ?? calendarOnlyBookings.find(item => item.id === id)

  if (!booking) {
    return (
      <div className='flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center'>
        <p className='font-medium'>Booking not found</p>
        <Button variant='outline' render={<Link href='/dashboard/bookings' />} nativeButton={false}>
          Back to All Bookings
        </Button>
      </div>
    )
  }

  return <BookingForm booking={booking} />
}

export default EditBookingView
