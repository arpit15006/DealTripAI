'use client'

// Third-party Imports
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { format } from 'date-fns'

// Type Imports
import type { Customer } from '@/types/apps/customer-types'
import { CUSTOMER_STATUS_STYLES } from '@/types/apps/customer-types'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import CustomerRowActions from '@/views/apps/customers/customer-row-actions'
import DataTableColumnHeader from '@/views/apps/customers/data-table-column-header'

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

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    enableSorting: false,
    cell: ({ row }) => <span className='text-muted-foreground font-mono text-xs'>{row.original.id}</span>
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    meta: { filterVariant: 'text' },
    filterFn: (row, _columnId, filterValue) =>
      `${row.original.id} ${row.original.name} ${row.original.email} ${row.original.phone}`
        .toLowerCase()
        .includes(String(filterValue).toLowerCase()),
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Avatar className='size-9'>
          <AvatarImage src={row.original.avatar || undefined} alt={row.original.name} />
          <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
            {getInitials(row.original.name) || 'NA'}
          </AvatarFallback>
        </Avatar>
        <p className='min-w-0 truncate text-sm font-medium'>{row.original.name}</p>
      </div>
    )
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
    cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.original.email}</span>
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    enableSorting: false,
    cell: ({ row }) => <span className='text-muted-foreground text-sm whitespace-nowrap'>{row.original.phone}</span>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { filterVariant: 'select' },
    filterFn: 'equalsString',
    cell: ({ row }) => {
      const style = CUSTOMER_STATUS_STYLES[row.original.status]

      return (
        <Badge className={cn('gap-1.5 capitalize', style.text, style.bg)}>
          <span className={cn('size-1.5 rounded-full', style.dot)} />
          {row.original.status}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'registeredAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Registration Date' />,
    cell: ({ row }) => (
      <span className='text-sm whitespace-nowrap'>{format(new Date(row.original.registeredAt), 'dd MMM yyyy')}</span>
    )
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Last Updated' />,
    cell: ({ row }) => (
      <span className='text-sm whitespace-nowrap'>{format(new Date(row.original.updatedAt), 'dd MMM yyyy')}</span>
    )
  },
  {
    id: 'actions',
    size: 60,
    enableHiding: false,
    cell: ({ row }) => <CustomerRowActions customer={row.original} />
  }
]
