'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { DownloadIcon, EyeIcon } from 'lucide-react'

// Type Imports
import type { TransactionWithDetails } from '@/utils/transaction-utils'

// Component Imports
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'
import { useCustomersStore } from '@/store/use-customers-store'
import { useInvoicesStore } from '@/store/use-invoices-store'

// Hook Imports
import { useInvoicePrinter } from '@/hooks/use-invoice-printer'

// Utils Imports
import { buildTransactionReceiptInvoice } from '@/utils/invoice-utils'

type TransactionRowActionsProps = {
  transaction: TransactionWithDetails
}

const TransactionRowActions = ({ transaction }: TransactionRowActionsProps) => {
  const invoice = useInvoicesStore(state => state.invoices.find(item => item.id === transaction.invoiceId))
  const booking = useBookingsStore(state => state.bookings.find(item => item.id === transaction.bookingId))
  const customer = useCustomersStore(state => state.items.find(item => item.id === transaction.customerId))
  const { downloadInvoice, invoicePrintPortal } = useInvoicePrinter()

  const handleDownload = () => {
    if (invoice) {
      downloadInvoice(invoice)

      return
    }

    if (booking) downloadInvoice(buildTransactionReceiptInvoice(transaction, booking, customer))
  }

  const viewHref = `/dashboard/payments-invoices/invoices/${transaction.invoiceId ?? transaction.id}`

  return (
    <div className='flex items-center justify-end gap-1'>
      <Tooltip>
        <TooltipTrigger render={<Button variant='ghost' size='icon' aria-label='Download' onClick={handleDownload} />}>
          <DownloadIcon className='size-4' />
        </TooltipTrigger>
        <TooltipContent>
          <p>Download</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant='ghost'
              size='icon'
              aria-label='View'
              render={<Link href={viewHref} />}
              nativeButton={false}
            />
          }
        >
          <EyeIcon className='size-4' />
        </TooltipTrigger>
        <TooltipContent>
          <p>View</p>
        </TooltipContent>
      </Tooltip>

      {invoicePrintPortal}
    </div>
  )
}

export default TransactionRowActions
