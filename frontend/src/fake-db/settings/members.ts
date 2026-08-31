/**
 * ! The data below is used to seed the Members store. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can replace this with your
 * ! own database queries inside the server action.
 */

// Type Imports
import type { Member } from '@/types/settings/members-types'

export const db: Member[] = [
  {
    id: 'team-001',
    firstName: 'Olivia',
    lastName: 'Bennett',
    email: 'olivia.bennett@tourix.com',
    phone: '+14155550148',
    avatar: '/images/avatars/avatar-5.webp',
    jobTitle: 'Operations Manager',
    role: 'Admin',
    status: 'active',
    joinedAt: '2024-02-10',
    updatedAt: '2026-07-20'
  },
  {
    id: 'team-002',
    firstName: 'Daniel',
    lastName: 'Cho',
    email: 'daniel.cho@tourix.com',
    phone: '+13125550173',
    avatar: '/images/avatars/avatar-8.webp',
    jobTitle: 'Bookings Lead',
    role: 'Manager',
    status: 'active',
    joinedAt: '2024-06-02',
    updatedAt: '2026-07-18'
  },
  {
    id: 'team-003',
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'priya.nair@tourix.com',
    phone: '+16465550102',
    avatar: '/images/avatars/avatar-11.webp',
    jobTitle: 'Travel Agent',
    role: 'Agent',
    status: 'active',
    joinedAt: '2025-01-15',
    updatedAt: '2026-06-30'
  },
  {
    id: 'team-004',
    firstName: 'Marcus',
    lastName: 'Silva',
    email: 'marcus.silva@tourix.com',
    phone: '+12135550164',
    avatar: '/images/avatars/avatar-14.webp',
    jobTitle: 'Customer Support Specialist',
    role: 'Support',
    status: 'invited',
    joinedAt: '2026-07-28',
    updatedAt: '2026-07-28'
  },
  {
    id: 'team-005',
    firstName: 'Hannah',
    lastName: 'Wolfe',
    email: 'hannah.wolfe@tourix.com',
    phone: '+17205550119',
    avatar: '/images/avatars/avatar-17.webp',
    jobTitle: 'Travel Agent',
    role: 'Agent',
    status: 'suspended',
    joinedAt: '2024-11-04',
    updatedAt: '2026-05-12'
  },
  {
    id: 'team-006',
    firstName: 'Ethan',
    lastName: 'Brooks',
    email: 'ethan.brooks@tourix.com',
    phone: '+19175550187',
    avatar: '/images/avatars/avatar-20.webp',
    jobTitle: 'Bookings Coordinator',
    role: 'Manager',
    status: 'invited',
    joinedAt: '2026-08-01',
    updatedAt: '2026-08-01'
  }
]
