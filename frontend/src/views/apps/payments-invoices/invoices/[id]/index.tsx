'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { ArrowLeftIcon, FileSearchIcon } from 'lucide-react'

// Type Imports
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_STYLES } from '@/types/apps/invoice-types'
import { TRANSACTION_STATUS_STYLES } from '@/types/apps/transaction-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import InvoiceActionsCard from '@/views/apps/payments-invoices/invoices/[id]/invoice-actions-card'
import InvoiceDocumentCard from '@/views/apps/payments-invoices/invoices/[id]/invoice-document-card'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'
import { useCustomersStore } from '@/store/use-customers-store'
import { useInvoicesStore } from '@/store/use-invoices-store'
import { useTransactionsStore } from '@/store/use-transactions-store'

// Utils Imports
import { buildTransactionReceiptInvoice } from '@/utils/invoice-utils'

type InvoiceDetailsViewProps = {
  id: string
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const InvoiceDetailsView = ({ id }: InvoiceDetailsViewProps) => {
  const realInvoice = useInvoicesStore(state => state.invoices.find(item => item.id === id))

  const transaction = useTransactionsStore(state =>
    realInvoice ? undefined : state.transactions.find(item => item.id === id)
  )

  const booking = useBookingsStore(state => state.bookings.find(item => item.id === transaction?.bookingId))
  const customer = useCustomersStore(state => state.items.find(item => item.id === transaction?.customerId))

  const previewInvoice =
    transaction && booking ? buildTransactionReceiptInvoice(transaction, booking, customer) : undefined

  const invoice = realInvoice ?? previewInvoice
  const isPreview = !realInvoice && !!previewInvoice

  if (!invoice) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <FileSearchIcon />
          </EmptyMedia>
          <EmptyTitle>Invoice Not Found</EmptyTitle>
          <EmptyDescription>We couldn&apos;t find an invoice with ID #{id}.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href='/dashboard/payments-invoices/transactions' />} nativeButton={false}>
            Back to Transactions
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const badge =
    isPreview && transaction
      ? { label: capitalize(transaction.status), style: TRANSACTION_STATUS_STYLES[transaction.status] }
      : { label: INVOICE_STATUS_LABELS[invoice.status], style: INVOICE_STATUS_STYLES[invoice.status] }

  const documentTitle =
    isPreview && transaction ? `Transaction ${transaction.transactionRef}` : `Invoice ${invoice.invoiceNumber}`

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex justify-between gap-4 max-md:flex-col print:hidden'>
        <div>
          <h1 className='text-2xl font-semibold'>{documentTitle}</h1>
          <p className='text-muted-foreground text-sm'>
            {isPreview
              ? 'Preview of charges and payment details for this transaction — not yet invoiced.'
              : 'View charges and payment details for this invoice.'}
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          render={<Link href='/dashboard/payments-invoices/transactions' />}
          nativeButton={false}
        >
          <ArrowLeftIcon className='size-4' />
          All Transactions
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem] print:block'>
        <InvoiceDocumentCard invoice={invoice} title={documentTitle} badge={badge} />

        <InvoiceActionsCard
          invoice={invoice}
          createInvoiceTransactionId={isPreview && transaction?.status === 'succeeded' ? transaction.id : undefined}
        />
      </div>
    </div>
  )
}

export default InvoiceDetailsView
