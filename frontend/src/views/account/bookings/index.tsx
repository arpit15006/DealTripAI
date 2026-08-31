'use client'

// React Imports
import { useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'

// Component Imports
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import BookingCard from '@/views/account/booking-card'
import BookingsToolbar from '@/views/account/bookings/bookings-toolbar'
import type { BookingSortOption } from '@/views/account/bookings/bookings-toolbar'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'
import { useProfileStore } from '@/store/use-profile-store'

// SVGs Imports
import BookingSvg from '@/assets/svg/booking-svg'

const BookingsView = () => {
  const bookings = useBookingsStore(state => state.bookings)
  const sessionBookingIds = useBookingsStore(state => state.sessionBookingIds)
  const cancelBooking = useBookingsStore(state => state.cancelBooking)
  const user = useProfileStore(state => state.user)

  const [sortBy, setSortBy] = useState<BookingSortOption>('recent')

  const myBookings = useMemo(
    () => bookings.filter(booking => booking.contactEmail === user.email || sessionBookingIds.includes(booking.id)),
    [bookings, user.email, sessionBookingIds]
  )

  const sortedBookings = useMemo(() => {
    const list = [...myBookings]

    switch (sortBy) {
      case 'price-desc':
        return list.sort((a, b) => b.totalAmount - a.totalAmount)
      case 'price-asc':
        return list.sort((a, b) => a.totalAmount - b.totalAmount)
      default:
        return list.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
    }
  }, [myBookings, sortBy])

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>My Bookings</h1>
          <p className='text-muted-foreground text-sm'>All your tour package bookings in one place</p>
        </div>
        {sortedBookings.length > 0 && <BookingsToolbar sortBy={sortBy} onSortChange={setSortBy} />}
      </div>

      {sortedBookings.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='default'>
              <BookingSvg />
            </EmptyMedia>
            <EmptyTitle className='text-2xl font-semibold'>No Bookings yet</EmptyTitle>
            <EmptyDescription>Once you book a tour package, it will show up here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href='/tour-packages' />} nativeButton={false}>
              Browse Tour Packages
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {sortedBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} onCancel={cancelBooking} />
          ))}
        </div>
      )}
    </div>
  )
}

export default BookingsView
