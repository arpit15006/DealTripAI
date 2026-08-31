'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlusIcon } from 'lucide-react'
import { z } from 'zod'

// Type Imports
import type { TravelerGender, TravelerInfo } from '@/types/packages/checkout-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type TravelerDraft = {
  firstName: string
  lastName: string
  email: string
  phone: string
  age: string
  gender: TravelerGender | ''
}

export const EMPTY_TRAVELER_DRAFT: TravelerDraft = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  age: '',
  gender: ''
}

export const isTravelerDraftComplete = (draft: TravelerDraft): boolean =>
  draft.firstName.trim().length >= 2 &&
  draft.lastName.trim().length >= 2 &&
  z.email().safeParse(draft.email).success &&
  draft.phone.trim().length >= 7 &&
  Number(draft.age) > 0 &&
  draft.gender !== ''

export const travelerDraftToInfo = (draft: TravelerDraft): TravelerInfo => ({
  firstName: draft.firstName,
  lastName: draft.lastName,
  email: draft.email,
  phone: draft.phone,
  age: Number(draft.age),
  gender: draft.gender as TravelerGender
})

const GENDER_OPTIONS: { label: string; value: TravelerGender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
]

const travelerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  age: z.coerce
    .number({ error: 'Enter a valid age' })
    .int('Enter a whole number')
    .min(1, 'Age must be at least 1')
    .max(120, 'Enter a valid age'),
  gender: z.enum(['male', 'female', 'other'], { error: 'Select a gender' })
})

type FormValues = z.input<typeof travelerSchema>
type FormOutput = z.output<typeof travelerSchema>

const EMPTY_FORM_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  age: '',
  gender: undefined
} as unknown as FormValues

const travelerLabel = (index: number) => `Traveler ${index + 1}`

type TravelerInfoSectionProps = {
  travelers: number
  value: TravelerDraft[]
  onChange: (next: TravelerDraft[]) => void
  showErrors: boolean
}

const TravelerInfoSection = ({ travelers, value, onChange, showErrors }: TravelerInfoSectionProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [errorJumpHandled, setErrorJumpHandled] = useState(false)

  if (showErrors && !errorJumpHandled) {
    setErrorJumpHandled(true)

    const firstIncompleteIndex = value.findIndex(draft => !isTravelerDraftComplete(draft))

    if (firstIncompleteIndex !== -1) setSelectedIndex(firstIncompleteIndex)
  } else if (!showErrors && errorJumpHandled) {
    setErrorJumpHandled(false)
  }

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(travelerSchema),
    defaultValues: EMPTY_FORM_VALUES
  })

  const current = value[selectedIndex] ?? EMPTY_TRAVELER_DRAFT
  const isPrimary = selectedIndex === 0

  const currentValidation = travelerSchema.safeParse({
    firstName: current.firstName,
    lastName: current.lastName,
    email: current.email,
    phone: current.phone,
    age: current.age,
    gender: current.gender || undefined
  })

  const currentErrors: Partial<Record<keyof FormOutput, string[]>> = currentValidation.success
    ? {}
    : currentValidation.error.flatten().fieldErrors

  const fieldError = (field: keyof FormOutput) =>
    showErrors ? currentErrors[field]?.map(message => ({ message })) : undefined

  const updateCurrent = (field: keyof TravelerDraft, fieldValue: string) => {
    const next = [...value]

    next[selectedIndex] = { ...current, [field]: fieldValue }
    onChange(next)
  }

  const openAddDialog = () => {
    reset(EMPTY_FORM_VALUES)
    setDialogOpen(true)
  }

  const onAddSubmit = (values: FormOutput) => {
    const next = [
      ...value,
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        age: String(values.age),
        gender: values.gender
      }
    ]

    onChange(next)
    setSelectedIndex(next.length - 1)
    setDialogOpen(false)
  }

  const addedCount = value.filter(isTravelerDraftComplete).length
  const canAddMore = value.length < travelers

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <Select
            items={value.map((_, index) => ({ label: travelerLabel(index), value: String(index) }))}
            value={String(selectedIndex)}
            onValueChange={val => val && setSelectedIndex(Number(val))}
          >
            <SelectTrigger className='w-48'>
              <SelectValue>
                {(val: string) => (
                  <span className='flex items-center gap-1.5'>
                    {travelerLabel(Number(val))}
                    {val === '0' && (
                      <Badge variant='secondary' className='bg-primary/10 text-primary text-xs'>
                        Primary
                      </Badge>
                    )}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {value.map((_, index) => (
                  <SelectItem key={index} value={String(index)}>
                    <span className='flex items-center gap-1.5'>
                      {travelerLabel(index)}
                      {index === 0 && (
                        <Badge variant='secondary' className='bg-primary/10 text-primary! text-xs'>
                          Primary
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-1.5'
            onClick={openAddDialog}
            disabled={!canAddMore}
          >
            <UserPlusIcon className='size-3.5' />
            Add Traveler
          </Button>
        </div>

        <span className='text-muted-foreground text-sm whitespace-nowrap'>
          {addedCount}/{travelers} added
        </span>
      </div>

      {isPrimary && (
        <p className='text-muted-foreground -mb-2 text-xs'>
          Name, phone, and email for the primary traveler are synced from Contact Information above.
        </p>
      )}

      <FieldGroup className='gap-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Field data-invalid={!isPrimary && !!fieldError('firstName')}>
            <FieldLabel htmlFor='traveler-firstName'>First Name</FieldLabel>
            <Input
              id='traveler-firstName'
              placeholder='John'
              value={current.firstName}
              onChange={e => !isPrimary && updateCurrent('firstName', e.target.value)}
              readOnly={isPrimary}
              aria-invalid={!isPrimary && !!fieldError('firstName')}
              className={isPrimary ? 'bg-muted/50 cursor-not-allowed' : undefined}
            />
            {!isPrimary && <FieldError errors={fieldError('firstName')} />}
          </Field>
          <Field data-invalid={!isPrimary && !!fieldError('lastName')}>
            <FieldLabel htmlFor='traveler-lastName'>Last Name</FieldLabel>
            <Input
              id='traveler-lastName'
              placeholder='Doe'
              value={current.lastName}
              onChange={e => !isPrimary && updateCurrent('lastName', e.target.value)}
              readOnly={isPrimary}
              aria-invalid={!isPrimary && !!fieldError('lastName')}
              className={isPrimary ? 'bg-muted/50 cursor-not-allowed' : undefined}
            />
            {!isPrimary && <FieldError errors={fieldError('lastName')} />}
          </Field>
          <Field data-invalid={!isPrimary && !!fieldError('phone')}>
            <FieldLabel htmlFor='traveler-phone'>Phone Number</FieldLabel>
            <Input
              id='traveler-phone'
              type='tel'
              placeholder='+1 (555) 000-0000'
              value={current.phone}
              onChange={e => !isPrimary && updateCurrent('phone', e.target.value)}
              readOnly={isPrimary}
              aria-invalid={!isPrimary && !!fieldError('phone')}
              className={isPrimary ? 'bg-muted/50 cursor-not-allowed' : undefined}
            />
            {!isPrimary && <FieldError errors={fieldError('phone')} />}
          </Field>
          <Field data-invalid={!isPrimary && !!fieldError('email')}>
            <FieldLabel htmlFor='traveler-email'>Email Address</FieldLabel>
            <Input
              id='traveler-email'
              type='email'
              placeholder='name@example.com'
              value={current.email}
              onChange={e => !isPrimary && updateCurrent('email', e.target.value)}
              readOnly={isPrimary}
              aria-invalid={!isPrimary && !!fieldError('email')}
              className={isPrimary ? 'bg-muted/50 cursor-not-allowed' : undefined}
            />
            {!isPrimary && <FieldError errors={fieldError('email')} />}
          </Field>
          <Field data-invalid={!!fieldError('age')}>
            <FieldLabel htmlFor='traveler-age'>Age</FieldLabel>
            <Input
              id='traveler-age'
              type='number'
              placeholder='30'
              value={current.age}
              onChange={e => updateCurrent('age', e.target.value)}
              aria-invalid={!!fieldError('age')}
            />
            <FieldError errors={fieldError('age')} />
          </Field>
          <Field data-invalid={!!fieldError('gender')}>
            <FieldLabel htmlFor='traveler-gender'>Gender</FieldLabel>
            <Select
              items={GENDER_OPTIONS}
              value={current.gender || null}
              onValueChange={val => val && updateCurrent('gender', val)}
            >
              <SelectTrigger id='traveler-gender' className='w-full' aria-invalid={!!fieldError('gender')}>
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
            <FieldError errors={fieldError('gender')} />
          </Field>
        </div>
      </FieldGroup>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-145 [&>[data-slot=dialog-close]>svg]:size-5'>
          <DialogHeader>
            <DialogTitle>Add Traveler</DialogTitle>
            <DialogDescription>Enter the new traveler&apos;s details</DialogDescription>
          </DialogHeader>
          <form
            id='add-traveler-form'
            onSubmit={e => {
              e.stopPropagation()
              handleSubmit(onAddSubmit)(e)
            }}
            noValidate
          >
            <FieldGroup className='gap-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <Controller
                  control={control}
                  name='firstName'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.firstName}>
                      <FieldLabel htmlFor='new-traveler-firstName'>First Name</FieldLabel>
                      <Input
                        id='new-traveler-firstName'
                        placeholder='John'
                        aria-invalid={!!errors.firstName}
                        {...field}
                      />
                      <FieldError errors={[errors.firstName]} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name='lastName'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.lastName}>
                      <FieldLabel htmlFor='new-traveler-lastName'>Last Name</FieldLabel>
                      <Input id='new-traveler-lastName' placeholder='Doe' aria-invalid={!!errors.lastName} {...field} />
                      <FieldError errors={[errors.lastName]} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name='phone'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.phone}>
                      <FieldLabel htmlFor='new-traveler-phone'>Phone Number</FieldLabel>
                      <Input
                        id='new-traveler-phone'
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
                      <FieldLabel htmlFor='new-traveler-email'>Email Address</FieldLabel>
                      <Input
                        id='new-traveler-email'
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
                  name='age'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.age}>
                      <FieldLabel htmlFor='new-traveler-age'>Age</FieldLabel>
                      <Input
                        id='new-traveler-age'
                        type='number'
                        placeholder='30'
                        aria-invalid={!!errors.age}
                        {...field}
                        value={(field.value as number | string | undefined) ?? ''}
                      />
                      <FieldError errors={[errors.age]} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name='gender'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.gender}>
                      <FieldLabel htmlFor='new-traveler-gender'>Gender</FieldLabel>
                      <Select
                        items={GENDER_OPTIONS}
                        value={field.value ?? null}
                        onValueChange={val => val && field.onChange(val)}
                      >
                        <SelectTrigger id='new-traveler-gender' className='w-full' aria-invalid={!!errors.gender}>
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
              </div>
            </FieldGroup>
          </form>
          <div className='flex justify-end gap-4 sm:flex-row'>
            <Button type='button' variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' form='add-traveler-form'>
              Add Traveler
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TravelerInfoSection
