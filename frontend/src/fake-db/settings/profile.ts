/**
 * ! The data below is used to seed the Admin Profile store. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can replace this with your
 * ! own database queries inside the server action.
 */

// Type Imports
import type { AdminProfile } from '@/types/settings/profile-types'

export const db: AdminProfile = {
  id: 'admin-001',
  firstName: 'Olivia',
  lastName: 'Bennett',
  email: 'olivia.bennett@tourix.com',
  phone: '+14155550148',
  avatar: '/images/avatars/avatar-5.webp',
  jobTitle: 'Operations Manager',
  bio: 'Manages day-to-day platform operations across bookings, packages and partner coordination.',
  gender: 'female',
  timezone: 'America/Los_Angeles',
  language: 'en'
}
