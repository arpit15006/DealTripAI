'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Type Imports
import type { SavedPaymentMethod } from '@/types/packages/checkout-types'

// Component Imports
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

// Store Imports
import { usePaymentMethodsStore } from '@/store/use-payment-methods-store'

const editCardSchema = z.object({
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Enter expiry in MM/YY format')
})

type FormValues = z.infer<typeof editCardSchema>

type EditCardDialogProps = {
  paymentMethod: SavedPaymentMethod
}

const EditCardDialog = ({ paymentMethod }: EditCardDialogProps) => {
  const [open, setOpen] = useState(false)
  const updateCard = usePaymentMethodsStore(state => state.updateCard)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(editCardSchema),
    defaultValues: { expiryDate: paymentMethod.expiry }
  })

  const onSubmit = (values: FormValues) => {
    updateCard(paymentMethod.id, values.expiryDate)
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        setOpen(value)
        if (value) reset({ expiryDate: paymentMethod.expiry })
      }}
    >
      <DialogTrigger
        render={
          <Button
            type='button'
            variant='link'
            className='text-muted-foreground h-auto p-0 text-sm'
            onClick={e => e.stopPropagation()}
          />
        }
      >
        Edit
      </DialogTrigger>
      <DialogContent className='sm:max-w-100'>
        <DialogHeader>
          <DialogTitle>Edit {paymentMethod.name}</DialogTitle>
          <DialogDescription>Update the expiry date for this card</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name='expiryDate'
              render={({ field }) => (
                <Field data-invalid={!!errors.expiryDate}>
                  <FieldLabel htmlFor='edit-card-expiry'>Expiry Date</FieldLabel>
                  <Input
                    id='edit-card-expiry'
                    placeholder='MM/YY'
                    inputMode='numeric'
                    autoComplete='cc-exp'
                    maxLength={5}
                    value={field.value}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 4)

                      field.onChange(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits)
                    }}
                  />
                  <FieldError errors={[errors.expiryDate]} />
                </Field>
              )}
            />
          </FieldGroup>
          <div className='mt-6 flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditCardDialog
