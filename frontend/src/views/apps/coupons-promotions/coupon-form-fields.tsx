'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

// Type Imports
import type { CouponFormValues } from '@/views/apps/coupons-promotions/coupon-form-schema'
import { APPLIES_TO_OPTIONS, DISCOUNT_TYPE_OPTIONS } from '@/views/apps/coupons-promotions/coupon-form-schema'

// Component Imports
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CouponImageUploadField from '@/views/apps/coupons-promotions/coupon-image-upload-field'

// Utils Imports
import { cn } from '@/lib/utils'

type CouponFormFieldsProps = {
  control: Control<CouponFormValues>
  errors: FieldErrors<CouponFormValues>
}

const CouponFormFields = ({ control, errors }: CouponFormFieldsProps) => {
  const [validFromOpen, setValidFromOpen] = useState(false)
  const [validUntilOpen, setValidUntilOpen] = useState(false)

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend>Coupon Details</FieldLegend>
        <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Controller
            control={control}
            name='code'
            render={({ field }) => (
              <Field data-invalid={!!errors.code}>
                <FieldLabel htmlFor='code'>Coupon Code</FieldLabel>
                <Input
                  id='code'
                  placeholder='SUMMER20'
                  className='uppercase'
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={e => field.onChange(e.target.value.toUpperCase())}
                />
                <FieldError errors={[errors.code]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name='title'
            render={({ field }) => (
              <Field data-invalid={!!errors.title}>
                <FieldLabel htmlFor='title'>Title</FieldLabel>
                <Input id='title' placeholder='Summer Vibes Sale' {...field} />
                <FieldError errors={[errors.title]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name='description'
            render={({ field }) => (
              <Field className='sm:col-span-2'>
                <FieldLabel htmlFor='description'>Description</FieldLabel>
                <Textarea id='description' placeholder='Seasonal discount on all Asia getaways.' rows={3} {...field} />
                <FieldDescription>Optional — shown to admins only.</FieldDescription>
              </Field>
            )}
          />

          <Controller
            control={control}
            name='image'
            render={({ field }) => (
              <Field className='sm:col-span-2'>
                <FieldLabel>Banner Image</FieldLabel>
                <CouponImageUploadField value={field.value ?? ''} onChange={field.onChange} />
                <FieldDescription>
                  Shown on the Card View card and the homepage. Falls back to a stock photo when left empty.
                </FieldDescription>
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Discount</FieldLegend>
        <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Controller
            control={control}
            name='discountType'
            render={({ field }) => (
              <Field data-invalid={!!errors.discountType}>
                <FieldLabel htmlFor='discountType'>Discount Type</FieldLabel>
                <Select
                  items={DISCOUNT_TYPE_OPTIONS}
                  value={field.value}
                  onValueChange={value => value && field.onChange(value)}
                >
                  <SelectTrigger id='discountType' className='w-full capitalize'>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {DISCOUNT_TYPE_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value} className='capitalize'>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.discountType]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name='discountValue'
            render={({ field }) => (
              <Field data-invalid={!!errors.discountValue}>
                <FieldLabel htmlFor='discountValue'>Discount Value</FieldLabel>
                <Input
                  id='discountValue'
                  type='number'
                  min={1}
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                />
                <FieldError errors={[errors.discountValue]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name='appliesTo'
            render={({ field }) => (
              <Field data-invalid={!!errors.appliesTo}>
                <FieldLabel htmlFor='appliesTo'>Applies To</FieldLabel>
                <Select
                  items={APPLIES_TO_OPTIONS}
                  value={field.value}
                  onValueChange={value => value && field.onChange(value)}
                >
                  <SelectTrigger id='appliesTo' className='w-full'>
                    <SelectValue placeholder='Select scope' />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {APPLIES_TO_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.appliesTo]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name='usageLimit'
            render={({ field }) => (
              <Field data-invalid={!!errors.usageLimit}>
                <FieldLabel htmlFor='usageLimit'>Usage Limit</FieldLabel>
                <Input
                  id='usageLimit'
                  type='number'
                  min={1}
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                />
                <FieldDescription>Maximum number of times this coupon can be redeemed.</FieldDescription>
                <FieldError errors={[errors.usageLimit]} />
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Validity</FieldLegend>
        <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Controller
            control={control}
            name='validFrom'
            render={({ field }) => (
              <Field data-invalid={!!errors.validFrom}>
                <FieldLabel htmlFor='validFrom'>Valid From</FieldLabel>
                <Popover open={validFromOpen} onOpenChange={setValidFromOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        id='validFrom'
                        type='button'
                        variant='outline'
                        className={cn('w-full justify-start font-normal', !field.value && 'text-muted-foreground')}
                      >
                        <CalendarIcon className='size-4' />
                        {field.value ? format(field.value, 'PPP') : 'Select date'}
                      </Button>
                    }
                  />
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      defaultMonth={field.value}
                      onSelect={date => {
                        if (date) field.onChange(date)
                        setValidFromOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError errors={[errors.validFrom]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name='validUntil'
            render={({ field }) => (
              <Field data-invalid={!!errors.validUntil}>
                <FieldLabel htmlFor='validUntil'>Valid Until</FieldLabel>
                <Popover open={validUntilOpen} onOpenChange={setValidUntilOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        id='validUntil'
                        type='button'
                        variant='outline'
                        className={cn('w-full justify-start font-normal', !field.value && 'text-muted-foreground')}
                      >
                        <CalendarIcon className='size-4' />
                        {field.value ? format(field.value, 'PPP') : 'Select date'}
                      </Button>
                    }
                  />
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={field.value}
                      defaultMonth={field.value}
                      onSelect={date => {
                        if (date) field.onChange(date)
                        setValidUntilOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError errors={[errors.validUntil]} />
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      <FieldSet>
        <FieldLegend>Status</FieldLegend>
        <Controller
          control={control}
          name='isActive'
          render={({ field }) => (
            <Field orientation='horizontal'>
              <FieldLabel htmlFor='isActive'>Active</FieldLabel>
              <Switch id='isActive' checked={field.value} onCheckedChange={field.onChange} />
            </Field>
          )}
        />
      </FieldSet>
    </FieldGroup>
  )
}

export default CouponFormFields
