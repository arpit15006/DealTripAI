// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { AppRole, PermissionAction, PermissionResourceKey, RoleFormInput } from '@/types/settings/roles-types'

// Data Imports
import { db } from '@/fake-db/settings/roles'

interface RolesState {
  roles: AppRole[]

  addRole: (input: RoleFormInput) => void
  updateRole: (id: string, input: RoleFormInput) => void
  deleteRole: (id: string) => void
  updatePermission: (roleId: string, resource: PermissionResourceKey, action: PermissionAction, value: boolean) => void
}

export const useRolesStore = create<RolesState>()(set => ({
  roles: db,

  addRole: input => {
    const newRole: AppRole = { id: crypto.randomUUID(), name: input.name.trim(), permissions: input.permissions }

    set(state => ({ roles: [...state.roles, newRole] }))
  },

  updateRole: (id, input) =>
    set(state => ({
      roles: state.roles.map(role =>
        role.id === id ? { ...role, name: input.name.trim(), permissions: input.permissions } : role
      )
    })),

  deleteRole: id => set(state => ({ roles: state.roles.filter(role => role.id !== id) })),

  updatePermission: (roleId, resource, action, value) =>
    set(state => ({
      roles: state.roles.map(role =>
        role.id === roleId
          ? {
              ...role,
              permissions: role.permissions.map(perm =>
                perm.resource === resource ? { ...perm, [action]: value } : perm
              )
            }
          : role
      )
    }))
}))
