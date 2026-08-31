'use client'

// React Imports
import { useMemo } from 'react'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import BookingDataTable from '@/components/booking/booking-data-table'
import { adminRecentBookingsColumns } from '@/views/apps/customers/profile/admin-recent-bookings-columns'
import { createTransactionColumns } from '@/views/account/transactions/transaction-columns'

// Type Imports
import type { Customer } from '@/types/apps/customer-types'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'

// Hook Imports
import { useBookingReceiptPrinter } from '@/hooks/use-booking-receipt-printer'

type RecentActivitySectionProps = {
  customer: Customer
}

const TABLE_PAGE_SIZE = 5

const RecentActivitySection = ({ customer }: RecentActivitySectionProps) => {
  const bookings = useBookingsStore(state => state.bookings)
  const { downloadReceipt, receiptPortal } = useBookingReceiptPrinter()

  const customerBookings = useMemo(
    () =>
      bookings
        .filter(booking => booking.contactEmail === customer.email)
        .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()),
    [bookings, customer.email]
  )

  const transactionColumns = createTransactionColumns(downloadReceipt)

  return (
    <div className='space-y-6'>
      <Card className='shadow-none'>
        <CardContent className='flex flex-col gap-6'>
          <div className='flex flex-col gap-4'>
            <h2 className='text-base font-semibold'>Bookings</h2>
            {customerBookings.length === 0 ? (
              <p className='text-muted-foreground text-sm'>No bookings yet.</p>
            ) : (
              <BookingDataTable
                columns={adminRecentBookingsColumns}
                data={customerBookings}
                pageSize={TABLE_PAGE_SIZE}
                defaultSorting={[]}
              />
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <h2 className='text-base font-semibold'>Transactions</h2>
          {customerBookings.length === 0 ? (
            <p className='text-muted-foreground text-sm'>No transactions yet.</p>
          ) : (
            <BookingDataTable
              columns={transactionColumns}
              data={customerBookings}
              pageSize={TABLE_PAGE_SIZE}
              defaultSorting={[]}
            />
          )}
        </CardContent>
      </Card>
      {receiptPortal}
    </div>
  )
}

export default RecentActivitySection
