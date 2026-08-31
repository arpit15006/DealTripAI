// Third-party Imports
import { z } from 'zod'

// Type Imports
import type { AppRole, PermissionResourceKey, ResourcePermissions } from '@/types/settings/roles-types'
import { PERMISSION_RESOURCES } from '@/types/settings/roles-types'

const RESOURCE_KEYS = PERMISSION_RESOURCES.map(resource => resource.key) as [
  PermissionResourceKey,
  ...PermissionResourceKey[]
]

const resourcePermissionsSchema = z.object({
  resource: z.enum(RESOURCE_KEYS),
  read: z.boolean(),
  write: z.boolean(),
  create: z.boolean(),
  delete: z.boolean()
})

export const roleFormSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  permissions: z.array(resourcePermissionsSchema)
})

export type RoleFormValues = z.infer<typeof roleFormSchema>

export const buildDefaultRolePermissions = (): ResourcePermissions[] =>
  PERMISSION_RESOURCES.map(({ key }) => ({ resource: key, read: false, write: false, create: false, delete: false }))

export const ROLE_FORM_DEFAULT_VALUES: RoleFormValues = {
  name: '',
  permissions: buildDefaultRolePermissions()
}

export const buildRoleFormDefaultValues = (role: AppRole): RoleFormValues => ({
  name: role.name,
  permissions: role.permissions
})
