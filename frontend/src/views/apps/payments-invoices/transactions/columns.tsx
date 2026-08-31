'use client'

// Third-party Imports
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { format } from 'date-fns'

// Type Imports
import type { TransactionWithDetails } from '@/utils/transaction-utils'
import { TRANSACTION_STATUS_STYLES } from '@/types/apps/transaction-types'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import DataTableColumnHeader from '@/views/apps/customers/data-table-column-header'
import TransactionRowActions from '@/views/apps/payments-invoices/transactions/transaction-row-actions'

// Utils Imports
import { cn } from '@/lib/utils'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')

const currency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const columns: ColumnDef<TransactionWithDetails>[] = [
  {
    accessorKey: 'transactionRef',
    header: 'Ref',
    enableSorting: false,
    meta: { filterVariant: 'text' },
    filterFn: (row, _columnId, filterValue) =>
      `${row.original.transactionRef} ${row.original.bookingTitle} ${row.original.customerName}`
        .toLowerCase()
        .includes(String(filterValue).toLowerCase()),
    cell: ({ row }) => <span className='text-muted-foreground font-mono text-xs'>{row.original.transactionRef}</span>
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Booking / Customer' />,
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Avatar className='size-9'>
          <AvatarImage src={row.original.customerAvatar || undefined} alt={row.original.customerName} />
          <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
            {getInitials(row.original.customerName) || 'NA'}
          </AvatarFallback>
        </Avatar>
        <div className='flex min-w-0 flex-col'>
          <p className='truncate text-sm font-medium'>{row.original.customerName}</p>
          <p className='text-muted-foreground truncate text-xs'>{row.original.bookingTitle}</p>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
    cell: ({ row }) => <span className='font-medium'>{currency(row.original.amount)}</span>
  },
  {
    accessorKey: 'method',
    header: 'Method',
    enableSorting: false,
    cell: ({ row }) => (
      <span className='text-muted-foreground text-sm whitespace-nowrap'>
        {row.original.method === 'card' ? `Card •••• ${row.original.cardLast4 ?? '----'}` : 'UPI'}
      </span>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { filterVariant: 'select' },
    filterFn: 'equalsString',
    cell: ({ row }) => {
      const style = TRANSACTION_STATUS_STYLES[row.original.status]

      return (
        <Badge className={cn('gap-1.5 capitalize', style.text, style.bg)}>
          <span className={cn('size-1.5 rounded-full', style.dot)} />
          {row.original.status}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
    cell: ({ row }) => (
      <span className='text-sm whitespace-nowrap'>{format(new Date(row.original.createdAt), 'dd MMM yyyy')}</span>
    )
  },
  {
    id: 'actions',
    size: 60,
    enableHiding: false,
    cell: ({ row }) => <TransactionRowActions transaction={row.original} />
  }
]
