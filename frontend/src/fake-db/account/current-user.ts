// Type Imports
import type { CurrentUser } from '@/types/account/user-types'

export const db: CurrentUser = {
  id: 'user-001',
  firstName: 'Mitchell',
  lastName: 'Johnson',
  email: 'mitchell11@gmail.com',
  phone: '+1 424-243-9906',
  avatar: '/images/avatars/avatar-1.webp',
  birthday: '1996-04-12',
  gender: 'male',
  address: {
    country: 'United States',
    city: 'Santa Anna',
    streetAddress: '13th Street',
    zipCode: '63955'
  }
}
