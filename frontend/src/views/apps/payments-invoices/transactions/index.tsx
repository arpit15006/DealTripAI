'use client'

// React Imports
import { useMemo } from 'react'

// Component Imports
import { Card } from '@/components/ui/card'
import { columns } from '@/views/apps/payments-invoices/transactions/columns'
import { TransactionsDataTable } from '@/views/apps/payments-invoices/transactions/data-table'
import TransactionStats from '@/views/apps/payments-invoices/transactions/transaction-stats'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'
import { useCustomersStore } from '@/store/use-customers-store'
import { useTransactionsStore } from '@/store/use-transactions-store'

// Utils Imports
import { joinTransactionsWithDetails } from '@/utils/transaction-utils'

const TransactionsView = () => {
  const transactions = useTransactionsStore(state => state.transactions)
  const bookings = useBookingsStore(state => state.bookings)
  const customers = useCustomersStore(state => state.items)

  const rows = useMemo(
    () => joinTransactionsWithDetails(transactions, bookings, customers),
    [transactions, bookings, customers]
  )

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Transactions</h1>
        <p className='text-muted-foreground text-sm'>Every charge across your bookings, in one ledger.</p>
      </div>

      <TransactionStats items={transactions} />

      <Card className='w-full gap-0 py-0'>
        <TransactionsDataTable columns={columns} data={rows} />
      </Card>
    </div>
  )
}

export default TransactionsView
