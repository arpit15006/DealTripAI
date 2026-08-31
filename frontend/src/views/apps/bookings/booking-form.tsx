'use client'

// React Imports
import { useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Third-party Imports
import { addDays, format } from 'date-fns'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon,
  InfoIcon,
  NotebookPenIcon,
  TagIcon,
  TicketPercentIcon
} from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'

// Type Imports
import type { Booking, BookingStatus } from '@/types/account/booking-types'
import { BOOKING_STATUS_LIST } from '@/types/account/booking-types'
import type { PaymentMethod, TravelerInfo } from '@/types/packages/checkout-types'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import PackagePickerField from './package-picker-field'
import TravelersInfoField from './travelers-info-field'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'
import { useCouponStore } from '@/store/use-coupon-store'
import { useCouponsStore } from '@/store/use-coupons-store'
import { useProfileStore } from '@/store/use-profile-store'
import { useTourPackagesStore } from '@/store/use-tour-packages-store'
import { useTransactionsStore } from '@/store/use-transactions-store'

// Utils Imports
import { generateBookingRef, resolveCoupon } from '@/utils/booking-form-utils'
import { BOOKING_STATUS_LABEL, DEFAULT_CONTACT_AVATAR } from '@/utils/booking-utils'
import { getDiscountedPrice } from '@/utils/build-package-detail'

const FORM_ID = 'booking-form'

const PAYMENT_METHOD_OPTIONS: { label: string; value: PaymentMethod }[] = [
  { label: 'Card', value: 'card' },
  { label: 'UPI', value: 'upi' }
]

const STATUS_OPTIONS = BOOKING_STATUS_LIST.map(value => ({ label: BOOKING_STATUS_LABEL[value], value }))

const bookingSchema = z.object({
  packageId: z.string().min(1, 'Select a package'),
  contactName: z.string().min(2, 'Enter the customer name'),
  contactEmail: z.email('Enter a valid email address'),
  contactPhone: z.string().min(7, 'Enter a valid phone number'),
  travelDate: z.date({ error: 'Please select a travel date' }),
  travelers: z.coerce
    .number({ error: 'Enter the number of travelers' })
    .int('Enter a whole number')
    .min(1, 'At least 1 traveler is required'),
  couponCode: z.string(),
  paymentMethod: z.enum(['card', 'upi']),
  cardLast4: z.string(),
  status: z.enum(BOOKING_STATUS_LIST as [BookingStatus, ...BookingStatus[]]),
  notes: z.string()
})

type FormValues = z.input<typeof bookingSchema>
type FormOutput = z.output<typeof bookingSchema>

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')

type BookingFormProps = {
  booking?: Booking
}

const BookingForm = ({ booking }: BookingFormProps) => {
  const router = useRouter()
  const packages = useTourPackagesStore(state => state.items)
  const coupons = useCouponStore(state => state.coupons)
  const addBooking = useBookingsStore(state => state.addBooking)
  const upsertBooking = useBookingsStore(state => state.upsertBooking)
  const profileUser = useProfileStore(state => state.user)

  const initialPackage = booking ? packages.find(item => item.slug === booking.packageSlug) : undefined
  const [travelersInfo, setTravelersInfo] = useState<TravelerInfo[]>(booking?.travelersInfo ?? [])
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      packageId: initialPackage?.id ?? '',
      contactName: booking?.contactName ?? '',
      contactEmail: booking?.contactEmail ?? '',
      contactPhone: booking?.contactPhone ?? '',
      travelDate: booking ? new Date(`${booking.travelDate}T00:00:00`) : undefined,
      travelers: booking?.travelers ?? 1,
      couponCode: booking?.couponCode ?? '',
      paymentMethod: booking?.paymentResult.method ?? 'card',
      cardLast4: booking?.paymentResult.cardLast4 ?? '',
      status: booking?.status ?? 'upcoming',
      notes: booking?.notes ?? ''
    }
  })

  const selectedPackageId = watch('packageId')
  const selectedPackage = packages.find(item => item.id === selectedPackageId)
  const maxMembers = selectedPackage?.maxMembers ?? 30
  const travelers = Number(watch('travelers')) || 1
  const paymentMethod = watch('paymentMethod')
  const couponCode = watch('couponCode')
  const contactName = watch('contactName')
  const contactEmail = watch('contactEmail')
  const contactPhone = watch('contactPhone')
  const travelDate = watch('travelDate')

  const availableDatesSet = useMemo(
    () => new Set(selectedPackage?.availableDates ?? []),
    [selectedPackage?.availableDates]
  )

  const discountedPrice = selectedPackage ? getDiscountedPrice(selectedPackage) : 0
  const baseAmount = discountedPrice * travelers
  const couponPreview = resolveCoupon(couponCode, coupons, baseAmount)
  const finalAmount = baseAmount - (couponPreview.valid ? couponPreview.amount : 0)

  const returnDate = selectedPackage && travelDate ? addDays(travelDate, Math.max(selectedPackage.days - 1, 0)) : null

  const isProfileUser = Boolean(profileUser.email) && contactEmail === profileUser.email
  const avatarSrc = (isProfileUser ? profileUser.avatar : booking?.contactAvatar) || DEFAULT_CONTACT_AVATAR

  const [primaryFirstName, ...primaryLastNameParts] = contactName.trim().split(/\s+/)

  const primaryContact = {
    firstName: contactName.trim() ? primaryFirstName : '',
    lastName: primaryLastNameParts.join(' '),
    email: contactEmail,
    phone: contactPhone
  }

  const handleTravelersInfoChange = (next: TravelerInfo[]) => {
    setTravelersInfo(next)
    if (next.length > 0) setValue('travelers', next.length, { shouldValidate: true })
  }

  const onSubmit = (values: FormOutput) => {
    const tourPackage = packages.find(item => item.id === values.packageId)

    if (!tourPackage) {
      toast.error('Select a valid package')

      return
    }

    const packageMaxMembers = tourPackage.maxMembers ?? 30

    if (values.travelers > packageMaxMembers) {
      setError('travelers', { message: `This package allows a maximum of ${packageMaxMembers} travelers` })

      return
    }

    const coupon = resolveCoupon(values.couponCode, coupons, baseAmount)

    if (!coupon.valid) {
      toast.error('Invalid coupon code')

      return
    }

    const payload = {
      packageSlug: tourPackage.slug,
      packageTitle: tourPackage.title,
      packageImage: tourPackage.images[0],
      packageLocation: tourPackage.location,
      packageDays: tourPackage.days,
      packageNights: tourPackage.nights,
      travelers: values.travelers,
      travelDate: format(values.travelDate, 'yyyy-MM-dd'),
      bookingRef: booking?.bookingRef ?? generateBookingRef(),
      totalAmount: baseAmount - coupon.amount,
      baseAmount,
      discountAmount: coupon.amount || undefined,
      couponCode: coupon.code,
      paymentResult: {
        method: values.paymentMethod,
        cardLast4: values.paymentMethod === 'card' ? values.cardLast4.trim() || undefined : undefined
      },
      bookedAt: booking?.bookedAt ?? new Date().toISOString(),
      contactName: values.contactName,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      contactAvatar: booking?.contactAvatar,
      travelersInfo: travelersInfo.slice(0, values.travelers),
      notes: values.notes.trim() || undefined
    }

    if (booking) {
      upsertBooking(booking.id, { ...payload, status: values.status })

      if (booking.couponCode !== payload.couponCode) {
        if (booking.couponCode) useCouponsStore.getState().decrementUsageByCode(booking.couponCode)
        if (payload.couponCode) useCouponsStore.getState().incrementUsageByCode(payload.couponCode)
      }

      toast.success('Booking updated')
      router.push(`/dashboard/bookings/${booking.id}`)
    } else {
      const id = addBooking(payload)

      useTransactionsStore.getState().addChargeFromBooking({ ...payload, id, status: 'upcoming' })

      if (payload.couponCode) useCouponsStore.getState().incrementUsageByCode(payload.couponCode)

      toast.success('Booking created')
      router.push(`/dashboard/bookings/${id}`)
    }
  }

  return (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-6'>
      <div className='flex justify-between gap-4 max-md:flex-col'>
        <div>
          <h1 className='text-2xl font-semibold'>{booking ? 'Edit Booking' : 'Create Booking'}</h1>
          <p className='text-muted-foreground text-sm'>
            {booking
              ? `Update "${booking.packageTitle}" for ${booking.contactName || 'this customer'}.`
              : 'Book a customer onto a tour package — pricing, availability, and capacity sync live from the package catalog.'}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            render={<Link href={booking ? `/dashboard/bookings/${booking.id}` : '/dashboard/bookings'} />}
            nativeButton={false}
          >
            <ArrowLeftIcon className='size-4' />
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={isSubmitting}>
            {booking ? 'Save Changes' : 'Create Booking'}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start'>
        <div className='flex flex-col gap-6 xl:col-span-2'>
          <Card className='shadow-none'>
            <CardHeader>
              <CardTitle className='text-base font-semibold'>Trip Overview</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <Controller
                control={control}
                name='packageId'
                render={({ field }) => (
                  <Field data-invalid={!!errors.packageId}>
                    <FieldLabel>Package</FieldLabel>
                    <PackagePickerField packages={packages} value={field.value} onChange={field.onChange} />
                    <FieldError errors={[errors.packageId]} />
                  </Field>
                )}
              />

              <Separator />

              <div className='grid grid-cols-2 items-center justify-items-center gap-4 text-sm sm:grid-cols-4'>
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
                              type='button'
                              variant='outline'
                              size='sm'
                              data-empty={!field.value}
                              className='data-[empty=true]:text-muted-foreground w-full justify-between font-normal'
                            >
                              {field.value ? format(field.value, 'dd MMM yyyy') : <span>Pick a date</span>}
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
                      <FieldError errors={[errors.travelDate]} />
                    </Field>
                  )}
                />
                <Field>
                  <FieldLabel htmlFor='returnDate' className='gap-1.5'>
                    <CalendarIcon className='size-3.5' />
                    Return Date
                  </FieldLabel>
                  <Input
                    id='returnDate'
                    readOnly
                    tabIndex={-1}
                    value={returnDate ? format(returnDate, 'dd MMM yyyy') : '—'}
                    className='bg-muted/50 cursor-not-allowed'
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor='duration' className='gap-1.5'>
                    <ClockIcon className='size-3.5' />
                    Duration
                  </FieldLabel>
                  <Input
                    id='duration'
                    readOnly
                    tabIndex={-1}
                    value={selectedPackage ? `${selectedPackage.days}D / ${selectedPackage.nights}N` : '—'}
                    className='bg-muted/50 cursor-not-allowed'
                  />
                </Field>
                <Controller
                  control={control}
                  name='travelers'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.travelers}>
                      <FieldLabel htmlFor='travelers'>Members (max {maxMembers})</FieldLabel>
                      <Input
                        id='travelers'
                        type='number'
                        min={1}
                        max={maxMembers}
                        step={1}
                        inputMode='numeric'
                        {...field}
                        value={field.value as number | string}
                      />
                      <FieldError errors={[errors.travelers]} />
                    </Field>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className='shadow-none'>
            <CardHeader>
              <CardTitle className='text-base font-semibold'>Travelers</CardTitle>
              <p className='text-muted-foreground text-sm'>
                {travelers} {travelers === 1 ? 'member' : 'members'} on this booking
              </p>
            </CardHeader>
            <CardContent>
              <TravelersInfoField
                maxCount={maxMembers}
                value={travelersInfo}
                primaryContact={primaryContact}
                onChange={handleTravelersInfoChange}
              />
            </CardContent>
          </Card>

          <Card className='shadow-none'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base font-semibold'>
                <NotebookPenIcon className='size-4' />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name='notes'
                render={({ field }) => (
                  <Textarea placeholder='Dietary needs, accessibility, special requests...' {...field} />
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className='flex flex-col gap-6 xl:sticky xl:top-20 xl:col-span-1'>
          <Card className='shadow-none'>
            <CardHeader>
              <CardTitle className='text-base font-semibold'>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex items-center gap-3'>
                <Avatar className='size-11'>
                  <AvatarImage src={avatarSrc} alt={contactName} />
                  <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
                    {getInitials(contactName) || 'NA'}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0'>
                  <p className='truncate font-semibold'>{contactName || 'Not provided'}</p>
                  <p className='text-muted-foreground text-xs'>Primary Contact</p>
                </div>
              </div>

              <Separator />

              <Controller
                control={control}
                name='contactName'
                render={({ field }) => (
                  <Field data-invalid={!!errors.contactName}>
                    <FieldLabel htmlFor='contactName'>Full Name</FieldLabel>
                    <Input id='contactName' placeholder='John Doe' {...field} />
                    <FieldError errors={[errors.contactName]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='contactEmail'
                render={({ field }) => (
                  <Field data-invalid={!!errors.contactEmail}>
                    <FieldLabel htmlFor='contactEmail'>Email</FieldLabel>
                    <Input id='contactEmail' type='email' placeholder='name@example.com' {...field} />
                    <FieldError errors={[errors.contactEmail]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='contactPhone'
                render={({ field }) => (
                  <Field data-invalid={!!errors.contactPhone}>
                    <FieldLabel htmlFor='contactPhone'>Phone</FieldLabel>
                    <PhoneInput
                      id='contactPhone'
                      defaultCountry='US'
                      placeholder='Enter contact number'
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    <FieldError errors={[errors.contactPhone]} />
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <Card className='bg-muted/60 shadow-none'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base font-semibold'>Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <Controller
                control={control}
                name='couponCode'
                render={({ field }) => {
                  const isApplied = Boolean(field.value.trim()) && couponPreview.valid && Boolean(couponPreview.code)
                  const isInvalid = Boolean(field.value.trim()) && !couponPreview.valid

                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor='couponCode'>Coupon Code</FieldLabel>
                      <div className='flex flex-wrap gap-2'>
                        <div className='relative min-w-40 flex-1'>
                          <TagIcon className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                          <Input
                            id='couponCode'
                            placeholder='SUMMER20'
                            className='pl-9'
                            disabled={isApplied}
                            aria-invalid={isInvalid}
                            {...field}
                          />
                        </div>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => field.onChange(isApplied ? '' : (couponPreview.code ?? field.value))}
                        >
                          {isApplied ? 'Remove' : 'Apply'}
                        </Button>
                        <Button type='button' variant='outline' onClick={() => setIsCouponDialogOpen(true)}>
                          <TicketPercentIcon className='size-4' />
                          Coupons
                        </Button>
                      </div>

                      {isInvalid && (
                        <p className='text-destructive flex items-center gap-1.5 text-sm'>
                          <InfoIcon className='size-3.5 shrink-0' />
                          Invalid coupon code
                        </p>
                      )}

                      <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Available Coupons</DialogTitle>
                            <DialogDescription>Pick a coupon to apply its discount to this booking</DialogDescription>
                          </DialogHeader>
                          <ScrollArea className='max-h-100'>
                            <div className='flex flex-col gap-3 pr-3'>
                              {coupons.map(offer => {
                                const isOfferApplied = offer.couponCode === field.value.trim().toUpperCase()

                                return (
                                  <div
                                    key={offer.id}
                                    className='border-primary/40 flex items-center justify-between gap-3 rounded-xl border border-dashed p-3 data-[applied=true]:opacity-60'
                                    data-applied={isOfferApplied}
                                  >
                                    <div className='flex min-w-0 flex-col gap-1'>
                                      <div className='flex items-center gap-2'>
                                        <span className='text-primary text-xs font-medium tracking-widest'>
                                          {offer.couponCode}
                                        </span>
                                        <span className='text-primary text-xs font-semibold'>
                                          {offer.discountLabel}
                                        </span>
                                      </div>
                                      <span className='text-sm font-semibold'>{offer.title}</span>
                                      <p className='text-muted-foreground text-xs'>{offer.description}</p>
                                    </div>
                                    <Button
                                      type='button'
                                      size='sm'
                                      variant={isOfferApplied ? 'secondary' : 'outline'}
                                      disabled={isOfferApplied}
                                      onClick={() => {
                                        field.onChange(offer.couponCode)
                                        setIsCouponDialogOpen(false)
                                      }}
                                    >
                                      {isOfferApplied ? 'Applied' : 'Apply'}
                                    </Button>
                                  </div>
                                )
                              })}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </Field>
                  )
                }}
              />

              <div className='flex flex-col gap-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Package Price</span>
                  <span>${baseAmount.toLocaleString()}</span>
                </div>

                {couponPreview.code && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground flex items-center gap-1.5'>
                      <TagIcon className='size-3.5' />
                      Coupon Applied
                    </span>
                    <Badge variant='outline' className='font-mono text-xs'>
                      {couponPreview.code}
                    </Badge>
                  </div>
                )}

                {couponPreview.amount > 0 && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='font-medium text-green-600 dark:text-green-400'>Discount</span>
                    <span className='font-medium text-green-600 dark:text-green-400'>
                      −${couponPreview.amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className='flex items-center justify-between'>
                <span className='font-semibold'>Final Amount</span>
                <span className='text-primary text-xl font-bold'>${finalAmount.toLocaleString()}</span>
              </div>

              <Separator />

              {booking && (
                <Controller
                  control={control}
                  name='status'
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor='status'>Booking Status</FieldLabel>
                      <Select
                        items={STATUS_OPTIONS}
                        value={field.value}
                        onValueChange={value => value && field.onChange(value)}
                      >
                        <SelectTrigger id='status' className='w-full'>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {STATUS_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
              )}
              <Controller
                control={control}
                name='paymentMethod'
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor='paymentMethod'>Payment Method</FieldLabel>
                    <Select
                      items={PAYMENT_METHOD_OPTIONS}
                      value={field.value}
                      onValueChange={value => value && field.onChange(value)}
                    >
                      <SelectTrigger id='paymentMethod' className='w-full'>
                        <SelectValue placeholder='Select payment method' />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          {PAYMENT_METHOD_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              {paymentMethod === 'card' && (
                <Controller
                  control={control}
                  name='cardLast4'
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor='cardLast4'>Card Last 4 Digits</FieldLabel>
                      <Input id='cardLast4' maxLength={4} placeholder='1234' {...field} />
                    </Field>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}

export default BookingForm
