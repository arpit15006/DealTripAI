'use client'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'

// Type Imports
import type { CreateTourPackageInput, TourPackage } from '@/types/packages/tour-package-types'
import { TOUR_PACKAGE_CATEGORY_LIST } from '@/types/packages/tour-package-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import ImageUploadField from './image-upload-field'
import InclusionExclusionField from './inclusion-exclusion-field'
import ItineraryField from './itinerary-field'

// Store Imports
import { useDestinationsStore } from '@/store/use-destinations-store'
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

// Utils Imports
import { resolveItinerary, resolveTripInformation } from '@/utils/build-package-detail'

const CATEGORY_OPTIONS = TOUR_PACKAGE_CATEGORY_LIST.map(value => ({ label: value, value }))

const itineraryDaySchema = z.object({
  day: z.number(),
  title: z.string(),
  summary: z.string(),
  activities: z.array(z.string())
})

const packageSchema = z.object({
  images: z.array(z.string()).min(1, 'Add at least one photo'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  country: z.string().min(1, 'Select a country'),
  location: z.string().min(2, 'Enter a destination/location'),
  category: z.enum(TOUR_PACKAGE_CATEGORY_LIST as [string, ...string[]]),
  price: z.number().min(1, 'Enter a valid price per head'),
  discountPercent: z.number().min(0, 'Cannot be negative').max(90, 'Discount cannot exceed 90%'),
  days: z.number().int().min(1, 'Must be at least 1 day'),
  nights: z.number().int().min(0, 'Cannot be negative'),
  maxMembers: z.number().int().min(1, 'Must allow at least 1 traveler'),
  tripInformation: z.string().min(20, 'Add some trip information'),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  itinerary: z.array(itineraryDaySchema),
  isPremium: z.boolean(),
  isPublished: z.boolean()
})

type FormValues = z.infer<typeof packageSchema>

type PackageFormProps = {
  tourPackage?: TourPackage
}

const PackageForm = ({ tourPackage }: PackageFormProps) => {
  const router = useRouter()
  const addPackage = useTourPackagesStore(state => state.addPackage)
  const updatePackage = useTourPackagesStore(state => state.updatePackage)
  const destinations = useDestinationsStore(state => state.items)

  const COUNTRY_OPTIONS = destinations.map(destination => ({ label: destination.name, value: destination.key }))

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      images: tourPackage?.images ?? [],
      title: tourPackage?.title ?? '',
      country: tourPackage?.country ?? COUNTRY_OPTIONS[0]?.value ?? '',
      location: tourPackage?.location ?? '',
      category: tourPackage?.category ?? CATEGORY_OPTIONS[0].value,
      price: tourPackage?.price ?? 0,
      discountPercent: tourPackage?.discountPercent ?? 0,
      days: tourPackage?.days ?? 1,
      nights: tourPackage?.nights ?? 0,
      maxMembers: tourPackage?.maxMembers ?? 10,
      tripInformation: tourPackage ? resolveTripInformation(tourPackage) : '',
      inclusions: tourPackage?.inclusions ?? [],
      exclusions: tourPackage?.exclusions ?? [],
      itinerary: tourPackage ? resolveItinerary(tourPackage) : [],
      isPremium: tourPackage?.packageType === 'premium',
      isPublished: tourPackage?.isPublished !== false
    }
  })

  const onSubmit = (values: FormValues) => {
    const input: CreateTourPackageInput = {
      images: values.images,
      title: values.title,
      country: values.country,
      location: values.location,
      category: values.category as CreateTourPackageInput['category'],
      price: values.price,
      discountPercent: values.discountPercent || undefined,
      days: values.days,
      nights: values.nights,
      maxMembers: values.maxMembers,
      tripInformation: values.tripInformation,
      inclusions: values.inclusions,
      exclusions: values.exclusions,
      itinerary: values.itinerary,
      packageType: values.isPremium ? 'premium' : 'regular',
      isPublished: values.isPublished
    }

    if (tourPackage) {
      updatePackage(tourPackage.id, input)
      toast.success('Package updated')
      router.push(`/dashboard/tour-packages/${tourPackage.id}`)
    } else {
      const id = addPackage(input)

      toast.success('Package created')
      router.push(`/dashboard/tour-packages/${id}`)
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-6'>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Images &amp; Gallery</FieldLegend>
              <FieldDescription>
                First photo is used as the cover image everywhere the package appears.
              </FieldDescription>
              <Controller
                control={control}
                name='images'
                render={({ field }) => (
                  <Field data-invalid={!!errors.images}>
                    <ImageUploadField value={field.value} onChange={field.onChange} />
                    <FieldError errors={[errors.images]} />
                  </Field>
                )}
              />
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Basic Information</FieldLegend>
              <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <Controller
                  control={control}
                  name='title'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.title} className='sm:col-span-2'>
                      <FieldLabel htmlFor='title'>Package Name</FieldLabel>
                      <Input id='title' placeholder='Bali Island Escape' {...field} />
                      <FieldError errors={[errors.title]} />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name='country'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.country}>
                      <FieldLabel htmlFor='country'>Country</FieldLabel>
                      <Select
                        items={COUNTRY_OPTIONS}
                        value={field.value}
                        onValueChange={value => value && field.onChange(value)}
                      >
                        <SelectTrigger id='country' className='w-full'>
                          <SelectValue placeholder='Select country' />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {COUNTRY_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldError errors={[errors.country]} />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name='location'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.location}>
                      <FieldLabel htmlFor='location'>Location</FieldLabel>
                      <Input id='location' placeholder='Bali, Indonesia' {...field} />
                      <FieldError errors={[errors.location]} />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name='category'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.category}>
                      <FieldLabel htmlFor='category'>Category</FieldLabel>
                      <Select
                        items={CATEGORY_OPTIONS}
                        value={field.value}
                        onValueChange={value => value && field.onChange(value)}
                      >
                        <SelectTrigger id='category' className='w-full capitalize'>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {CATEGORY_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value} className='capitalize'>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldError errors={[errors.category]} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name='maxMembers'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.maxMembers}>
                      <FieldLabel htmlFor='maxMembers'>Max Members Per Booking</FieldLabel>
                      <Input
                        id='maxMembers'
                        type='number'
                        min={1}
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                      />
                      <FieldError errors={[errors.maxMembers]} />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name='days'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.days}>
                      <FieldLabel htmlFor='days'>Duration — Days</FieldLabel>
                      <Input
                        id='days'
                        type='number'
                        min={1}
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                      />
                      <FieldError errors={[errors.days]} />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name='nights'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.nights}>
                      <FieldLabel htmlFor='nights'>Duration — Nights</FieldLabel>
                      <Input
                        id='nights'
                        type='number'
                        min={0}
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                      />
                      <FieldError errors={[errors.nights]} />
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Pricing</FieldLegend>
              <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <Controller
                  control={control}
                  name='price'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.price}>
                      <FieldLabel htmlFor='price'>Price Per Head (USD)</FieldLabel>
                      <Input
                        id='price'
                        type='number'
                        min={1}
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                      />
                      <FieldError errors={[errors.price]} />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name='discountPercent'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.discountPercent}>
                      <FieldLabel htmlFor='discountPercent'>Discount (%)</FieldLabel>
                      <Input
                        id='discountPercent'
                        type='number'
                        min={0}
                        max={90}
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onBlur={field.onBlur}
                        onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                      />
                      <FieldDescription>Applied automatically on the site and at checkout.</FieldDescription>
                      <FieldError errors={[errors.discountPercent]} />
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Description</FieldLegend>
              <Controller
                control={control}
                name='tripInformation'
                render={({ field }) => (
                  <Field data-invalid={!!errors.tripInformation}>
                    <RichTextEditor
                      id='tripInformation'
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='Describe the trip, what makes it special, what travelers can expect...'
                    />
                    <FieldError errors={[errors.tripInformation]} />
                  </Field>
                )}
              />
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Itinerary</FieldLegend>
              <FieldDescription>
                Prefilled with the site&apos;s auto-generated day-by-day plan — edit any day, add new ones, or clear all
                to fall back to the generated plan.
              </FieldDescription>
              <Controller
                control={control}
                name='itinerary'
                render={({ field }) => (
                  <ItineraryField
                    value={field.value}
                    onChange={next => {
                      const dayCountChanged = next.length !== field.value.length

                      field.onChange(next)

                      if (dayCountChanged && next.length > 0) {
                        setValue('days', next.length, { shouldValidate: true, shouldDirty: true })
                        setValue('nights', Math.max(next.length - 1, 0), { shouldValidate: true, shouldDirty: true })
                      }
                    }}
                  />
                )}
              />
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Inclusions &amp; Exclusions</FieldLegend>
              <FieldDescription>
                Prebuilt defaults are always kept. Items you add here are appended at the bottom of the
                &ldquo;What&apos;s Included &amp; Excluded&rdquo; table on the package page.
              </FieldDescription>
              <FieldGroup className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <Controller
                  control={control}
                  name='inclusions'
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Inclusions</FieldLabel>
                      <InclusionExclusionField
                        variant='included'
                        value={field.value}
                        onChange={field.onChange}
                        placeholder='Return airport transfers'
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name='exclusions'
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Exclusions</FieldLabel>
                      <InclusionExclusionField
                        variant='excluded'
                        value={field.value}
                        onChange={field.onChange}
                        placeholder='Travel insurance'
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>

            <FieldSeparator />

            <FieldSet>
              <FieldLegend>Status</FieldLegend>
              <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <Controller
                  control={control}
                  name='isPremium'
                  render={({ field }) => (
                    <Field orientation='horizontal'>
                      <FieldLabel htmlFor='isPremium'>Mark as premium package</FieldLabel>
                      <Switch id='isPremium' checked={field.value} onCheckedChange={field.onChange} />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name='isPublished'
                  render={({ field }) => (
                    <Field orientation='horizontal'>
                      <FieldLabel htmlFor='isPublished'>Publish to public site</FieldLabel>
                      <Switch id='isPublished' checked={field.value} onCheckedChange={field.onChange} />
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
          </FieldGroup>

          <div className='flex justify-end gap-3'>
            <Button type='button' variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {tourPackage ? 'Save Changes' : 'Create Package'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default PackageForm
