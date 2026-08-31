'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { format } from 'date-fns'
import { EyeIcon } from 'lucide-react'

// Type Imports
import type { Booking } from '@/types/account/booking-types'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Utils Imports
import { cn } from '@/lib/utils'
import {
  BOOKING_STATUS_BADGE_CLASSNAME,
  BOOKING_STATUS_BADGE_VARIANT,
  BOOKING_STATUS_LABEL
} from '@/utils/booking-utils'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const bookingColumns: ColumnDef<Booking>[] = [
  {
    id: 'contact',
    accessorFn: row => `${row.contactName} ${row.contactEmail} ${row.bookingRef} ${row.packageTitle}`,
    header: 'Customer',
    meta: { filterVariant: 'text' },
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Avatar className='size-9'>
          <AvatarImage src={row.original.contactAvatar || undefined} alt={row.original.contactName} />
          <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
            {getInitials(row.original.contactName)}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>{row.original.contactName}</p>
          <p className='text-muted-foreground truncate text-xs'>{row.original.bookingRef}</p>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'packageTitle',
    header: 'Package',
    cell: ({ row }) => <span className='text-sm font-medium'>{row.original.packageTitle}</span>
  },
  {
    accessorKey: 'travelDate',
    header: 'Travel Date',
    cell: ({ row }) => (
      <span className='text-sm whitespace-nowrap'>{format(new Date(row.original.travelDate), 'dd MMM yyyy')}</span>
    )
  },
  {
    accessorKey: 'travelers',
    header: () => <div className='text-center'>Travelers</div>,
    cell: ({ row }) => <div className='text-center text-sm'>{row.original.travelers}</div>
  },
  {
    accessorKey: 'totalAmount',
    header: () => <div className='text-center'>Amount</div>,
    cell: ({ row }) => (
      <div className='text-center text-sm font-medium'>${row.original.totalAmount.toLocaleString()}</div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { filterVariant: 'select' },
    filterFn: 'equalsString',
    cell: ({ row }) => (
      <Badge
        variant={BOOKING_STATUS_BADGE_VARIANT[row.original.status]}
        className={cn(BOOKING_STATUS_BADGE_CLASSNAME[row.original.status])}
      >
        {BOOKING_STATUS_LABEL[row.original.status]}
      </Badge>
    )
  },
  {
    id: 'actions',
    size: 60,
    enableHiding: false,
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <Button
          variant='ghost'
          size='icon'
          aria-label='View booking'
          render={<Link href={`/dashboard/bookings/${row.original.id}`} />}
          nativeButton={false}
        >
          <EyeIcon className='size-4' />
        </Button>
      </div>
    )
  }
]
