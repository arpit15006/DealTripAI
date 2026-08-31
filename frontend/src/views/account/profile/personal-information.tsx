'use client'

// React Imports
import { useEffect, useRef } from 'react'
import type { ChangeEvent } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Trash2Icon, UploadCloudIcon } from 'lucide-react'
import { z } from 'zod'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Store Imports
import { useProfileStore } from '@/store/use-profile-store'

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' }
]

const COUNTRY_OPTIONS = [
  { label: 'United States', value: 'United States' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Australia', value: 'Australia' },
  { label: 'India', value: 'India' },
  { label: 'Germany', value: 'Germany' },
  { label: 'France', value: 'France' },
  { label: 'Japan', value: 'Japan' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'Brazil', value: 'Brazil' }
]

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'Enter your first name'),
  lastName: z.string().min(2, 'Enter your last name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  gender: z.enum(['male', 'female', 'other']),
  country: z.string().min(1, 'Select your country')
})

type FormValues = z.infer<typeof personalInfoSchema>

const PersonalInformation = () => {
  const user = useProfileStore(state => state.user)
  const updatePersonalInfo = useProfileStore(state => state.updatePersonalInfo)
  const updateAvatar = useProfileStore(state => state.updateAvatar)
  const removeAvatar = useProfileStore(state => state.removeAvatar)

  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const fullName = `${user.firstName} ${user.lastName}`

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { ...user, country: user.address.country }
  })

  useEffect(() => {
    reset({ ...user, country: user.address.country })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  const onSubmit = (values: FormValues) => {
    updatePersonalInfo(values)
    toast.success('Profile updated!')
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      e.currentTarget.value = ''

      return
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error('Image must be smaller than 2MB')
      e.currentTarget.value = ''

      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      updateAvatar(reader.result as string)
      toast.success('Avatar updated!')
    }

    reader.readAsDataURL(file)
    e.currentTarget.value = ''
  }

  const handleRemoveAvatar = () => {
    removeAvatar()
    toast.success('Avatar removed')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-5'>
          <div className='flex flex-col gap-2'>
            <FieldLabel>Your Avatar</FieldLabel>
            <div className='flex items-center gap-4'>
              <Avatar className='size-16'>
                <AvatarImage src={user.avatar || undefined} alt={fullName} />
                <AvatarFallback>
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className='flex items-start gap-2'>
                <input
                  ref={avatarInputRef}
                  type='file'
                  accept='image/*'
                  className='sr-only'
                  onChange={handleAvatarChange}
                />
                <div className='flex flex-col gap-1'>
                  <Button type='button' variant='outline' onClick={() => avatarInputRef.current?.click()}>
                    <UploadCloudIcon className='size-4' />
                    Upload avatar
                  </Button>
                  <p className='text-muted-foreground text-sm'>Pick a photo up to 2MB</p>
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  aria-label='Remove avatar'
                  onClick={handleRemoveAvatar}
                  disabled={!user.avatar}
                  className='text-destructive!'
                >
                  <Trash2Icon className='size-4' />
                </Button>
              </div>
            </div>
          </div>

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
                  <Input id='email' type='email' placeholder='john@gmail.com' {...field} />
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
                  <Input id='phone' placeholder='123-456-7890' {...field} />
                  <FieldError errors={[errors.phone]} />
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
          </FieldGroup>
          <div className='flex justify-end'>
            <Button type='submit' disabled={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default PersonalInformation
