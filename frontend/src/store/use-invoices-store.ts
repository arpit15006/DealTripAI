// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { Invoice, InvoiceBillTo, InvoiceLineItem } from '@/types/apps/invoice-types'

// Data Imports
import { db } from '@/fake-db/apps/invoices'

// Store Imports
import { useTransactionsStore } from '@/store/use-transactions-store'
import { useBookingsStore } from '@/store/use-bookings-store'

// Utils Imports
import { computeInvoiceTotals, generateInvoiceNumber, generateLineItemId } from '@/utils/invoice-utils'

export type InvoiceLineItemInput = {
  label: string
  description?: string
  quantity: number
  unitPrice: number
}

export type CreateInvoiceInput = {
  transactionId: string
  dueDate: string
  billTo: InvoiceBillTo
  lineItems: InvoiceLineItemInput[]
  discountAmount?: number
  couponCode?: string
  taxRate?: number
  notes?: string
}

export type CreateInvoiceResult = { invoiceId: string } | { error: string }

type InvoicesData = {
  invoices: Invoice[]
}

type InvoicesActions = {
  createInvoiceFromTransaction: (input: CreateInvoiceInput) => CreateInvoiceResult
}

export type InvoicesStore = InvoicesData & InvoicesActions

export const useInvoicesStore = create<InvoicesStore>()((set, get) => ({
  invoices: db,

  createInvoiceFromTransaction: input => {
    const transaction = useTransactionsStore.getState().transactions.find(item => item.id === input.transactionId)

    if (!transaction || transaction.status !== 'succeeded') {
      return { error: 'Select a valid, succeeded transaction.' }
    }

    if (transaction.invoiceId) {
      return { error: 'This transaction has already been invoiced.' }
    }

    const booking = useBookingsStore.getState().bookings.find(item => item.id === transaction.bookingId)

    if (!booking) {
      return { error: 'The booking behind this transaction could not be found.' }
    }

    const lineItems: InvoiceLineItem[] = input.lineItems.map(item => ({
      id: generateLineItemId(),
      label: item.label,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice
    }))

    const { subtotal, taxAmount, total } = computeInvoiceTotals(
      lineItems,
      input.discountAmount ?? 0,
      input.taxRate ?? 0
    )

    const amountPaid = transaction.amount
    const now = new Date().toISOString()

    const invoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(get().invoices.length),
      bookingId: booking.id,
      transactionId: transaction.id,
      customerId: transaction.customerId,
      status: amountPaid >= total ? 'paid' : 'sent',
      issueDate: now.slice(0, 10),
      dueDate: input.dueDate,
      billTo: input.billTo,
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
      discountAmount: input.discountAmount || undefined,
      couponCode: input.couponCode || undefined,
      taxRate: input.taxRate || undefined,
      taxAmount: taxAmount || undefined,
      subtotal,
      total,
      amountPaid,
      balanceDue: Math.max(0, total - amountPaid),
      paymentMethod: transaction.method,
      cardLast4: transaction.cardLast4,
      notes: input.notes,
      createdAt: now,
      updatedAt: now
    }

    set(state => ({ invoices: [invoice, ...state.invoices] }))

    useTransactionsStore.getState().linkInvoice(transaction.id, invoice.id)

    return { invoiceId: invoice.id }
  }
}))
