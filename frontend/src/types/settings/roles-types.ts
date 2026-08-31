export type PermissionAction = 'read' | 'write' | 'create' | 'delete'

export const PERMISSION_ACTIONS: PermissionAction[] = ['read', 'write', 'create', 'delete']

export type PermissionResourceKey =
  | 'dashboard'
  | 'inquiries'
  | 'bookings'
  | 'customers'
  | 'tour-packages'
  | 'coupons-promotions'
  | 'payments-invoices'
  | 'documents-visa'
  | 'reviews-ratings'

export const PERMISSION_RESOURCES: { key: PermissionResourceKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'inquiries', label: 'Inquiries' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'customers', label: 'Customers' },
  { key: 'tour-packages', label: 'Tour Packages' },
  { key: 'coupons-promotions', label: 'Coupons & Promotions' },
  { key: 'payments-invoices', label: 'Payments & Invoices' },
  { key: 'documents-visa', label: 'Documents & Visa' },
  { key: 'reviews-ratings', label: 'Reviews & Ratings' }
]

export interface ResourcePermissions {
  resource: PermissionResourceKey
  read: boolean
  write: boolean
  create: boolean
  delete: boolean
}

export interface AppRole {
  id: string
  name: string
  permissions: ResourcePermissions[]
}

export type RoleFormInput = {
  name: string
  permissions: ResourcePermissions[]
}

export interface RoleUser {
  id: string
  name: string
  avatar: string
}

export interface AppRoleWithUsers extends AppRole {
  users: RoleUser[]
}
