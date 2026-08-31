'use client'

// React Imports
import { useEffect } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// Type Imports
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS
} from '@/types/settings/localization-options'

// Component Imports
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { localizationSchema } from '@/views/apps/settings/store-information/localization-schema'
import type { LocalizationFormValues } from '@/views/apps/settings/store-information/localization-schema'

// Store Imports
import { useLocalizationSettings } from '@/store/use-store-information-store'

const LocalizationSection = () => {
  const { localization, updateLocalization } = useLocalizationSettings()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<LocalizationFormValues>({
    resolver: zodResolver(localizationSchema),
    defaultValues: localization
  })

  useEffect(() => {
    reset(localization)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localization])

  const onSubmit = (values: LocalizationFormValues) => {
    updateLocalization(values)
    toast.success('Localization settings updated')
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='text-base font-semibold'>Localization</h3>
        <p className='text-muted-foreground text-sm'>Set platform-wide defaults for currency, timezone and formats.</p>
      </div>

      <div className='lg:col-span-2'>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-5'>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Controller
              control={control}
              name='currency'
              render={({ field }) => (
                <Field data-invalid={!!errors.currency}>
                  <FieldLabel htmlFor='currency'>Default Currency</FieldLabel>
                  <Select
                    items={CURRENCY_OPTIONS}
                    value={field.value}
                    onValueChange={value => value && field.onChange(value)}
                  >
                    <SelectTrigger id='currency' className='w-full'>
                      <SelectValue placeholder='Select currency' />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {CURRENCY_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.currency]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='timezone'
              render={({ field }) => (
                <Field data-invalid={!!errors.timezone}>
                  <FieldLabel htmlFor='timezone'>Default Timezone</FieldLabel>
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
                  <FieldLabel htmlFor='language'>Default Language</FieldLabel>
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
            <Controller
              control={control}
              name='dateFormat'
              render={({ field }) => (
                <Field data-invalid={!!errors.dateFormat}>
                  <FieldLabel htmlFor='dateFormat'>Date Format</FieldLabel>
                  <Select
                    items={DATE_FORMAT_OPTIONS}
                    value={field.value}
                    onValueChange={value => value && field.onChange(value)}
                  >
                    <SelectTrigger id='dateFormat' className='w-full'>
                      <SelectValue placeholder='Select date format' />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {DATE_FORMAT_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.dateFormat]} />
                </Field>
              )}
            />
          </FieldGroup>

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

export default LocalizationSection
