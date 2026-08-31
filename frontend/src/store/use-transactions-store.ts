// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { Booking } from '@/types/account/booking-types'
import type { Transaction } from '@/types/apps/transaction-types'

// Data Imports
import { db } from '@/fake-db/apps/transactions'

// Store Imports
import { useCustomersStore } from '@/store/use-customers-store'

// Utils Imports
import { buildChargeTransactionFromBooking } from '@/utils/transaction-utils'

type TransactionsData = {
  transactions: Transaction[]
}

type TransactionsActions = {
  linkInvoice: (transactionId: string, invoiceId: string) => void

  addChargeFromBooking: (booking: Booking) => string
}

export type TransactionsStore = TransactionsData & TransactionsActions

export const useTransactionsStore = create<TransactionsStore>()((set, get) => ({
  transactions: db,

  linkInvoice: (transactionId, invoiceId) =>
    set(state => ({
      transactions: state.transactions.map(item => (item.id === transactionId ? { ...item, invoiceId } : item))
    })),

  addChargeFromBooking: booking => {
    const existing = get().transactions.find(item => item.id === `txn-${booking.id}`)

    if (existing) return existing.id

    const charge = buildChargeTransactionFromBooking(booking, useCustomersStore.getState().items)

    set(state => ({ transactions: [charge, ...state.transactions] }))

    return charge.id
  }
}))
