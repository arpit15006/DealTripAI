'use client'

// React Imports
import { useEffect } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// Component Imports
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Textarea } from '@/components/ui/textarea'
import {
  buildCompanyProfileDefaultValues,
  buildCompanyProfileInput,
  companyProfileSchema
} from '@/views/apps/settings/store-information/company-profile-schema'
import type { CompanyProfileFormValues } from '@/views/apps/settings/store-information/company-profile-schema'

// Store Imports
import { useCompanyProfile } from '@/store/use-store-information-store'

const CompanyProfileSection = () => {
  const { companyProfile, updateCompanyProfile } = useCompanyProfile()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: buildCompanyProfileDefaultValues(companyProfile)
  })

  useEffect(() => {
    reset(buildCompanyProfileDefaultValues(companyProfile))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyProfile])

  const onSubmit = (values: CompanyProfileFormValues) => {
    updateCompanyProfile(buildCompanyProfileInput(values))
    toast.success('Company profile updated')
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='text-base font-semibold'>Company Profile</h3>
        <p className='text-muted-foreground text-sm'>Manage your company branding, contact and address details.</p>
      </div>

      <div className='lg:col-span-2'>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-5'>
          <FieldSet>
            <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Controller
                control={control}
                name='name'
                render={({ field }) => (
                  <Field data-invalid={!!errors.name}>
                    <FieldLabel htmlFor='name'>Company Name</FieldLabel>
                    <Input id='name' placeholder='Tourix' {...field} />
                    <FieldError errors={[errors.name]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='tagline'
                render={({ field }) => (
                  <Field data-invalid={!!errors.tagline}>
                    <FieldLabel htmlFor='tagline'>Tagline</FieldLabel>
                    <Input id='tagline' placeholder='Unforgettable journeys, planned for you' {...field} />
                    <FieldError errors={[errors.tagline]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name='supportEmail'
                render={({ field }) => (
                  <Field data-invalid={!!errors.supportEmail}>
                    <FieldLabel htmlFor='supportEmail'>Support Email</FieldLabel>
                    <Input id='supportEmail' type='email' placeholder='support@tourix.com' {...field} />
                    <FieldError errors={[errors.supportEmail]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='supportPhone'
                render={({ field }) => (
                  <Field data-invalid={!!errors.supportPhone}>
                    <FieldLabel htmlFor='supportPhone'>Support Phone</FieldLabel>
                    <PhoneInput
                      id='supportPhone'
                      defaultCountry='US'
                      placeholder='Enter phone number'
                      aria-invalid={!!errors.supportPhone}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    <FieldError errors={[errors.supportPhone]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='street'
                render={({ field }) => (
                  <Field className='sm:col-span-2' data-invalid={!!errors.street}>
                    <FieldLabel htmlFor='street'>Street Address</FieldLabel>
                    <Input id='street' placeholder='148 Market Street' {...field} />
                    <FieldError errors={[errors.street]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='country'
                render={({ field }) => (
                  <Field data-invalid={!!errors.country}>
                    <FieldLabel htmlFor='country'>Country</FieldLabel>
                    <Input id='country' placeholder='United States' {...field} />
                    <FieldError errors={[errors.country]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='city'
                render={({ field }) => (
                  <Field data-invalid={!!errors.city}>
                    <FieldLabel htmlFor='city'>City</FieldLabel>
                    <Input id='city' placeholder='San Francisco' {...field} />
                    <FieldError errors={[errors.city]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='state'
                render={({ field }) => (
                  <Field data-invalid={!!errors.state}>
                    <FieldLabel htmlFor='state'>State</FieldLabel>
                    <Input id='state' placeholder='CA' {...field} />
                    <FieldError errors={[errors.state]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='zipCode'
                render={({ field }) => (
                  <Field data-invalid={!!errors.zipCode}>
                    <FieldLabel htmlFor='zipCode'>ZIP Code</FieldLabel>
                    <Input id='zipCode' placeholder='94103' {...field} />
                    <FieldError errors={[errors.zipCode]} />
                  </Field>
                )}
              />
              <Controller
                control={control}
                name='description'
                render={({ field }) => (
                  <Field className='col-span-full' data-invalid={!!errors.description}>
                    <FieldLabel htmlFor='description'>Description</FieldLabel>
                    <Textarea id='description' rows={3} placeholder='Shown in the site footer.' {...field} />
                    <FieldError errors={[errors.description]} />
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>

          <div className='flex justify-end'>
            <Button type='submit' disabled={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompanyProfileSection
