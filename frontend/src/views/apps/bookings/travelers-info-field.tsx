'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { PencilIcon, Trash2Icon, UserPlusIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const GENDER_OPTIONS: { label: string; value: TravelerGender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
]

const GENDER_LABEL: Record<TravelerGender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other'
}

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

const EMPTY_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  age: '',
  gender: undefined
} as unknown as FormValues

type TravelersInfoFieldProps = {
  value: TravelerInfo[]
  maxCount: number
  primaryContact: { firstName: string; lastName: string; email: string; phone: string }
  onChange: (next: TravelerInfo[]) => void
}

const TravelersInfoField = ({ value, maxCount, primaryContact, onChange }: TravelersInfoFieldProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(travelerSchema),
    defaultValues: EMPTY_VALUES
  })

  const openAddDialog = () => {
    setEditingIndex(null)

    reset(value.length === 0 ? ({ ...EMPTY_VALUES, ...primaryContact } as unknown as FormValues) : EMPTY_VALUES)
    setDialogOpen(true)
  }

  const openEditDialog = (index: number) => {
    const traveler = value[index]

    setEditingIndex(index)
    reset({
      firstName: traveler.firstName,
      lastName: traveler.lastName,
      email: traveler.email,
      phone: traveler.phone,
      age: String(traveler.age),
      gender: traveler.gender
    } as unknown as FormValues)
    setDialogOpen(true)
  }

  const removeTraveler = (index: number) => onChange(value.filter((_, i) => i !== index))

  const onSubmit = (values: FormOutput) => {
    const traveler: TravelerInfo = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      age: values.age,
      gender: values.gender
    }

    onChange(
      editingIndex !== null ? value.map((item, i) => (i === editingIndex ? traveler : item)) : [...value, traveler]
    )
    setDialogOpen(false)
  }

  const canAddMore = value.length < maxCount

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-muted-foreground text-sm'>
          {value.length}/{maxCount} added
        </span>
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

      {value.length > 0 ? (
        <div className='overflow-hidden rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Age</TableHead>
                <TableHead className='w-0' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {value.map((traveler, index) => (
                <TableRow key={`${traveler.email}-${index}`}>
                  <TableCell className='font-medium'>
                    <span className='flex items-center gap-2'>
                      {traveler.firstName} {traveler.lastName}
                      {index === 0 && (
                        <Badge variant='secondary' className='bg-primary/10 text-primary text-xs'>
                          Primary
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>{traveler.email}</TableCell>
                  <TableCell>{traveler.phone}</TableCell>
                  <TableCell>{GENDER_LABEL[traveler.gender]}</TableCell>
                  <TableCell>{traveler.age}</TableCell>
                  <TableCell>
                    <div className='flex items-center justify-end gap-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => openEditDialog(index)}
                        aria-label={`Edit ${traveler.firstName} ${traveler.lastName}`}
                      >
                        <PencilIcon className='size-3.5' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => removeTraveler(index)}
                        aria-label={`Remove ${traveler.firstName} ${traveler.lastName}`}
                      >
                        <Trash2Icon className='size-3.5' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className='text-muted-foreground text-sm'>No travelers added yet.</p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='sm:max-w-105'>
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Traveler' : 'Add Traveler'}</DialogTitle>
            <DialogDescription>Enter the traveler&apos;s details</DialogDescription>
          </DialogHeader>
          <form
            id='traveler-info-form'
            onSubmit={e => {
              e.stopPropagation()
              handleSubmit(onSubmit)(e)
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
                      <FieldLabel htmlFor='traveler-firstName'>First Name</FieldLabel>
                      <Input id='traveler-firstName' placeholder='John' aria-invalid={!!errors.firstName} {...field} />
                      <FieldError errors={[errors.firstName]} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name='lastName'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.lastName}>
                      <FieldLabel htmlFor='traveler-lastName'>Last Name</FieldLabel>
                      <Input id='traveler-lastName' placeholder='Doe' aria-invalid={!!errors.lastName} {...field} />
                      <FieldError errors={[errors.lastName]} />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name='email'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.email}>
                      <FieldLabel htmlFor='traveler-email'>Email Address</FieldLabel>
                      <Input
                        id='traveler-email'
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
                      <FieldLabel htmlFor='traveler-phone'>Phone Number</FieldLabel>
                      <Input
                        id='traveler-phone'
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
                  name='age'
                  render={({ field }) => (
                    <Field data-invalid={!!errors.age}>
                      <FieldLabel htmlFor='traveler-age'>Age</FieldLabel>
                      <Input
                        id='traveler-age'
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
                      <FieldLabel htmlFor='traveler-gender'>Gender</FieldLabel>
                      <Select
                        items={GENDER_OPTIONS}
                        value={field.value ?? null}
                        onValueChange={val => val && field.onChange(val)}
                      >
                        <SelectTrigger id='traveler-gender' className='w-full' aria-invalid={!!errors.gender}>
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
          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' form='traveler-info-form'>
              {editingIndex !== null ? 'Save Changes' : 'Add Traveler'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TravelersInfoField
