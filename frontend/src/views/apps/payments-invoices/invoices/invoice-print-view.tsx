'use client'

// Third-party Imports
import { format } from 'date-fns'

// Type Imports
import type { Invoice } from '@/types/apps/invoice-types'

// Component Imports
import { Separator } from '@/components/ui/separator'
import LogoSvg from '@/assets/svg/logo'

// Store Imports
import { useCompanyProfile } from '@/store/use-store-information-store'

// Utils Imports
import { INVOICE_STATUS_LABELS } from '@/types/apps/invoice-types'

type InvoicePrintViewProps = {
  invoice: Invoice
}

type ReceiptRowProps = {
  label: string
  value: string
}

const ReceiptRow = ({ label, value }: ReceiptRowProps) => (
  <div className='flex items-baseline justify-between gap-6 text-sm'>
    <span className='text-muted-foreground'>{label}</span>
    <span className='text-right font-medium'>{value}</span>
  </div>
)

const currency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const InvoicePrintView = ({ invoice }: InvoicePrintViewProps) => {
  const paidVia = invoice.paymentMethod === 'card' ? `Card •••• ${invoice.cardLast4 ?? '----'}` : 'UPI'
  const { companyProfile } = useCompanyProfile()
  const { address, name } = companyProfile

  return (
    <div className='mx-auto flex w-full max-w-xl flex-col gap-6'>
      <div className='flex items-start justify-between text-xs'>
        <span className='text-muted-foreground'>{format(new Date(invoice.issueDate), 'dd MMM yyyy')}</span>
        <span className='text-muted-foreground'>This is your invoice</span>
      </div>

      <div className='flex items-start justify-between'>
        <div className='flex flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <LogoSvg className='[&_rect]:fill-primary size-8 [&_line]:stroke-white [&_path]:stroke-white' />
            <span className='text-lg font-bold'>{name}</span>
          </div>
          <div className='text-muted-foreground text-xs'>
            <p>{address.street}</p>
            <p>
              {address.city}, {address.state} {address.zipCode}
            </p>
            <p>{address.country}</p>
          </div>
        </div>
        <div className='text-right'>
          <p className='text-muted-foreground text-xs'>Invoice Number</p>
          <p className='font-semibold'>{invoice.invoiceNumber}</p>
        </div>
      </div>

      <Separator />

      <div className='flex flex-col gap-2'>
        <h3 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Billed To</h3>
        <ReceiptRow label='Name' value={invoice.billTo.name} />
        <ReceiptRow label='Email address' value={invoice.billTo.email} />
        {invoice.billTo.phone && <ReceiptRow label='Phone' value={invoice.billTo.phone} />}
        <ReceiptRow label='Issue date' value={format(new Date(invoice.issueDate), 'dd MMMM yyyy')} />
        <ReceiptRow label='Due date' value={format(new Date(invoice.dueDate), 'dd MMMM yyyy')} />
      </div>

      <Separator />

      <div className='flex flex-col gap-2'>
        <h3 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Travel Details</h3>
        <ReceiptRow label='Package name' value={invoice.travel.packageTitle} />
        <ReceiptRow label='Location' value={invoice.travel.packageLocation} />
        <ReceiptRow label='Booking reference' value={invoice.travel.bookingRef} />
        <ReceiptRow label='Travel date' value={format(new Date(invoice.travel.travelDate), 'dd MMMM yyyy')} />
        <ReceiptRow label='Duration' value={`${invoice.travel.packageDays}D / ${invoice.travel.packageNights}N`} />
        <ReceiptRow label='Travelers' value={`${invoice.travel.travelers}`} />
      </div>

      <Separator />

      <div className='flex flex-col gap-2'>
        <h3 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Charges</h3>
        {invoice.lineItems.map(item => (
          <ReceiptRow key={item.id} label={item.label} value={currency(item.amount)} />
        ))}
        <ReceiptRow label='Subtotal' value={currency(invoice.subtotal)} />
        {!!invoice.discountAmount && (
          <ReceiptRow
            label={invoice.couponCode ? `Discount (${invoice.couponCode})` : 'Discount'}
            value={`−${currency(invoice.discountAmount)}`}
          />
        )}
        {!!invoice.taxAmount && <ReceiptRow label={`Tax (${invoice.taxRate}%)`} value={currency(invoice.taxAmount)} />}
        <ReceiptRow label='Total' value={currency(invoice.total)} />
      </div>

      <Separator />

      <div className='flex flex-col gap-2'>
        <h3 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Payment</h3>
        <ReceiptRow label='Payment method' value={paidVia} />
        <ReceiptRow label='Amount paid' value={currency(invoice.amountPaid)} />
        <ReceiptRow label='Balance due' value={currency(invoice.balanceDue)} />
        <ReceiptRow label='Status' value={INVOICE_STATUS_LABELS[invoice.status]} />
      </div>

      <Separator />

      <div className='text-muted-foreground flex flex-col items-center gap-1 text-center text-xs'>
        <p>This invoice is automatically generated</p>
        <p>Thank you for traveling with {name}.</p>
      </div>
    </div>
  )
}

export default InvoicePrintView
