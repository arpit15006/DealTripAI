'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { Controller } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

// Type Imports
import type { InvoiceFormValues } from '@/views/apps/payments-invoices/invoices/create/invoice-form-schema'
import type { InvoiceTotals } from '@/utils/invoice-utils'

// Component Imports
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

// Utils Imports
import { cn } from '@/lib/utils'

type InvoiceSummaryCardProps = {
  control: Control<InvoiceFormValues>
  errors: FieldErrors<InvoiceFormValues>
  totals: InvoiceTotals
}

const currency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const InvoiceSummaryCard = ({ control, errors, totals }: InvoiceSummaryCardProps) => {
  const [dueDateOpen, setDueDateOpen] = useState(false)

  return (
    <Card className='shadow-none'>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Controller
            control={control}
            name='dueDate'
            render={({ field }) => (
              <Field data-invalid={!!errors.dueDate}>
                <FieldLabel htmlFor='dueDate'>Due Date</FieldLabel>
                <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        id='dueDate'
                        type='button'
                        variant='outline'
                        className={cn('w-full justify-start font-normal', !field.value && 'text-muted-foreground')}
                      />
                    }
                  >
                    <CalendarIcon className='size-4' />
                    {field.value ? format(field.value, 'PPP') : 'Select date'}
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      defaultMonth={field.value}
                      onSelect={date => {
                        if (date) field.onChange(date)
                        setDueDateOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError errors={[errors.dueDate]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name='discountAmount'
            render={({ field }) => (
              <Field orientation='horizontal' data-invalid={!!errors.discountAmount}>
                <FieldLabel htmlFor='discountAmount'>Discount ($)</FieldLabel>
                <Input
                  id='discountAmount'
                  type='number'
                  min={0}
                  step='0.01'
                  className='max-w-32'
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                />
                <FieldError errors={[errors.discountAmount]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name='taxRate'
            render={({ field }) => (
              <Field orientation='horizontal' data-invalid={!!errors.taxRate}>
                <FieldLabel htmlFor='taxRate'>Tax (%)</FieldLabel>
                <Input
                  id='taxRate'
                  type='number'
                  min={0}
                  max={100}
                  step='0.1'
                  className='max-w-32'
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={e => field.onChange(Math.min(100, e.target.valueAsNumber || 0))}
                />
                <FieldError errors={[errors.taxRate]} />
              </Field>
            )}
          />

          <Separator />

          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Subtotal</span>
              <span>{currency(totals.subtotal)}</span>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Tax</span>
              <span>{currency(totals.taxAmount)}</span>
            </div>
            <Separator />
            <div className='flex items-center justify-between font-semibold'>
              <span>Total</span>
              <span>{currency(totals.total)}</span>
            </div>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

export default InvoiceSummaryCard
