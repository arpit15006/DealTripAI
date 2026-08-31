'use client'

// React Imports
import { useEffect } from 'react'

// Third-party Imports
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

// Type Imports
import type { Customer } from '@/types/apps/customer-types'
import { CUSTOMER_STATUS_LIST } from '@/types/apps/customer-types'

// Component Imports
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { editCustomerSchema } from '@/views/apps/customers/profile/edit-customer-schema'
import type { EditCustomerFormValues } from '@/views/apps/customers/profile/edit-customer-schema'

const STATUS_ITEMS = CUSTOMER_STATUS_LIST.map(status => ({ label: status, value: status }))

type EditCustomerDialogProps = {
  open: boolean
  customer: Customer
  isSynced: boolean
  onClose: () => void
  onSubmit: (values: EditCustomerFormValues) => void
}

const EditCustomerDialog = ({ open, customer, isSynced, onClose, onSubmit }: EditCustomerDialogProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditCustomerFormValues>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status
    }
  })

  useEffect(() => {
    if (open) {
      reset({ name: customer.name, email: customer.email, phone: customer.phone, status: customer.status })
    }
  }, [open, customer, reset])

  const handleFormSubmit = (values: EditCustomerFormValues) => {
    onSubmit(values)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>Update this customer&apos;s details.</DialogDescription>
        </DialogHeader>

        {isSynced && (
          <p className='bg-primary/5 text-muted-foreground rounded-md border px-3 py-2 text-sm'>
            This customer is linked to your signed-in Account &gt; Profile — name, email and phone changes here will
            also update the Landing/Site profile.
          </p>
        )}

        <form id='edit-customer-form' onSubmit={handleSubmit(handleFormSubmit)}>
          <FieldGroup>
            <Controller
              control={control}
              name='name'
              render={({ field }) => (
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor='customer-name'>Name</FieldLabel>
                  <Input id='customer-name' placeholder='Enter full name' {...field} />
                  <FieldError errors={[errors.name]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name='email'
              render={({ field }) => (
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor='customer-email'>Email</FieldLabel>
                  <Input id='customer-email' type='email' placeholder='name@example.com' {...field} />
                  <FieldError errors={[errors.email]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name='phone'
              render={({ field }) => (
                <Field data-invalid={!!errors.phone}>
                  <FieldLabel htmlFor='customer-phone'>Phone</FieldLabel>
                  <Input id='customer-phone' placeholder='+1 555-000-0000' {...field} />
                  <FieldError errors={[errors.phone]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name='status'
              render={({ field }) => (
                <Field data-invalid={!!errors.status}>
                  <FieldLabel htmlFor='customer-status'>Status</FieldLabel>
                  <Select
                    items={STATUS_ITEMS}
                    value={field.value || 'active'}
                    onValueChange={value => value && field.onChange(value)}
                  >
                    <SelectTrigger id='customer-status' className='w-full capitalize'>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {STATUS_ITEMS.map(item => (
                          <SelectItem key={item.value} value={item.value} className='capitalize'>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.status]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit' form='edit-customer-form'>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditCustomerDialog
