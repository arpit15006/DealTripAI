'use client'

// Third-party Imports
import { useFieldArray } from 'react-hook-form'
import type { Control, UseFormWatch } from 'react-hook-form'

// Type Imports
import type { PermissionAction, PermissionResourceKey } from '@/types/settings/roles-types'
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from '@/types/settings/roles-types'
import type { RoleFormValues } from '@/views/apps/settings/roles-permissions/role-form-schema'

// Component Imports
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type RolePermissionsFieldsProps = {
  control: Control<RoleFormValues>
  watch: UseFormWatch<RoleFormValues>
}

const RESOURCE_LABELS: Record<PermissionResourceKey, string> = Object.fromEntries(
  PERMISSION_RESOURCES.map(resource => [resource.key, resource.label])
) as Record<PermissionResourceKey, string>

export const RolePermissionsFields = ({ control, watch }: RolePermissionsFieldsProps) => {
  const { fields, update, replace } = useFieldArray({ control, name: 'permissions' })
  const currentPermissions = watch('permissions') ?? []

  const allGlobalSelected =
    currentPermissions.length > 0 && currentPermissions.every(perm => PERMISSION_ACTIONS.every(action => perm[action]))

  const someGlobalSelected =
    currentPermissions.some(perm => PERMISSION_ACTIONS.some(action => perm[action])) && !allGlobalSelected

  const handleGlobalSelectAll = (checked: boolean) => {
    replace(
      currentPermissions.map(perm => ({ ...perm, read: checked, write: checked, create: checked, delete: checked }))
    )
  }

  const handleRowSelectAll = (index: number, checked: boolean) => {
    const perm = currentPermissions[index]

    if (!perm) return
    update(index, { ...perm, read: checked, write: checked, create: checked, delete: checked })
  }

  const handlePermissionChange = (index: number, action: PermissionAction, checked: boolean) => {
    const perm = currentPermissions[index]

    if (!perm) return
    update(index, { ...perm, [action]: checked })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='w-48 p-3'>Resource</TableHead>
          <TableHead className='p-3! text-center'>
            <Checkbox
              checked={allGlobalSelected}
              indeterminate={someGlobalSelected}
              onCheckedChange={value => handleGlobalSelectAll(!!value)}
              aria-label='Select all permissions'
            />
          </TableHead>
          {PERMISSION_ACTIONS.map(action => (
            <TableHead key={action} className='p-3 text-center capitalize'>
              {action}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field, index) => {
          const perm = currentPermissions[index]

          if (!perm) return null

          const allForRow = PERMISSION_ACTIONS.every(action => perm[action])
          const someForRow = PERMISSION_ACTIONS.some(action => perm[action]) && !allForRow

          return (
            <TableRow key={field.id}>
              <TableCell className='p-3 font-medium'>{RESOURCE_LABELS[perm.resource]}</TableCell>
              <TableCell className='p-3! text-center'>
                <Checkbox
                  checked={allForRow}
                  indeterminate={someForRow}
                  onCheckedChange={value => handleRowSelectAll(index, !!value)}
                  aria-label={`Select all for ${RESOURCE_LABELS[perm.resource]}`}
                />
              </TableCell>
              {PERMISSION_ACTIONS.map(action => (
                <TableCell key={action} className='p-3 text-center'>
                  <Checkbox
                    checked={perm[action]}
                    onCheckedChange={value => handlePermissionChange(index, action, !!value)}
                    aria-label={`${RESOURCE_LABELS[perm.resource]} ${action}`}
                  />
                </TableCell>
              ))}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
