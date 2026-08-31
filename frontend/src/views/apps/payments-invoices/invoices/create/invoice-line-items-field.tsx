'use client'

// Third-party Imports
import { Controller, useWatch } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'

// Type Imports
import type { InvoiceFormValues } from '@/views/apps/payments-invoices/invoices/create/invoice-form-schema'

// Component Imports
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type InvoiceLineItemsFieldProps = {
  control: Control<InvoiceFormValues>
  errors: FieldErrors<InvoiceFormValues>
}

const currency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const InvoiceLineItemsField = ({ control, errors }: InvoiceLineItemsFieldProps) => {
  const quantity = useWatch({ control, name: 'lineItems.0.quantity' }) ?? 0
  const unitPrice = useWatch({ control, name: 'lineItems.0.unitPrice' }) ?? 0

  return (
    <div className='flex flex-col gap-3'>
      <div className='hidden grid-cols-[1fr_90px_110px_100px] gap-3 sm:grid'>
        <Label className='text-muted-foreground text-xs'>Item</Label>
        <Label className='text-muted-foreground text-xs'>Qty</Label>
        <Label className='text-muted-foreground text-xs'>Unit Price</Label>
        <Label className='text-muted-foreground text-xs'>Amount</Label>
      </div>

      <div className='grid grid-cols-1 items-start gap-3 sm:grid-cols-[1fr_90px_110px_100px]'>
        <Controller
          control={control}
          name='lineItems.0.label'
          render={({ field }) => (
            <Field data-invalid={!!errors.lineItems?.[0]?.label}>
              <Input placeholder='Item name' {...field} />
              <FieldError errors={[errors.lineItems?.[0]?.label]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name='lineItems.0.quantity'
          render={({ field }) => (
            <Field data-invalid={!!errors.lineItems?.[0]?.quantity}>
              <Input
                type='number'
                min={1}
                step='1'
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={e => field.onChange(e.target.valueAsNumber || 0)}
              />
              <FieldError errors={[errors.lineItems?.[0]?.quantity]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name='lineItems.0.unitPrice'
          render={({ field }) => (
            <Field data-invalid={!!errors.lineItems?.[0]?.unitPrice}>
              <Input
                type='number'
                min={0}
                step='0.01'
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={e => field.onChange(e.target.valueAsNumber || 0)}
              />
              <FieldError errors={[errors.lineItems?.[0]?.unitPrice]} />
            </Field>
          )}
        />

        <span className='pt-2 text-sm font-medium'>{currency(quantity * unitPrice)}</span>
      </div>
    </div>
  )
}

export default InvoiceLineItemsField
