'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { z } from 'zod'

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

const addCardSchema = z.object({
  cardName: z.string().min(2, 'Enter cardholder name'),
  cardNumber: z
    .string()
    .transform(value => value.replace(/\s/g, ''))
    .refine(value => /^\d{16}$/.test(value), 'Enter a valid 16-digit card number'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Enter expiry in MM/YY format')
})

type FormValues = z.infer<typeof addCardSchema>

const AddCardDialog = () => {
  const [open, setOpen] = useState(false)
  const addCard = usePaymentMethodsStore(state => state.addCard)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(addCardSchema),
    defaultValues: { cardName: '', cardNumber: '', expiryDate: '' }
  })

  const onSubmit = (values: FormValues) => {
    addCard(values)
    reset()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        setOpen(value)
        if (!value) reset()
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <PlusIcon />
            Add Card
          </Button>
        }
      />
      <DialogContent className='sm:max-w-110'>
        <DialogHeader>
          <DialogTitle>Add a new card</DialogTitle>
          <DialogDescription>Save a card for faster checkout next time</DialogDescription>
        </DialogHeader>
        <form id='add-card-form' onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className='gap-4'>
            <Controller
              control={control}
              name='cardName'
              render={({ field }) => (
                <Field data-invalid={!!errors.cardName}>
                  <FieldLabel htmlFor='add-card-name'>Cardholder Name</FieldLabel>
                  <Input id='add-card-name' placeholder='John Doe' autoComplete='cc-name' {...field} />
                  <FieldError errors={[errors.cardName]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='cardNumber'
              render={({ field }) => (
                <Field data-invalid={!!errors.cardNumber}>
                  <FieldLabel htmlFor='add-card-number'>Card Number</FieldLabel>
                  <Input
                    id='add-card-number'
                    placeholder='0000 0000 0000 0000'
                    inputMode='numeric'
                    autoComplete='cc-number'
                    maxLength={19}
                    value={field.value}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 16)

                      field.onChange(digits.replace(/(.{4})/g, '$1 ').trim())
                    }}
                  />
                  <FieldError errors={[errors.cardNumber]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='expiryDate'
              render={({ field }) => (
                <Field data-invalid={!!errors.expiryDate}>
                  <FieldLabel htmlFor='add-card-expiry'>Expiry Date</FieldLabel>
                  <Input
                    id='add-card-expiry'
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
              Save Card
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddCardDialog
