/**
 * ! The data below is used to seed the Roles store. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can replace this with your
 * ! own database queries inside the server action.
 *
 * ! Role `name` values are the source of truth for Members' role assignment — the Members
 * ! module (`@/store/use-members-store`) reads roles from `@/store/use-roles-store` directly to
 * ! populate its role select/filter, and matches members to a role by this same name to compute
 * ! per-role user counts.
 */

// Type Imports
import type { AppRole, PermissionResourceKey, ResourcePermissions } from '@/types/settings/roles-types'
import { PERMISSION_RESOURCES } from '@/types/settings/roles-types'

const perm = (
  resource: PermissionResourceKey,
  read: boolean,
  write: boolean,
  create: boolean,
  del: boolean
): ResourcePermissions => ({ resource, read, write, create, delete: del })

export const db: AppRole[] = [
  {
    id: 'role-001',
    name: 'Admin',
    permissions: PERMISSION_RESOURCES.map(({ key }) => perm(key, true, true, true, true))
  },
  {
    id: 'role-002',
    name: 'Manager',
    permissions: PERMISSION_RESOURCES.map(({ key }) => {
      switch (key) {
        case 'dashboard':
          return perm(key, true, false, false, false)
        case 'inquiries':
          return perm(key, true, true, true, false)
        case 'bookings':
          return perm(key, true, true, true, true)
        case 'customers':
          return perm(key, true, true, true, false)
        case 'tour-packages':
          return perm(key, true, true, true, false)
        case 'coupons-promotions':
          return perm(key, true, true, false, false)
        case 'payments-invoices':
          return perm(key, true, false, false, false)
        case 'documents-visa':
          return perm(key, true, true, false, false)
        case 'reviews-ratings':
          return perm(key, true, true, false, false)
      }
    })
  },
  {
    id: 'role-003',
    name: 'Agent',
    permissions: PERMISSION_RESOURCES.map(({ key }) => {
      switch (key) {
        case 'dashboard':
          return perm(key, true, false, false, false)
        case 'inquiries':
          return perm(key, true, true, true, false)
        case 'bookings':
          return perm(key, true, true, true, false)
        case 'customers':
          return perm(key, true, true, false, false)
        case 'tour-packages':
          return perm(key, true, false, false, false)
        case 'coupons-promotions':
          return perm(key, true, false, false, false)
        case 'payments-invoices':
          return perm(key, true, false, false, false)
        case 'documents-visa':
          return perm(key, true, true, false, false)
        case 'reviews-ratings':
          return perm(key, true, false, false, false)
      }
    })
  },
  {
    id: 'role-004',
    name: 'Support',
    permissions: PERMISSION_RESOURCES.map(({ key }) => {
      switch (key) {
        case 'dashboard':
          return perm(key, true, false, false, false)
        case 'inquiries':
          return perm(key, true, true, false, false)
        case 'bookings':
          return perm(key, true, false, false, false)
        case 'customers':
          return perm(key, true, true, false, false)
        case 'tour-packages':
          return perm(key, true, false, false, false)
        case 'coupons-promotions':
          return perm(key, false, false, false, false)
        case 'payments-invoices':
          return perm(key, true, false, false, false)
        case 'documents-visa':
          return perm(key, true, true, false, false)
        case 'reviews-ratings':
          return perm(key, true, true, false, false)
      }
    })
  },
  {
    id: 'role-005',
    name: 'Finance',
    permissions: PERMISSION_RESOURCES.map(({ key }) => {
      switch (key) {
        case 'dashboard':
          return perm(key, true, false, false, false)
        case 'inquiries':
          return perm(key, false, false, false, false)
        case 'bookings':
          return perm(key, true, false, false, false)
        case 'customers':
          return perm(key, true, false, false, false)
        case 'tour-packages':
          return perm(key, false, false, false, false)
        case 'coupons-promotions':
          return perm(key, true, true, false, false)
        case 'payments-invoices':
          return perm(key, true, true, true, true)
        case 'documents-visa':
          return perm(key, false, false, false, false)
        case 'reviews-ratings':
          return perm(key, false, false, false, false)
      }
    })
  }
]
