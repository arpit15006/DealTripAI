'use client'

// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftIcon, InfoIcon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

// Type Imports
import type { PackageDetail } from '@/types/packages/package-detail-types'
import type { BookingContactInfo, TravelerInfo } from '@/types/packages/checkout-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import PromoCodeSection from '@/views/packages/checkout/promo-code-section'
import type { TravelerDraft } from '@/views/packages/checkout/traveler-info-section'
import TravelerInfoSection, {
  EMPTY_TRAVELER_DRAFT,
  isTravelerDraftComplete,
  travelerDraftToInfo
} from '@/views/packages/checkout/traveler-info-section'

// Store Imports
import { useBookingDraftStore } from '@/store/use-booking-draft-store'

const enterInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  agreeToUpdates: z.boolean().optional()
})

type FormValues = z.infer<typeof enterInfoSchema>

type EnterInfoStepProps = {
  packageDetail: PackageDetail
  travelers: number
  travelDate: string
  onPromoChange: (discount: number) => void
  onComplete: (info: BookingContactInfo, travelersInfo: TravelerInfo[], discount: number) => void
}

const EnterInfoStep = ({ packageDetail, travelers, onPromoChange, onComplete }: EnterInfoStepProps) => {
  const firstName = useBookingDraftStore(state => state.firstName)
  const lastName = useBookingDraftStore(state => state.lastName)
  const email = useBookingDraftStore(state => state.email)
  const phone = useBookingDraftStore(state => state.phone)

  const [promoDiscount, setPromoDiscount] = useState(0)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const [travelersData, setTravelersData] = useState<TravelerDraft[]>(() => [EMPTY_TRAVELER_DRAFT])

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(enterInfoSchema),
    defaultValues: {
      firstName,
      lastName,
      email,
      phone,
      agreeToUpdates: true
    }
  })

  useEffect(() => {
    reset(current => ({ ...current, firstName, lastName, email, phone }))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only resync once booking-form values are hydrated from the store
  }, [firstName, lastName, email, phone])

  const resolvedTravelersData = travelersData.map((traveler, index) =>
    index === 0
      ? {
          ...traveler,
          firstName: watch('firstName'),
          lastName: watch('lastName'),
          phone: watch('phone'),
          email: watch('email')
        }
      : traveler
  )

  const handleDiscountChange = (discount: number) => {
    setPromoDiscount(discount)
    onPromoChange(discount)
  }

  const allTravelersFilled =
    resolvedTravelersData.length === travelers && resolvedTravelersData.every(isTravelerDraftComplete)

  const onSubmit = (values: FormValues) => {
    if (!allTravelersFilled) {
      setSubmitAttempted(true)
      toast.error('Please add details for every traveler before continuing')

      return
    }

    onComplete(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone
      },
      resolvedTravelersData.map(travelerDraftToInfo),
      promoDiscount
    )
  }

  const onInvalid = () => setSubmitAttempted(true)

  return (
    <form id='enter-info-form' onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className='flex flex-col gap-5'>
      <Card className='shadow-none'>
        <CardHeader className='pb-3'>
          <div>
            <CardTitle className='text-base font-semibold'>Contact Information</CardTitle>
            <p className='text-muted-foreground mt-1 text-sm'>
              Prefilled from your booking &mdash; edit any field directly if needed
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <FieldGroup className='gap-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Controller
                control={control}
                name='firstName'
                render={({ field }) => (
                  <Field data-invalid={!!errors.firstName}>
                    <FieldLabel htmlFor='firstName'>First Name</FieldLabel>
                    <Input id='firstName' placeholder='John' aria-invalid={!!errors.firstName} {...field} />
                    <FieldError errors={[errors.firstName]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='lastName'
                render={({ field }) => (
                  <Field data-invalid={!!errors.lastName}>
                    <FieldLabel htmlFor='lastName'>Last Name</FieldLabel>
                    <Input id='lastName' placeholder='Doe' aria-invalid={!!errors.lastName} {...field} />
                    <FieldError errors={[errors.lastName]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='phone'
                render={({ field }) => (
                  <Field data-invalid={!!errors.phone}>
                    <FieldLabel htmlFor='phone'>Phone Number</FieldLabel>
                    <Input
                      id='phone'
                      type='tel'
                      placeholder='+1 (555) 000-0000'
                      aria-invalid={!!errors.phone}
                      {...field}
                    />
                    <FieldError errors={[errors.phone]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name='email'
                render={({ field }) => (
                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor='email'>Email Address</FieldLabel>
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
            </div>

            <Controller
              control={control}
              name='agreeToUpdates'
              render={({ field }) => (
                <div className='flex items-center gap-2.5'>
                  <Checkbox id='agreeToUpdates' checked={field.value} onCheckedChange={field.onChange} />
                  <Label
                    htmlFor='agreeToUpdates'
                    className='text-muted-foreground cursor-pointer text-sm leading-relaxed'
                  >
                    I want to receive exclusive offers via email, notifications, SMS, and messaging tools
                  </Label>
                </div>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className='shadow-none'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-semibold'>Traveler Information</CardTitle>
          <p className='text-muted-foreground mt-1 text-sm'>Add details for each traveler included in this booking</p>
        </CardHeader>
        <CardContent>
          <TravelerInfoSection
            travelers={travelers}
            value={resolvedTravelersData}
            onChange={setTravelersData}
            showErrors={submitAttempted}
          />
        </CardContent>
      </Card>

      <PromoCodeSection packageDetail={packageDetail} travelers={travelers} onDiscountChange={handleDiscountChange} />

      <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20'>
        <InfoIcon className='mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400' />
        <p className='text-sm text-amber-700 dark:text-amber-400'>
          <strong>Note:</strong> Contact details are prefilled from your booking form &mdash; feel free to edit any
          field above before continuing.
        </p>
      </div>

      <Separator />

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Button
          type='button'
          variant='outline'
          size='lg'
          className='max-sm:w-full'
          onClick={() => window.history.back()}
        >
          <ArrowLeftIcon className='size-4' />
          Go Back
        </Button>
        <Button type='submit' size='lg' className='max-sm:w-full' disabled={isSubmitting}>
          Continue to Payment
        </Button>
      </div>
    </form>
  )
}

export default EnterInfoStep
