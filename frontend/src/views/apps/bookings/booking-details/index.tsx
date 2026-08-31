'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { ArrowLeftIcon, PencilIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import CustomerInfoCard from './customer-info-card'
import NotesCard from './notes-card'
import PriceBreakdownCard from './price-breakdown-card'
import TravelersCard from './travelers-card'
import TripOverviewCard from './trip-overview-card'

// Data Imports
import { db as calendarOnlyBookings } from '@/fake-db/packages/tour-calendar-bookings'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'

type BookingDetailsViewProps = {
  id: string
}

const BookingDetailsView = ({ id }: BookingDetailsViewProps) => {
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

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex justify-between gap-4 max-md:flex-col'>
        <div>
          <h1 className='text-2xl font-semibold'>Booking Details</h1>
          <p className='text-muted-foreground text-sm'>View and manage the details of this booking.</p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' render={<Link href='/dashboard/bookings' />} nativeButton={false}>
            <ArrowLeftIcon className='size-4' />
            All Bookings
          </Button>
          <Button size='sm' render={<Link href={`/dashboard/bookings/${booking.id}/edit`} />} nativeButton={false}>
            <PencilIcon className='size-4' />
            Edit Booking
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start'>
        <div className='flex flex-col gap-6 xl:col-span-2'>
          <TripOverviewCard booking={booking} />
          <TravelersCard booking={booking} />
          <NotesCard booking={booking} />
        </div>

        <div className='flex flex-col gap-6 xl:sticky xl:top-20 xl:col-span-1'>
          <CustomerInfoCard booking={booking} />
          <PriceBreakdownCard booking={booking} />
        </div>
      </div>
    </div>
  )
}

export default BookingDetailsView
