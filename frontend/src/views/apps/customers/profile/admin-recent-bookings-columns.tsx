'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowRightIcon } from 'lucide-react'

// Type Imports
import type { Booking } from '@/types/account/booking-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Utils Imports
import { cn } from '@/lib/utils'
import {
  BOOKING_STATUS_BADGE_CLASSNAME,
  BOOKING_STATUS_BADGE_VARIANT,
  BOOKING_STATUS_LABEL,
  getCountryFromLocation
} from '@/utils/booking-utils'

export const adminRecentBookingsColumns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'packageTitle',
    header: 'Package',
    cell: ({ row }) => <span className='font-medium'>{row.getValue('packageTitle')}</span>
  },
  {
    id: 'country',
    header: 'Country',
    accessorFn: row => getCountryFromLocation(row.packageLocation)
  },
  {
    accessorKey: 'travelDate',
    header: 'Travel Date',
    cell: ({ row }) => new Date(row.getValue('travelDate')).toLocaleDateString('en-US')
  },
  {
    accessorKey: 'travelers',
    header: () => <div className='text-right'>Travelers</div>,
    cell: ({ row }) => <div className='pl-8 text-left'>{row.getValue('travelers')}</div>
  },
  {
    accessorKey: 'totalAmount',
    header: () => <div className='text-right'>Amount</div>,
    cell: ({ row }) => (
      <div className='text-left font-medium'>${(row.getValue('totalAmount') as number).toLocaleString()}</div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const booking = row.original

      return (
        <Badge
          variant={BOOKING_STATUS_BADGE_VARIANT[booking.status]}
          className={cn(BOOKING_STATUS_BADGE_CLASSNAME[booking.status])}
        >
          {BOOKING_STATUS_LABEL[booking.status]}
        </Badge>
      )
    }
  },
  {
    id: 'action',
    header: '',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <Button
        variant='ghost'
        size='icon'
        aria-label='View booking'
        render={<Link href={`/dashboard/bookings/${row.original.id}`} />}
        nativeButton={false}
      >
        <ArrowRightIcon className='size-4' />
      </Button>
    )
  }
]
