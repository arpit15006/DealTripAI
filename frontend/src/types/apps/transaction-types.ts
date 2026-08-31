// Type Imports
import type { PaymentMethod } from '@/types/packages/checkout-types'

export type TransactionStatus = 'succeeded' | 'pending' | 'failed'

export const TRANSACTION_STATUS_LIST: TransactionStatus[] = ['succeeded', 'pending', 'failed']

export const TRANSACTION_STATUS_STYLES: Record<TransactionStatus, { dot: string; text: string; bg: string }> = {
  succeeded: {
    dot: 'bg-green-600 dark:bg-green-400',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-600/10 dark:bg-green-400/10'
  },
  pending: {
    dot: 'bg-amber-600 dark:bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-600/10 dark:bg-amber-400/10'
  },
  failed: { dot: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10' }
}

export interface Transaction {
  id: string
  transactionRef: string

  bookingId: string
  customerId?: string
  amount: number
  method: PaymentMethod
  cardLast4?: string
  status: TransactionStatus
  createdAt: string
  invoiceId?: string

  notes?: string
}
