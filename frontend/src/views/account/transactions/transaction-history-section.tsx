'use client'

// React Imports
import { useMemo } from 'react'

// Third-party Imports
import { ReceiptTextIcon } from 'lucide-react'

// Component Imports
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import BookingDataTable from '@/components/booking/booking-data-table'
import { createTransactionColumns } from '@/views/account/transactions/transaction-columns'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'
import { useProfileStore } from '@/store/use-profile-store'

// Hook Imports
import { useBookingReceiptPrinter } from '@/hooks/use-booking-receipt-printer'

const TransactionHistorySection = () => {
  const bookings = useBookingsStore(state => state.bookings)
  const sessionBookingIds = useBookingsStore(state => state.sessionBookingIds)
  const user = useProfileStore(state => state.user)
  const { downloadReceipt, receiptPortal } = useBookingReceiptPrinter()

  const myBookings = useMemo(
    () => bookings.filter(booking => booking.contactEmail === user.email || sessionBookingIds.includes(booking.id)),
    [bookings, user.email, sessionBookingIds]
  )

  const columns = createTransactionColumns(downloadReceipt)

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-base font-semibold'>Transaction History</h2>

      {myBookings.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <ReceiptTextIcon />
            </EmptyMedia>
            <EmptyTitle>No transactions yet</EmptyTitle>
            <EmptyDescription>Your payment history will appear here after your first booking.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <BookingDataTable columns={columns} data={myBookings} />
      )}

      {receiptPortal}
    </div>
  )
}

export default TransactionHistorySection
