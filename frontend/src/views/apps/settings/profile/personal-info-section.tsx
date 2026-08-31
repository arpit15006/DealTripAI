'use client'

// React Imports
import { useEffect } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// Type Imports
import type { AdminGender } from '@/types/settings/profile-types'
import { ADMIN_GENDER_LIST } from '@/types/settings/profile-types'
import { LANGUAGE_OPTIONS, TIMEZONE_OPTIONS } from '@/types/settings/localization-options'

// Component Imports
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import ProfileAvatarUpload from '@/views/apps/settings/profile/profile-avatar-upload'
import { buildPersonalInfoDefaultValues, personalInfoSchema } from '@/views/apps/settings/profile/personal-info-schema'
import type { PersonalInfoFormValues } from '@/views/apps/settings/profile/personal-info-schema'

// Store Imports
import { useAdminPersonalInfo } from '@/store/use-admin-profile-store'

const GENDER_OPTIONS = ADMIN_GENDER_LIST.map(value => ({
  label: value.charAt(0).toUpperCase() + value.slice(1),
  value
}))

const PersonalInfoSection = () => {
  const { profile, updatePersonalInfo, updateAvatar, removeAvatar } = useAdminPersonalInfo()

  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: buildPersonalInfoDefaultValues(profile)
  })

  useEffect(() => {
    reset(buildPersonalInfoDefaultValues(profile))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id])

  const onSubmit = (values: PersonalInfoFormValues) => {
    updateAvatar(values.avatar)
    updatePersonalInfo({ ...values, gender: values.gender as AdminGender })
    toast.success('Profile updated')
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='text-base font-semibold'>Personal Information</h3>
        <p className='text-muted-foreground text-sm'>Manage your personal information and role.</p>
      </div>

      <div className='lg:col-span-2'>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-5'>
          <Controller
            control={control}
            name='avatar'
            render={({ field }) => (
              <Field>
                <FieldLabel>Your Avatar</FieldLabel>
                <ProfileAvatarUpload
                  value={field.value}
                  fallback={initials}
                  onChange={field.onChange}
                  onRemove={() => {
                    field.onChange('')
                    removeAvatar()
                  }}
                />
              </Field>
            )}
          />

          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Controller
              control={control}
              name='firstName'
              render={({ field }) => (
                <Field data-invalid={!!errors.firstName}>
                  <FieldLabel htmlFor='firstName'>First Name</FieldLabel>
                  <Input id='firstName' placeholder='John' {...field} />
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
                  <Input id='lastName' placeholder='Doe' {...field} />
                  <FieldError errors={[errors.lastName]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='email'
              render={({ field }) => (
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor='email'>Email Address</FieldLabel>
                  <Input id='email' type='email' placeholder='john@tourix.com' {...field} />
                  <FieldError errors={[errors.email]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='phone'
              render={({ field }) => (
                <Field data-invalid={!!errors.phone}>
                  <FieldLabel htmlFor='phone'>Phone Number</FieldLabel>
                  <PhoneInput
                    id='phone'
                    defaultCountry='US'
                    placeholder='Enter phone number'
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
              name='jobTitle'
              render={({ field }) => (
                <Field data-invalid={!!errors.jobTitle}>
                  <FieldLabel htmlFor='jobTitle'>Job Title</FieldLabel>
                  <Input id='jobTitle' placeholder='Operations Manager' {...field} />
                  <FieldError errors={[errors.jobTitle]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='gender'
              render={({ field }) => (
                <Field data-invalid={!!errors.gender}>
                  <FieldLabel htmlFor='gender'>Gender</FieldLabel>
                  <Select
                    items={GENDER_OPTIONS}
                    value={field.value}
                    onValueChange={value => value && field.onChange(value)}
                  >
                    <SelectTrigger id='gender' className='w-full'>
                      <SelectValue placeholder='Select gender' />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {GENDER_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.gender]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='timezone'
              render={({ field }) => (
                <Field data-invalid={!!errors.timezone}>
                  <FieldLabel htmlFor='timezone'>Timezone</FieldLabel>
                  <Select
                    items={TIMEZONE_OPTIONS}
                    value={field.value}
                    onValueChange={value => value && field.onChange(value)}
                  >
                    <SelectTrigger id='timezone' className='w-full'>
                      <SelectValue placeholder='Select timezone' />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {TIMEZONE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.timezone]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='language'
              render={({ field }) => (
                <Field data-invalid={!!errors.language}>
                  <FieldLabel htmlFor='language'>Language</FieldLabel>
                  <Select
                    items={LANGUAGE_OPTIONS}
                    value={field.value}
                    onValueChange={value => value && field.onChange(value)}
                  >
                    <SelectTrigger id='language' className='w-full'>
                      <SelectValue placeholder='Select language' />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {LANGUAGE_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.language]} />
                </Field>
              )}
            />
          </FieldGroup>

          <Controller
            control={control}
            name='bio'
            render={({ field }) => (
              <Field data-invalid={!!errors.bio}>
                <FieldLabel htmlFor='bio'>Bio</FieldLabel>
                <Textarea id='bio' rows={3} placeholder='A short note about your role...' {...field} />
                <FieldError errors={[errors.bio]} />
              </Field>
            )}
          />

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

export default PersonalInfoSection
