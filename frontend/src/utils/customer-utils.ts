// Type Imports
import type { CurrentUser } from '@/types/account/user-types'
import type { Customer } from '@/types/apps/customer-types'

export const isSyncedCustomer = (customer: Customer, profileUser: CurrentUser): boolean =>
  Boolean(profileUser.email) && customer.email === profileUser.email

export const mergeProfileUser = (customers: Customer[], profileUser: CurrentUser): Customer[] =>
  customers.map(customer =>
    isSyncedCustomer(customer, profileUser)
      ? {
          ...customer,
          name: `${profileUser.firstName} ${profileUser.lastName}`.trim(),
          phone: profileUser.phone,
          avatar: profileUser.avatar
        }
      : customer
  )
