'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { DownloadIcon, FileTextIcon, PrinterIcon } from 'lucide-react'

// Type Imports
import type { Invoice } from '@/types/apps/invoice-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Hook Imports
import { useInvoicePrinter } from '@/hooks/use-invoice-printer'

type InvoiceActionsCardProps = {
  invoice: Invoice
  createInvoiceTransactionId?: string
}

const InvoiceActionsCard = ({ invoice, createInvoiceTransactionId }: InvoiceActionsCardProps) => {
  const { downloadInvoice, invoicePrintPortal } = useInvoicePrinter()

  return (
    <Card className='h-max shadow-none print:hidden'>
      <CardContent className='flex flex-col gap-2'>
        <Button className='w-full' onClick={() => downloadInvoice(invoice)}>
          <DownloadIcon className='size-4' />
          Download
        </Button>
        <Button variant='outline' className='w-full' onClick={() => downloadInvoice(invoice)}>
          <PrinterIcon className='size-4' />
          Print
        </Button>
        {createInvoiceTransactionId && (
          <Button
            variant='outline'
            className='w-full'
            render={
              <Link href={`/dashboard/payments-invoices/invoices/create?transactionId=${createInvoiceTransactionId}`} />
            }
            nativeButton={false}
          >
            <FileTextIcon className='size-4' />
            Create Invoice
          </Button>
        )}
      </CardContent>

      {invoicePrintPortal}
    </Card>
  )
}

export default InvoiceActionsCard
