'use client'

// React Imports
import { useMemo } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { CreditCardIcon, HeartIcon, PlaneIcon, TicketIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import BookingDataTable from '@/components/booking/booking-data-table'
import { recentBookingsColumns } from '@/views/account/dashboard/recent-bookings-columns'
import StatCard from '@/views/account/dashboard/stat-card'
import { createTransactionColumns } from '@/views/account/transactions/transaction-columns'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'
import { useFavouritesStore } from '@/store/use-favourites-store'
import { usePaymentMethodsStore } from '@/store/use-payment-methods-store'
import { useProfileStore } from '@/store/use-profile-store'

// Hook Imports
import { useBookingReceiptPrinter } from '@/hooks/use-booking-receipt-printer'

const RECENT_BOOKINGS_LIMIT = 3

const DashboardView = () => {
  const user = useProfileStore(state => state.user)
  const bookings = useBookingsStore(state => state.bookings)
  const sessionBookingIds = useBookingsStore(state => state.sessionBookingIds)
  const favouriteSlugs = useFavouritesStore(state => state.slugs)
  const savedCards = usePaymentMethodsStore(state => state.items)
  const { downloadReceipt, receiptPortal } = useBookingReceiptPrinter()

  const myBookings = useMemo(
    () => bookings.filter(booking => booking.contactEmail === user.email || sessionBookingIds.includes(booking.id)),
    [bookings, user.email, sessionBookingIds]
  )

  const upcomingBookings = useMemo(
    () =>
      myBookings
        .filter(booking => booking.status === 'upcoming')
        .sort((a, b) => new Date(a.travelDate).getTime() - new Date(b.travelDate).getTime()),
    [myBookings]
  )

  const recentBookings = useMemo(
    () =>
      [...myBookings]
        .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
        .slice(0, RECENT_BOOKINGS_LIMIT),
    [myBookings]
  )

  const transactionColumns = createTransactionColumns(downloadReceipt)

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold'>Welcome back, {user.firstName}!</h1>
        <p className='text-muted-foreground text-sm'>Here&apos;s what&apos;s happening with your trips</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard icon={PlaneIcon} label='Upcoming Trips' value={upcomingBookings.length} />
        <StatCard icon={TicketIcon} label='Total Bookings' value={myBookings.length} />
        <StatCard icon={HeartIcon} label='Favourites' value={favouriteSlugs.length} />
        <StatCard icon={CreditCardIcon} label='Saved Cards' value={savedCards.length} />
      </div>

      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-base font-semibold'>Recent Bookings</h2>
          <Button
            variant='link'
            className='h-auto p-0'
            render={<Link href='/my-dashboard/bookings' />}
            nativeButton={false}
          >
            View All
          </Button>
        </div>
        {recentBookings.length === 0 ? (
          <p className='text-muted-foreground text-sm'>No bookings yet.</p>
        ) : (
          <BookingDataTable
            columns={recentBookingsColumns}
            data={recentBookings}
            pageSize={RECENT_BOOKINGS_LIMIT}
            defaultSorting={[]}
          />
        )}
      </div>

      <Separator />

      <div className='flex flex-col gap-4'>
        <h2 className='text-base font-semibold'>Recent Transactions</h2>
        {recentBookings.length === 0 ? (
          <p className='text-muted-foreground text-sm'>No transactions yet.</p>
        ) : (
          <BookingDataTable
            columns={transactionColumns}
            data={recentBookings}
            pageSize={RECENT_BOOKINGS_LIMIT}
            defaultSorting={[]}
          />
        )}
      </div>

      {receiptPortal}
    </div>
  )
}

export default DashboardView
