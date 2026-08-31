// Type Imports
import type { Booking } from '@/types/account/booking-types'
import type { Customer } from '@/types/apps/customer-types'
import type { Invoice, InvoiceLineItem } from '@/types/apps/invoice-types'
import type { Transaction } from '@/types/apps/transaction-types'

export const generateInvoiceNumber = (existingCount: number) => {
  const year = new Date().getFullYear()
  const sequence = String(existingCount + 1).padStart(4, '0')

  return `INV-${year}-${sequence}`
}

export const generateLineItemId = () => {
  const ts = Date.now().toString(36).toUpperCase().slice(-6)
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `li-${ts}${rnd}`
}

export type InvoiceTotals = {
  subtotal: number
  taxAmount: number
  total: number
}

export const computeInvoiceTotals = (
  lineItems: Pick<InvoiceLineItem, 'amount'>[],
  discountAmount = 0,
  taxRate = 0
): InvoiceTotals => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxableAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = taxableAmount + taxAmount

  return { subtotal, taxAmount, total }
}

export const buildTransactionReceiptInvoice = (
  transaction: Transaction,
  booking: Booking,
  customer?: Customer
): Invoice => {
  const baseAmount = booking.baseAmount ?? booking.totalAmount + (booking.discountAmount ?? 0)

  const lineItems: InvoiceLineItem[] = [
    {
      id: `li-${transaction.id}`,
      label: `Package Cost — ${booking.packageTitle} (${booking.packageDays}D/${booking.packageNights}N)`,
      quantity: 1,
      unitPrice: baseAmount,
      amount: baseAmount
    }
  ]

  const { subtotal, total } = computeInvoiceTotals(lineItems, booking.discountAmount ?? 0, 0)
  const issueDate = transaction.createdAt.slice(0, 10)

  return {
    id: `preview-${transaction.id}`,
    invoiceNumber: transaction.transactionRef,
    bookingId: booking.id,
    transactionId: transaction.id,
    customerId: transaction.customerId,
    status: 'draft',
    issueDate,
    dueDate: issueDate,
    billTo: {
      name: booking.contactName || customer?.name || 'Guest',
      email: booking.contactEmail || customer?.email || '',
      phone: booking.contactPhone || customer?.phone
    },
    travel: {
      packageTitle: booking.packageTitle,
      packageLocation: booking.packageLocation,
      packageDays: booking.packageDays,
      packageNights: booking.packageNights,
      travelDate: booking.travelDate,
      travelers: booking.travelers,
      bookingRef: booking.bookingRef
    },
    travelersInfo: booking.travelersInfo,
    lineItems,
    discountAmount: booking.discountAmount || undefined,
    couponCode: booking.couponCode || undefined,
    subtotal,
    total,
    amountPaid: transaction.amount,
    balanceDue: Math.max(0, total - transaction.amount),
    paymentMethod: transaction.method,
    cardLast4: transaction.cardLast4,
    createdAt: transaction.createdAt,
    updatedAt: transaction.createdAt
  }
}
