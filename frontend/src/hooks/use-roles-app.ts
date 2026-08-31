'use client'

// React Imports
import { useCallback, useMemo } from 'react'

// Type Imports
import type { AppRoleWithUsers, PermissionAction, PermissionResourceKey } from '@/types/settings/roles-types'

// Store Imports
import { useRolesStore } from '@/store/use-roles-store'
import { useMembersStore } from '@/store/use-members-store'

export function useRolesApp() {
  // Pull raw state/actions from stores — one selector per line
  const roles = useRolesStore(state => state.roles)
  const updatePermission = useRolesStore(state => state.updatePermission)
  const members = useMembersStore(state => state.items)

  // Derived state — each role's assigned members, matched by role name
  const rolesWithUsers = useMemo<AppRoleWithUsers[]>(
    () =>
      roles.map(role => ({
        ...role,
        users: members
          .filter(member => member.role === role.name)
          .map(member => ({ id: member.id, name: `${member.firstName} ${member.lastName}`, avatar: member.avatar }))
      })),
    [roles, members]
  )

  const handlePermissionChange = useCallback(
    (roleId: string, resource: PermissionResourceKey, action: PermissionAction, value: boolean) => {
      updatePermission(roleId, resource, action, value)
    },
    [updatePermission]
  )

  return { rolesWithUsers, handlePermissionChange }
}
