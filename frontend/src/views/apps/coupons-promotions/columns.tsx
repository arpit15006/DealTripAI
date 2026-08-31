'use client'

// Third-party Imports
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { format } from 'date-fns'
import { StarIcon } from 'lucide-react'

// Type Imports
import type { Coupon } from '@/types/apps/coupon-types'
import { COUPON_DISCOUNT_TYPE_LABELS, COUPON_STATUS_STYLES } from '@/types/apps/coupon-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import CouponRowActions from '@/views/apps/coupons-promotions/coupon-row-actions'
import DataTableColumnHeader from '@/views/apps/coupons-promotions/data-table-column-header'

// Utils Imports
import { cn } from '@/lib/utils'
import { formatCouponDiscount, getCouponStatus } from '@/utils/coupon-utils'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

export const columns: ColumnDef<Coupon>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Code' />,
    meta: { filterVariant: 'text' },
    filterFn: (row, _columnId, filterValue) =>
      `${row.original.code} ${row.original.title}`.toLowerCase().includes(String(filterValue).toLowerCase()),
    cell: ({ row }) => (
      <span className='inline-flex items-center gap-1.5'>
        {row.original.isFeatured && (
          <span className='inline-flex shrink-0 items-center'>
            <StarIcon className='size-3.5 fill-amber-500 text-amber-500' />
            <span className='sr-only'>Featured on landing page</span>
          </span>
        )}
        <span className='font-mono text-sm font-semibold'>{row.original.code}</span>
      </span>
    )
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
    cell: ({ row }) => (
      <div className='min-w-0'>
        <p className='truncate text-sm font-medium'>{row.original.title}</p>
        {row.original.description && (
          <p className='text-muted-foreground truncate text-xs'>{row.original.description}</p>
        )}
      </div>
    )
  },
  {
    accessorKey: 'discountValue',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Discount' />,
    cell: ({ row }) => <span className='font-medium'>{formatCouponDiscount(row.original)}</span>
  },
  {
    accessorKey: 'discountType',
    header: 'Type',
    meta: { filterVariant: 'select' },
    filterFn: 'equalsString',
    cell: ({ row }) => (
      <Badge variant='outline' className='capitalize'>
        {COUPON_DISCOUNT_TYPE_LABELS[row.original.discountType]}
      </Badge>
    )
  },
  {
    accessorKey: 'usageLimit',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Usage Limit' />,
    cell: ({ row }) => <span className='text-sm'>{row.original.usageLimit.toLocaleString()}</span>
  },
  {
    accessorKey: 'usedCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Used Count' />,
    cell: ({ row }) => <span className='text-sm'>{row.original.usedCount.toLocaleString()}</span>
  },
  {
    id: 'validity',
    header: 'Validity',
    enableSorting: false,
    cell: ({ row }) => (
      <span className='text-sm whitespace-nowrap'>
        {format(new Date(row.original.validFrom), 'dd MMM yyyy')} &ndash;{' '}
        {format(new Date(row.original.validUntil), 'dd MMM yyyy')}
      </span>
    )
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: row => getCouponStatus(row),
    meta: { filterVariant: 'select' },
    filterFn: 'equalsString',
    cell: ({ row }) => {
      const status = getCouponStatus(row.original)
      const style = COUPON_STATUS_STYLES[status]

      return (
        <Badge className={cn('gap-1.5 capitalize', style.text, style.bg)}>
          <span className={cn('size-1.5 rounded-full', style.dot)} />
          {status}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    size: 60,
    enableHiding: false,
    cell: ({ row }) => <CouponRowActions coupon={row.original} />
  }
]
