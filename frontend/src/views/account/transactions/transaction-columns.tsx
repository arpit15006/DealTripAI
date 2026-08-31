'use client'

// Third-party Imports
import type { ColumnDef } from '@tanstack/react-table'
import { DownloadIcon } from 'lucide-react'

// Type Imports
import type { Booking } from '@/types/account/booking-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Utils Imports
import { cn } from '@/lib/utils'
import { PAYMENT_STATUS_CLASSNAME, PAYMENT_STATUS_LABEL, derivePaymentStatus } from '@/utils/booking-utils'

export const createTransactionColumns = (onDownloadReceipt: (booking: Booking) => void): ColumnDef<Booking>[] => [
  {
    accessorKey: 'bookingRef',
    header: 'Booking Ref',
    cell: ({ row }) => <span className='font-medium'>{row.getValue('bookingRef')}</span>
  },
  {
    accessorKey: 'packageTitle',
    header: 'Package'
  },
  {
    accessorKey: 'bookedAt',
    header: 'Date',
    cell: ({ row }) => new Date(row.getValue('bookedAt')).toLocaleDateString('en-US')
  },
  {
    accessorKey: 'totalAmount',
    header: () => <div>Amount</div>,
    cell: ({ row }) => <div className='font-medium'>${(row.getValue('totalAmount') as number).toLocaleString()}</div>
  },
  {
    id: 'paymentMethod',
    header: 'Payment Method',
    cell: ({ row }) => {
      const booking = row.original

      return booking.paymentResult.method === 'card' ? `Card •••• ${booking.paymentResult.cardLast4}` : 'UPI / Wallet'
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const booking = row.original
      const paymentStatus = derivePaymentStatus(booking.status)

      return paymentStatus === 'cancelled' ? (
        <Badge variant='destructive'>{PAYMENT_STATUS_LABEL[paymentStatus]}</Badge>
      ) : (
        <Badge variant='outline' className={cn(PAYMENT_STATUS_CLASSNAME[paymentStatus])}>
          {PAYMENT_STATUS_LABEL[paymentStatus]}
        </Badge>
      )
    }
  },
  {
    id: 'receipt',
    header: '',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <Button variant='ghost' size='icon' aria-label='Download receipt' onClick={() => onDownloadReceipt(row.original)}>
        <DownloadIcon className='size-4' />
      </Button>
    )
  }
]
