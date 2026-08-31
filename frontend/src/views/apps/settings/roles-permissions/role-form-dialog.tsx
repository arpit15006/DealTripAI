'use client'

// React Imports
import { useEffect } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// Type Imports
import type { AppRole } from '@/types/settings/roles-types'

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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RolePermissionsFields } from '@/views/apps/settings/roles-permissions/role-permissions-fields'
import {
  ROLE_FORM_DEFAULT_VALUES,
  buildRoleFormDefaultValues,
  roleFormSchema
} from '@/views/apps/settings/roles-permissions/role-form-schema'
import type { RoleFormValues } from '@/views/apps/settings/roles-permissions/role-form-schema'

// Store Imports
import { useRolesStore } from '@/store/use-roles-store'

type RoleFormDialogProps = {
  role?: AppRole
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RoleFormDialog = ({ role, open, onOpenChange }: RoleFormDialogProps) => {
  const roles = useRolesStore(state => state.roles)
  const addRole = useRolesStore(state => state.addRole)
  const updateRole = useRolesStore(state => state.updateRole)

  const isEditing = !!role

  const {
    control,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: role ? buildRoleFormDefaultValues(role) : ROLE_FORM_DEFAULT_VALUES
  })

  useEffect(() => {
    if (open) reset(role ? buildRoleFormDefaultValues(role) : ROLE_FORM_DEFAULT_VALUES)
  }, [open, role, reset])

  const onSubmit = (values: RoleFormValues) => {
    const normalizedName = values.name.trim()

    const isDuplicateName = roles.some(
      item => item.name.toLowerCase() === normalizedName.toLowerCase() && item.id !== role?.id
    )

    if (isDuplicateName) {
      setError('name', { message: 'A role with this name already exists' })

      return
    }

    if (isEditing) {
      updateRole(role.id, values)
      toast.success('Role updated')
    } else {
      addRole(values)
      toast.success('Role created')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the role name and its resource permissions.'
              : 'Create a new role and configure its permissions.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex min-w-0 flex-col gap-6'>
          <Controller
            control={control}
            name='name'
            render={({ field }) => (
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor='name'>Role Name</FieldLabel>
                <Input id='name' placeholder='e.g. Finance Manager' {...field} />
                <FieldError errors={[errors.name]} />
              </Field>
            )}
          />

          <div className='flex flex-col gap-3'>
            <p className='text-sm font-medium'>Role Permissions</p>
            <div className='overflow-x-auto rounded-lg border'>
              <RolePermissionsFields control={control} watch={watch} />
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RoleFormDialog
