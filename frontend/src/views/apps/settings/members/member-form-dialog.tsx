'use client'

// React Imports
import { useEffect, useMemo } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// Type Imports
import type { Member, UpdateMemberInput } from '@/types/settings/members-types'

// Component Imports
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MEMBER_FORM_DEFAULT_VALUES,
  buildMemberFormDefaultValues,
  memberSchema
} from '@/views/apps/settings/members/member-form-schema'
import type { MemberFormValues } from '@/views/apps/settings/members/member-form-schema'

// Store Imports
import { useMembersStore } from '@/store/use-members-store'
import { useRolesStore } from '@/store/use-roles-store'

type MemberFormDialogProps = {
  member?: Member
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MemberFormDialog = ({ member, open, onOpenChange }: MemberFormDialogProps) => {
  const items = useMembersStore(state => state.items)
  const addMember = useMembersStore(state => state.addMember)
  const updateMember = useMembersStore(state => state.updateMember)

  const roles = useRolesStore(state => state.roles)
  const roleOptions = useMemo(() => roles.map(role => ({ label: role.name, value: role.name })), [roles])

  const isEditing = !!member

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: member ? buildMemberFormDefaultValues(member) : MEMBER_FORM_DEFAULT_VALUES
  })

  useEffect(() => {
    if (open) reset(member ? buildMemberFormDefaultValues(member) : MEMBER_FORM_DEFAULT_VALUES)
  }, [open, member, reset])

  const onSubmit = (values: MemberFormValues) => {
    const normalizedEmail = values.email.trim().toLowerCase()

    const isDuplicateEmail = items.some(item => item.email.toLowerCase() === normalizedEmail && item.id !== member?.id)

    if (isDuplicateEmail) {
      setError('email', { message: 'This email is already in use' })

      return
    }

    if (isEditing) {
      const input: UpdateMemberInput = { ...values, email: normalizedEmail }

      updateMember(member.id, input)
      toast.success('Member updated')
    } else {
      addMember({ ...values, email: normalizedEmail })
      toast.success('Invitation sent')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Member' : 'Invite Member'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update the details of ${member.firstName} ${member.lastName}.`
              : 'Send an invitation to join your team.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Controller
              control={control}
              name='firstName'
              render={({ field }) => (
                <Field data-invalid={!!errors.firstName}>
                  <FieldLabel htmlFor='firstName'>First Name</FieldLabel>
                  <Input id='firstName' placeholder='Jane' {...field} />
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
                <Field className='sm:col-span-2' data-invalid={!!errors.email}>
                  <FieldLabel htmlFor='email'>Email</FieldLabel>
                  <Input id='email' type='email' placeholder='jane.doe@tourix.com' {...field} />
                  <FieldError errors={[errors.email]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='phone'
              render={({ field }) => (
                <Field data-invalid={!!errors.phone}>
                  <FieldLabel htmlFor='phone'>Phone</FieldLabel>
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
              name='role'
              render={({ field }) => (
                <Field data-invalid={!!errors.role}>
                  <FieldLabel htmlFor='role'>Role</FieldLabel>
                  <Select
                    items={roleOptions}
                    value={field.value}
                    onValueChange={value => value && field.onChange(value)}
                  >
                    <SelectTrigger id='role' className='w-full'>
                      <SelectValue placeholder='Select role' />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {roleOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.role]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='jobTitle'
              render={({ field }) => (
                <Field className='sm:col-span-2' data-invalid={!!errors.jobTitle}>
                  <FieldLabel htmlFor='jobTitle'>Job Title</FieldLabel>
                  <Input id='jobTitle' placeholder='Travel Agent' {...field} />
                  <FieldError errors={[errors.jobTitle]} />
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default MemberFormDialog
