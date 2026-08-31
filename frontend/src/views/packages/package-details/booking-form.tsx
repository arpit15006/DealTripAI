'use client'

// React Imports
import { useMemo } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import { format } from 'date-fns'
import { ChevronDownIcon, InfoIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Type Imports
import type { PackageDetail } from '@/types/packages/package-detail-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

// Store Imports
import { useBookingDraftStore } from '@/store/use-booking-draft-store'
import { useBookingHistoryStore } from '@/store/use-booking-history-store'
import { useCheckoutStore } from '@/store/use-checkout-store'

type BookingFormProps = {
  packageDetail: PackageDetail
}

const PHONE_REGEX = /^\+[1-9]\d{0,14}$/

const buildFormSchema = (maxMembers: number) =>
  z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
    email: z.email('Enter a valid email address.'),
    phone: z
      .string()
      .min(1, 'Phone number is required.')
      .regex(PHONE_REGEX, 'Enter a valid phone number (up to 15 digits).'),
    travelDate: z.date({ error: 'Please select a travel date.' }),
    travelers: z.coerce
      .number({ error: 'Enter the number of travelers.' })
      .int('Enter a whole number.')
      .min(1, 'At least 1 traveler is required.')
      .max(maxMembers, `A maximum of ${maxMembers} travelers is allowed at a time.`),
    specialRequests: z.string().optional()
  })

type FormValues = z.input<ReturnType<typeof buildFormSchema>>
type FormOutput = z.output<ReturnType<typeof buildFormSchema>>

const DEFAULT_VALUES = {
  fullName: '',
  email: '',
  phone: '',
  travelDate: undefined,
  travelers: '2',
  specialRequests: ''
} as unknown as FormValues

const BookingForm = ({ packageDetail }: BookingFormProps) => {
  const router = useRouter()
  const setBookingDraft = useBookingDraftStore(state => state.setBookingDraft)
  const startNewCheckout = useCheckoutStore(state => state.startNewCheckout)
  const bookingCount = useBookingHistoryStore(state => state.counts[packageDetail.slug] ?? 0)

  const maxMembers = packageDetail.maxMembers ?? 30
  const formSchema = useMemo(() => buildFormSchema(maxMembers), [maxMembers])

  const availableDates = packageDetail.availableDates
  const availableDatesSet = useMemo(() => new Set(availableDates), [availableDates])

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES
  })

  const travelers = Number(watch('travelers')) || 1
  const totalPrice = travelers * packageDetail.price

  const onSubmit = (values: FormOutput) => {
    const dateStr = format(values.travelDate, 'yyyy-MM-dd')
    const [firstName, ...lastNameParts] = values.fullName.trim().split(/\s+/)

    setBookingDraft({
      packageSlug: packageDetail.slug,
      firstName,
      lastName: lastNameParts.join(' '),
      email: values.email,
      phone: values.phone,
      specialRequests: values.specialRequests,
      travelDate: dateStr,
      travelers: values.travelers
    })

    startNewCheckout(packageDetail.slug)

    router.push(`/checkout/${packageDetail.slug}?travelers=${values.travelers}&date=${dateStr}`)
  }

  return (
    <Card className='shadow-none lg:sticky lg:top-35'>
      <CardHeader>
        <CardTitle className='flex items-baseline gap-1.5 text-2xl'>
          {packageDetail.originalPrice && (
            <span className='text-muted-foreground text-lg font-normal line-through'>
              ${packageDetail.originalPrice}
            </span>
          )}
          ${packageDetail.price}
          <span className='text-muted-foreground text-sm font-normal'>/ person</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form id='booking-form' onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          <FieldGroup className='gap-4'>
            <Controller
              control={control}
              name='fullName'
              render={({ field }) => (
                <Field data-invalid={!!errors.fullName}>
                  <FieldLabel htmlFor='fullName'>Full Name</FieldLabel>
                  <Input id='fullName' placeholder='John Doe' aria-invalid={!!errors.fullName} {...field} />
                  <FieldError errors={[errors.fullName]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='email'
              render={({ field }) => (
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor='email'>Email</FieldLabel>
                  <Input
                    id='email'
                    type='email'
                    placeholder='name@example.com'
                    aria-invalid={!!errors.email}
                    {...field}
                  />
                  <FieldError errors={[errors.email]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='phone'
              render={({ field }) => (
                <Field data-invalid={!!errors.phone}>
                  <FieldLabel htmlFor='phone'>Phone</FieldLabel>
                  <PhoneInput
                    id='phone'
                    defaultCountry='US'
                    placeholder='Enter contact number'
                    aria-invalid={!!errors.phone}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  <FieldError errors={[errors.phone]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='travelDate'
              render={({ field }) => (
                <Field data-invalid={!!errors.travelDate}>
                  <FieldLabel htmlFor='travelDate'>Travel Date</FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          id='travelDate'
                          variant='outline'
                          data-empty={!field.value}
                          aria-invalid={!!errors.travelDate}
                          className='data-[empty=true]:text-muted-foreground w-full justify-between font-normal'
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <ChevronDownIcon data-icon='inline-end' />
                        </Button>
                      }
                    />
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        defaultMonth={field.value}
                        disabled={date =>
                          date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                          (availableDatesSet.size > 0 && !availableDatesSet.has(format(date, 'yyyy-MM-dd')))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  {availableDatesSet.size > 0 && (
                    <p className='text-muted-foreground text-xs'>Only fixed departure dates can be selected.</p>
                  )}
                  <FieldError errors={[errors.travelDate]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='travelers'
              render={({ field }) => (
                <Field data-invalid={!!errors.travelers}>
                  <FieldLabel htmlFor='travelers'>Travelers (max {maxMembers})</FieldLabel>
                  <Input
                    id='travelers'
                    type='number'
                    min={1}
                    max={maxMembers}
                    step={1}
                    inputMode='numeric'
                    aria-invalid={!!errors.travelers}
                    {...field}
                    value={field.value as number | string}
                  />
                  <FieldError errors={[errors.travelers]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='specialRequests'
              render={({ field }) => (
                <Field data-invalid={!!errors.specialRequests}>
                  <FieldLabel htmlFor='specialRequests'>Special Requests</FieldLabel>
                  <Textarea
                    id='specialRequests'
                    placeholder='Dietary needs, accessibility, etc.'
                    aria-invalid={!!errors.specialRequests}
                    {...field}
                  />
                  <FieldError errors={[errors.specialRequests]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        {bookingCount > 0 && (
          <div className='mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20'>
            <InfoIcon className='mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400' />
            <p className='text-sm text-amber-700 dark:text-amber-400'>
              <strong>Note:</strong> You&apos;ve already booked this package {bookingCount}{' '}
              {bookingCount === 1 ? 'time' : 'times'}.
            </p>
          </div>
        )}

        <Separator className='my-4' />
        <div className='flex items-center justify-between text-sm'>
          <span className='text-muted-foreground'>
            ${packageDetail.price} &times; {travelers} {travelers === 1 ? 'traveler' : 'travelers'}
          </span>
          <span className='font-semibold'>${totalPrice}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button type='submit' form='booking-form' className='w-full' disabled={isSubmitting}>
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  )
}

export default BookingForm
