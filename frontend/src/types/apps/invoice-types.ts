// Type Imports
import type { PaymentMethod, TravelerInfo } from '@/types/packages/checkout-types'

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export const INVOICE_STATUS_LIST: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled'
}

export const INVOICE_STATUS_STYLES: Record<InvoiceStatus, { dot: string; text: string; bg: string }> = {
  draft: {
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
    bg: 'bg-muted'
  },
  sent: {
    dot: 'bg-blue-600 dark:bg-blue-400',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-600/10 dark:bg-blue-400/10'
  },
  paid: {
    dot: 'bg-green-600 dark:bg-green-400',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-600/10 dark:bg-green-400/10'
  },
  overdue: { dot: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10' },
  cancelled: { dot: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10' }
}

export interface InvoiceLineItem {
  id: string
  label: string
  description?: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface InvoiceBillTo {
  name: string
  email: string
  phone?: string
}

export interface InvoiceTravelDetails {
  packageTitle: string
  packageLocation: string
  packageDays: number
  packageNights: number
  travelDate: string
  travelers: number
  bookingRef: string
}

export interface Invoice {
  id: string
  invoiceNumber: string

  bookingId: string
  transactionId: string
  customerId?: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string

  billTo: InvoiceBillTo
  travel: InvoiceTravelDetails
  travelersInfo?: TravelerInfo[]
  lineItems: InvoiceLineItem[]

  discountAmount?: number
  couponCode?: string
  taxRate?: number
  taxAmount?: number

  subtotal: number
  total: number
  amountPaid: number
  balanceDue: number

  paymentMethod: PaymentMethod
  cardLast4?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
