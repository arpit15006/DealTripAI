'use client'

// Third-party Imports
import { format } from 'date-fns'

// Type Imports
import type { Invoice } from '@/types/apps/invoice-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import LogoSvg from '@/assets/svg/logo'

// Store Imports
import { useCompanyProfile } from '@/store/use-store-information-store'

// Utils Imports
import { cn } from '@/lib/utils'

export type InvoiceStatusBadge = {
  label: string
  style: { dot: string; text: string; bg: string }
}

type InvoiceDocumentCardProps = {
  invoice: Invoice
  title: string
  badge: InvoiceStatusBadge
}

const currency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const InvoiceDocumentCard = ({ invoice, title, badge }: InvoiceDocumentCardProps) => {
  const { companyProfile } = useCompanyProfile()
  const { address, name } = companyProfile

  return (
    <Card className='gap-6 py-0 shadow-none'>
      <div className='bg-muted/50 flex flex-wrap items-start justify-between gap-4 rounded-t-xl p-6'>
        <div className='flex flex-col gap-2'>
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
        <div className='flex flex-col items-end gap-2 text-right'>
          <Badge className={cn('gap-1.5', badge.style.text, badge.style.bg)}>
            <span className={cn('size-1.5 rounded-full', badge.style.dot)} />
            {badge.label}
          </Badge>
          <p className='text-lg font-semibold'>{title}</p>
          <p className='text-muted-foreground text-sm'>
            Date Issued: {format(new Date(invoice.issueDate), 'dd MMM yyyy')}
          </p>
          <p className='text-muted-foreground text-sm'>Date Due: {format(new Date(invoice.dueDate), 'dd MMM yyyy')}</p>
        </div>
      </div>

      <CardContent className='flex flex-col gap-6 p-6'>
        <div className='flex flex-wrap justify-between gap-6'>
          <div className='flex flex-col gap-1'>
            <h3 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Billed To</h3>
            <p className='font-medium'>{invoice.billTo.name}</p>
            <p className='text-muted-foreground text-sm'>{invoice.billTo.email}</p>
            {invoice.billTo.phone && <p className='text-muted-foreground text-sm'>{invoice.billTo.phone}</p>}
          </div>

          <div className='flex flex-col gap-1'>
            <h3 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Travel Details</h3>
            <p className='font-medium'>{invoice.travel.packageTitle}</p>
            <p className='text-muted-foreground text-sm'>{invoice.travel.packageLocation}</p>
            <p className='text-muted-foreground text-sm'>
              {format(new Date(invoice.travel.travelDate), 'dd MMM yyyy')} · {invoice.travel.packageDays}D/
              {invoice.travel.packageNights}N · {invoice.travel.travelers} traveler
              {invoice.travel.travelers > 1 ? 's' : ''}
            </p>
            <p className='text-muted-foreground text-sm'>Booking Ref: {invoice.travel.bookingRef}</p>
          </div>
        </div>

        {invoice.travelersInfo && invoice.travelersInfo.length > 0 && (
          <div className='flex flex-col gap-1'>
            <h3 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Travelers</h3>
            <p className='text-sm'>
              {invoice.travelersInfo.map(traveler => `${traveler.firstName} ${traveler.lastName}`).join(', ')}
            </p>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className='text-right'>Qty</TableHead>
              <TableHead className='text-right'>Unit Price</TableHead>
              <TableHead className='text-right'>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.lineItems.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className='font-medium'>{item.label}</p>
                  {item.description && <p className='text-muted-foreground text-xs'>{item.description}</p>}
                </TableCell>
                <TableCell className='text-right'>{item.quantity}</TableCell>
                <TableCell className='text-right'>{currency(item.unitPrice)}</TableCell>
                <TableCell className='text-right'>{currency(item.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className='flex flex-wrap items-end justify-between gap-4'>
          {invoice.notes && (
            <div className='max-w-sm'>
              <h3 className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>Notes</h3>
              <p className='text-sm'>{invoice.notes}</p>
            </div>
          )}

          <div className='ml-auto flex w-full max-w-64 flex-col gap-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Subtotal</span>
              <span>{currency(invoice.subtotal)}</span>
            </div>
            {!!invoice.discountAmount && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>
                  Discount{invoice.couponCode ? ` (${invoice.couponCode})` : ''}
                </span>
                <span className='text-green-600 dark:text-green-400'>−{currency(invoice.discountAmount)}</span>
              </div>
            )}
            {!!invoice.taxAmount && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Tax ({invoice.taxRate}%)</span>
                <span>{currency(invoice.taxAmount)}</span>
              </div>
            )}
            <Separator />
            <div className='flex items-center justify-between font-semibold'>
              <span>Total</span>
              <span>{currency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InvoiceDocumentCard
