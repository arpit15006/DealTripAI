'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCardIcon, LockIcon, ShieldCheckIcon, SmartphoneIcon } from 'lucide-react'
import { z } from 'zod'

// Type Imports
import type { PaymentResult } from '@/types/packages/checkout-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import SavedCardItem from '@/components/payment/saved-card-item'

// Store Imports
import { usePaymentMethodsStore } from '@/store/use-payment-methods-store'

// Utils Imports
import { cn } from '@/lib/utils'

const PAYMENT_TIMEOUT_SECONDS = 2 * 60 * 60

const paymentSchema = z
  .object({
    method: z.enum(['card', 'upi']),
    savedCardId: z.string().optional(),
    cardName: z.string().optional(),
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    saveCard: z.boolean().optional(),
    agreeToTerms: z.boolean().refine(v => v === true, 'You must agree to the terms and conditions to continue')
  })
  .superRefine((data, ctx) => {
    if (data.method === 'card' && !data.savedCardId) {
      if (!data.cardName || data.cardName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter cardholder name',
          path: ['cardName']
        })
      }

      const stripped = (data.cardNumber ?? '').replace(/\s/g, '')

      if (stripped.length !== 16 || !/^\d+$/.test(stripped)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid 16-digit card number',
          path: ['cardNumber']
        })
      }

      if (!data.expiryDate || !/^\d{2}\/\d{2}$/.test(data.expiryDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter expiry in MM/YY format',
          path: ['expiryDate']
        })
      }

      if (!data.cvv || !/^\d{3,4}$/.test(data.cvv)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid CVV (3 or 4 digits)',
          path: ['cvv']
        })
      }
    }
  })

type FormValues = z.infer<typeof paymentSchema>

type PaymentStepProps = {
  finalTotal: number
  baseTotal: number
  promoDiscount: number
  onComplete: (result: PaymentResult) => void
}

const formatCountdown = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const PaymentStep = ({ finalTotal, baseTotal, promoDiscount, onComplete }: PaymentStepProps) => {
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT_SECONDS)

  const paymentMethods = usePaymentMethodsStore(state => state.items)
  const addCard = usePaymentMethodsStore(state => state.addCard)
  const removeCard = usePaymentMethodsStore(state => state.removeCard)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: 'card',
      savedCardId: paymentMethods[0]?.id ?? '',
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      saveCard: false,
      agreeToTerms: false
    }
  })

  const selectedMethod = watch('method')
  const selectedSavedCardId = watch('savedCardId')
  const isUsingNewCard = !selectedSavedCardId

  const onSubmit = async (values: FormValues) => {
    await new Promise<void>(resolve => setTimeout(resolve, 1500))

    if (values.method === 'upi') {
      onComplete({ method: 'upi' })

      return
    }

    const selectedCard = paymentMethods.find(paymentMethod => paymentMethod.id === values.savedCardId)

    const cardLast4 = selectedCard
      ? (selectedCard.name.match(/(\d{4})$/)?.[1] ?? '')
      : (values.cardNumber ?? '').replace(/\D/g, '').slice(-4)

    if (!selectedCard && values.saveCard && values.cardName && values.cardNumber && values.expiryDate) {
      addCard({ cardName: values.cardName, cardNumber: values.cardNumber, expiryDate: values.expiryDate })
    }

    onComplete({ method: 'card', cardLast4 })
  }

  return (
    <form id='payment-form' onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-5'>
      <div className='flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20'>
        <p className='text-sm font-medium text-amber-700 dark:text-amber-400'>
          Complete payment to confirm your booking
        </p>
        <span className='font-mono text-sm font-bold text-amber-700 tabular-nums dark:text-amber-400'>
          {formatCountdown(timeLeft)}
        </span>
      </div>

      <div className='bg-muted/40 flex items-center gap-3 rounded-xl border px-4 py-3'>
        <ShieldCheckIcon className='size-5 shrink-0 text-green-600' />
        <p className='text-sm font-medium'>All card information is fully encrypted, secure, and protected</p>
      </div>

      <Card className='shadow-none'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-semibold'>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={control}
            name='method'
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className='gap-3'>
                <Label
                  htmlFor='method-card'
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all',
                    field.value === 'card' ? 'border-primary bg-primary/5 ring-primary/20 ring-1' : 'hover:bg-muted/50'
                  )}
                >
                  <RadioGroupItem id='method-card' value='card' />
                  <CreditCardIcon className='text-muted-foreground size-5' />
                  <span className='flex-1 font-medium'>Credit / Debit Card</span>
                  <div className='flex items-center gap-1'>
                    <Badge variant='outline' className='px-1.5 text-xs'>
                      VISA
                    </Badge>
                    <Badge variant='outline' className='px-1.5 text-xs'>
                      MC
                    </Badge>
                    <Badge variant='outline' className='px-1.5 text-xs'>
                      AMEX
                    </Badge>
                  </div>
                </Label>

                <Label
                  htmlFor='method-upi'
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all',
                    field.value === 'upi' ? 'border-primary bg-primary/5 ring-primary/20 ring-1' : 'hover:bg-muted/50'
                  )}
                >
                  <RadioGroupItem id='method-upi' value='upi' />
                  <SmartphoneIcon className='text-muted-foreground size-5' />
                  <span className='flex-1 font-medium'>UPI / Wallet</span>
                  <Badge variant='outline' className='px-1.5 text-xs text-green-600'>
                    Instant
                  </Badge>
                </Label>
              </RadioGroup>
            )}
          />
        </CardContent>
      </Card>

      {selectedMethod === 'card' && (
        <Card className='shadow-none'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base font-semibold'>
              <CreditCardIcon className='size-4' />
              Card Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-6 lg:col-span-2'>
              <Controller
                control={control}
                name='savedCardId'
                render={({ field }) => (
                  <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    {paymentMethods.map(paymentMethod => (
                      <SavedCardItem
                        key={paymentMethod.id}
                        paymentMethod={paymentMethod}
                        isSelected={field.value === paymentMethod.id}
                        onToggle={() => {
                          field.onChange(field.value === paymentMethod.id ? '' : paymentMethod.id)
                        }}
                        onDelete={() => {
                          if (field.value === paymentMethod.id) field.onChange('')
                          removeCard(paymentMethod.id)
                        }}
                      />
                    ))}
                  </div>
                )}
              />

              <div className='my-6 flex items-center justify-center'>
                <Separator className='flex-1' />
                <span className='text-muted-foreground px-6 text-lg'>or</span>
                <Separator className='flex-1' />
              </div>

              <h5 className='text-muted-foreground text-base'>
                Add a new payment method
                {!isUsingNewCard && (
                  <span className='text-muted-foreground/70 ml-2 text-sm'>
                    (deselect the card above to fill this in)
                  </span>
                )}
              </h5>
              <FieldGroup className='gap-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <Controller
                    control={control}
                    name='cardName'
                    render={({ field }) => (
                      <Field data-invalid={!!errors.cardName}>
                        <FieldLabel htmlFor='cardName'>Cardholder Name</FieldLabel>
                        <Input
                          id='cardName'
                          placeholder='John Doe'
                          autoComplete='cc-name'
                          aria-invalid={!!errors.cardName}
                          disabled={!isUsingNewCard}
                          {...field}
                        />
                        <FieldError errors={[errors.cardName]} />
                      </Field>
                    )}
                  />
                  <Controller
                    control={control}
                    name='cardNumber'
                    render={({ field }) => (
                      <Field data-invalid={!!errors.cardNumber}>
                        <FieldLabel htmlFor='cardNumber'>Card Number</FieldLabel>
                        <Input
                          id='cardNumber'
                          placeholder='0000 0000 0000 0000'
                          inputMode='numeric'
                          autoComplete='cc-number'
                          maxLength={19}
                          aria-invalid={!!errors.cardNumber}
                          disabled={!isUsingNewCard}
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
                        <FieldLabel htmlFor='expiryDate'>Expiry Date</FieldLabel>
                        <Input
                          id='expiryDate'
                          placeholder='MM/YY'
                          inputMode='numeric'
                          autoComplete='cc-exp'
                          maxLength={5}
                          aria-invalid={!!errors.expiryDate}
                          disabled={!isUsingNewCard}
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
                  <Controller
                    control={control}
                    name='cvv'
                    render={({ field }) => (
                      <Field data-invalid={!!errors.cvv}>
                        <FieldLabel htmlFor='cvv'>CVV</FieldLabel>
                        <Input
                          id='cvv'
                          placeholder='•••'
                          inputMode='numeric'
                          autoComplete='cc-csc'
                          maxLength={4}
                          aria-invalid={!!errors.cvv}
                          disabled={!isUsingNewCard}
                          value={field.value}
                          onChange={e => {
                            field.onChange(e.target.value.replace(/\D/g, '').slice(0, 4))
                          }}
                        />
                        <FieldError errors={[errors.cvv]} />
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  control={control}
                  name='saveCard'
                  render={({ field }) => (
                    <div className='flex items-center gap-2.5'>
                      <Checkbox
                        id='saveCard'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isUsingNewCard}
                      />
                      <Label htmlFor='saveCard' className='cursor-pointer text-sm'>
                        Save card details for faster checkout
                      </Label>
                    </div>
                  )}
                />
              </FieldGroup>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMethod === 'upi' && (
        <Card className='shadow-none'>
          <CardContent className='pt-6'>
            <div className='space-y-3 text-center'>
              <img src='/images/qr-code.webp' alt='QR Code' className='mx-auto w-37.5' />
              <p className='text-muted-foreground mt-1 text-sm'>
                You&apos;ll be redirected to your UPI app to complete the payment securely
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className='shadow-none'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-semibold'>Cancellation Policy</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <ul className='text-muted-foreground flex flex-col gap-2 text-sm'>
            {[
              'Free cancellation up to 72 hours before your departure date',
              '50% refund for cancellations made 24–72 hours before departure',
              'No refund for cancellations within 24 hours of departure',
              'All prices include applicable taxes and service fees'
            ].map((point, i) => (
              <li key={i} className='flex items-center gap-2.5'>
                <span className='text-primary mt-1 size-1.5 shrink-0 rounded-full bg-current' />
                {point}
              </li>
            ))}
          </ul>

          <Separator />

          <Controller
            control={control}
            name='agreeToTerms'
            render={({ field }) => (
              <Field data-invalid={!!errors.agreeToTerms}>
                <div className='flex items-center gap-2.5'>
                  <Checkbox
                    id='agreeToTerms'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={!!errors.agreeToTerms}
                  />
                  <Label htmlFor='agreeToTerms' className='cursor-pointer text-sm leading-relaxed'>
                    By continuing, I acknowledge and agree to the{' '}
                    <Link href='#' className='text-primary cursor-pointer underline underline-offset-2'>
                      General Terms of Use
                    </Link>{' '}
                    and{' '}
                    <Link href='#' className='text-primary cursor-pointer underline underline-offset-2'>
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                <FieldError errors={[errors.agreeToTerms]} />
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <div className='bg-muted/30 rounded-xl border px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-0.5'>
            {promoDiscount > 0 && (
              <span className='text-muted-foreground text-xs line-through'>${baseTotal.toLocaleString()}</span>
            )}
            <span className='text-2xl font-bold'>${finalTotal.toLocaleString()}</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <LockIcon className='size-4 text-green-600' />
            <p className='text-muted-foreground text-base'>
              Payment processed by{' '}
              <Link href='#' className='text-primary underline'>
                Polar
              </Link>{' '}
            </p>
          </div>
        </div>
      </div>

      <Button type='submit' size='lg' className='w-full text-base' disabled={isSubmitting}>
        {isSubmitting ? 'Processing Payment…' : `Pay $${finalTotal.toLocaleString()}`}
      </Button>
    </form>
  )
}

export default PaymentStep
