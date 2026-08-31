// Type Imports
import type { Booking } from '@/types/account/booking-types'
import type { Customer } from '@/types/apps/customer-types'
import type { Transaction } from '@/types/apps/transaction-types'

export const generateTransactionRef = () => {
  const ts = Date.now().toString(36).toUpperCase().slice(-6)
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `TXN-${ts}-${rnd}`
}

export type TransactionWithDetails = Transaction & {
  bookingTitle: string
  bookingLocation: string
  bookingRef: string
  customerName: string
  customerAvatar?: string
}

export const joinTransactionsWithDetails = (
  transactions: Transaction[],
  bookings: Booking[],
  customers: Customer[]
): TransactionWithDetails[] =>
  transactions.map(transaction => {
    const booking = bookings.find(item => item.id === transaction.bookingId)
    const customer = customers.find(item => item.id === transaction.customerId)

    return {
      ...transaction,
      bookingTitle: booking?.packageTitle ?? 'Unknown package',
      bookingLocation: booking?.packageLocation ?? '—',
      bookingRef: booking?.bookingRef ?? '—',
      customerName: booking?.contactName || customer?.name || 'Unknown customer',
      customerAvatar: booking?.contactAvatar || customer?.avatar
    }
  })

export const buildChargeTransactionFromBooking = (booking: Booking, customers: Customer[]): Transaction => {
  const customer = customers.find(item => item.email === booking.contactEmail)

  return {
    id: `txn-${booking.id}`,
    transactionRef: booking.bookingRef.replace('TRV-', 'TXN-'),
    bookingId: booking.id,
    customerId: customer?.id,
    amount: booking.totalAmount,
    method: booking.paymentResult.method,
    cardLast4: booking.paymentResult.cardLast4,
    status: 'succeeded',
    createdAt: booking.bookedAt
  }
}
