export type CustomerStatus = 'active' | 'inactive' | 'pending'

export const CUSTOMER_STATUS_LIST: CustomerStatus[] = ['active', 'inactive', 'pending']

export const CUSTOMER_STATUS_STYLES: Record<CustomerStatus, { dot: string; text: string; bg: string }> = {
  active: {
    dot: 'bg-green-600 dark:bg-green-400',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-600/10 dark:bg-green-400/10'
  },
  pending: {
    dot: 'bg-amber-600 dark:bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-600/10 dark:bg-amber-400/10'
  },
  inactive: { dot: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10' }
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  status: CustomerStatus
  registeredAt: string
  updatedAt: string
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'avatar' | 'registeredAt' | 'updatedAt'> &
  Partial<Pick<Customer, 'avatar' | 'registeredAt' | 'updatedAt'>>

export type UpdateCustomerInput = Pick<Customer, 'name' | 'email' | 'phone' | 'status'>
