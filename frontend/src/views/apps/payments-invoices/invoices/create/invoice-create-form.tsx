'use client'

// React Imports
import { useEffect, useMemo } from 'react'

// Next Imports
import { useRouter, useSearchParams } from 'next/navigation'

// Third-party Imports
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { toast } from 'sonner'

// Type Imports
import type { TransactionPickerOption } from '@/views/apps/payments-invoices/transaction-picker-field'
import type { InvoiceFormValues } from '@/views/apps/payments-invoices/invoices/create/invoice-form-schema'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import TransactionPickerField from '@/views/apps/payments-invoices/transaction-picker-field'
import InvoiceLineItemsField from '@/views/apps/payments-invoices/invoices/create/invoice-line-items-field'
import InvoiceSummaryCard from '@/views/apps/payments-invoices/invoices/create/invoice-summary-card'
import {
  buildBlankInvoiceFormValues,
  invoiceFormSchema
} from '@/views/apps/payments-invoices/invoices/create/invoice-form-schema'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'
import { useCustomersStore } from '@/store/use-customers-store'
import { useInvoicesStore } from '@/store/use-invoices-store'
import { useTransactionsStore } from '@/store/use-transactions-store'

// Utils Imports
import { computeInvoiceTotals } from '@/utils/invoice-utils'

const FORM_ID = 'invoice-create-form'

const InvoiceCreateForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTransactionId = searchParams.get('transactionId') ?? ''

  const transactions = useTransactionsStore(state => state.transactions)
  const bookings = useBookingsStore(state => state.bookings)
  const customers = useCustomersStore(state => state.items)
  const createInvoiceFromTransaction = useInvoicesStore(state => state.createInvoiceFromTransaction)

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: buildBlankInvoiceFormValues(preselectedTransactionId)
  })

  const transactionOptions = useMemo<TransactionPickerOption[]>(
    () =>
      transactions.map(item => {
        const booking = bookings.find(b => b.id === item.bookingId)
        const customer = customers.find(c => c.id === item.customerId)

        return {
          transaction: item,
          bookingTitle: booking?.packageTitle ?? 'Unknown package',
          bookingLocation: booking?.packageLocation ?? '—',
          customerName: booking?.contactName || customer?.name || 'Unknown customer'
        }
      }),
    [transactions, bookings, customers]
  )

  const transactionId = useWatch({ control, name: 'transactionId' })
  const lineItems = useWatch({ control, name: 'lineItems' })
  const discountAmount = useWatch({ control, name: 'discountAmount' })
  const taxRate = useWatch({ control, name: 'taxRate' })

  useEffect(() => {
    const option = transactionOptions.find(item => item.transaction.id === transactionId)

    if (!option) return

    const booking = bookings.find(b => b.id === option.transaction.bookingId)
    const customer = customers.find(c => c.id === option.transaction.customerId)

    setValue('billToName', booking?.contactName || customer?.name || '')
    setValue('billToEmail', booking?.contactEmail || customer?.email || '')
    setValue('billToPhone', booking?.contactPhone || customer?.phone || '')

    if (booking) {
      const baseAmount = booking.baseAmount ?? booking.totalAmount + (booking.discountAmount ?? 0)

      setValue('lineItems', [
        {
          label: `Package Cost — ${booking.packageTitle} (${booking.packageDays}D/${booking.packageNights}N)`,
          quantity: 1,
          unitPrice: baseAmount
        }
      ])
      setValue('discountAmount', booking.discountAmount ?? 0)
      setValue('couponCode', booking.couponCode ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId])

  const totals = useMemo(
    () =>
      computeInvoiceTotals(
        (lineItems ?? []).map(item => ({ amount: item.quantity * item.unitPrice })),
        discountAmount,
        taxRate
      ),
    [lineItems, discountAmount, taxRate]
  )

  const onSubmit = (values: InvoiceFormValues) => {
    const result = createInvoiceFromTransaction({
      transactionId: values.transactionId,
      dueDate: format(values.dueDate, 'yyyy-MM-dd'),
      billTo: { name: values.billToName, email: values.billToEmail, phone: values.billToPhone || undefined },
      lineItems: values.lineItems,
      discountAmount: values.discountAmount || undefined,
      couponCode: values.couponCode || undefined,
      taxRate: values.taxRate || undefined,
      notes: values.notes || undefined
    })

    if ('error' in result) {
      setError('transactionId', { message: result.error })

      return
    }

    toast.success('Invoice created')
    router.push(`/dashboard/payments-invoices/invoices/${result.invoiceId}`)
  }

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem] lg:items-start'>
        <Card className='shadow-none'>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Transaction</FieldLegend>
                <Controller
                  control={control}
                  name='transactionId'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.transactionId}>
                      <TransactionPickerField
                        options={transactionOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder='Search a transaction by ref, booking, or customer...'
                      />
                      <FieldError errors={[errors.transactionId]} />
                    </Field>
                  )}
                />
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend>Billed To</FieldLegend>
                <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <Controller
                    control={control}
                    name='billToName'
                    render={({ field }) => (
                      <Field data-invalid={!!errors.billToName}>
                        <FieldLabel htmlFor='billToName'>Name</FieldLabel>
                        <Input id='billToName' {...field} />
                        <FieldError errors={[errors.billToName]} />
                      </Field>
                    )}
                  />
                  <Controller
                    control={control}
                    name='billToEmail'
                    render={({ field }) => (
                      <Field data-invalid={!!errors.billToEmail}>
                        <FieldLabel htmlFor='billToEmail'>Email</FieldLabel>
                        <Input id='billToEmail' type='email' {...field} />
                        <FieldError errors={[errors.billToEmail]} />
                      </Field>
                    )}
                  />
                  <Controller
                    control={control}
                    name='billToPhone'
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor='billToPhone'>Phone</FieldLabel>
                        <Input id='billToPhone' {...field} />
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend>Charges</FieldLegend>
                <InvoiceLineItemsField control={control} errors={errors} />
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend>Notes</FieldLegend>
                <Controller
                  control={control}
                  name='notes'
                  render={({ field }) => <Textarea rows={3} placeholder='Thanks for traveling with us!' {...field} />}
                />
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className='flex flex-col gap-6'>
          <InvoiceSummaryCard control={control} errors={errors} totals={totals} />
          <Button type='submit' form={FORM_ID} disabled={isSubmitting || !transactionId} className='w-full'>
            Create Invoice
          </Button>
        </div>
      </div>
    </form>
  )
}

export default InvoiceCreateForm
