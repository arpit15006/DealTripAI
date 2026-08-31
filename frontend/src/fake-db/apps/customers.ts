// Type Imports
import type { Customer } from '@/types/apps/customer-types'

/**
 * ! The data below is used to seed the Customers store. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can replace this with your
 * ! own database queries inside the server action.
 *
 * ! customer-001's email matches the seed profile in `src/fake-db/account/current-user.ts` —
 * ! this is what lets the Customer List's first row stay live-synced with Account > Profile.
 */
export const db: Customer[] = [
  {
    id: 'customer-001',
    name: 'Mitchell Johnson',
    email: 'mitchell11@gmail.com',
    phone: '+1 424-243-9906',
    avatar: '/images/avatars/avatar-1.webp',
    status: 'active',
    registeredAt: '2025-11-02',
    updatedAt: '2026-07-30'
  },
  {
    id: 'customer-002',
    name: 'Amelia Carter',
    email: 'amelia.carter@example.com',
    phone: '+1 415-552-1187',
    avatar: '/images/avatars/avatar-2.webp',
    status: 'active',
    registeredAt: '2026-07-28',
    updatedAt: '2026-08-01'
  },
  {
    id: 'customer-003',
    name: 'Noah Williams',
    email: 'noah.williams@example.com',
    phone: '+1 312-664-2098',
    avatar: '/images/avatars/avatar-3.webp',
    status: 'pending',
    registeredAt: '2026-08-01',
    updatedAt: '2026-08-01'
  },
  {
    id: 'customer-004',
    name: 'John Romeo',
    email: 'johnromeo@example.com',
    phone: '+1 213-778-4432',
    avatar: '/images/avatars/avatar-4.webp',
    status: 'active',
    registeredAt: '2025-05-19',
    updatedAt: '2026-06-14'
  },
  {
    id: 'customer-005',
    name: 'Liam Anderson',
    email: 'liam.anderson@example.com',
    phone: '+1 646-221-9075',
    avatar: '/images/avatars/avatar-5.webp',
    status: 'inactive',
    registeredAt: '2024-09-11',
    updatedAt: '2025-12-02'
  },
  {
    id: 'customer-006',
    name: 'Ethan Davis',
    email: 'ethan.davis@example.com',
    phone: '+1 702-330-5561',
    avatar: '/images/avatars/avatar-6.webp',
    status: 'active',
    registeredAt: '2026-07-15',
    updatedAt: '2026-07-25'
  },
  {
    id: 'customer-007',
    name: 'Mona Lisa',
    email: 'monalisa@example.com',
    phone: '+1 917-440-6623',
    avatar: '/images/avatars/avatar-7.webp',
    status: 'pending',
    registeredAt: '2026-07-22',
    updatedAt: '2026-07-22'
  },
  {
    id: 'customer-008',
    name: 'Isabella Wilson',
    email: 'isabella.wilson@example.com',
    phone: '+1 305-889-7712',
    avatar: '/images/avatars/avatar-8.webp',
    status: 'active',
    registeredAt: '2025-02-27',
    updatedAt: '2026-05-09'
  },
  {
    id: 'customer-009',
    name: 'James Taylor',
    email: 'james.taylor@example.com',
    phone: '+1 480-556-3390',
    avatar: '/images/avatars/avatar-9.webp',
    status: 'inactive',
    registeredAt: '2024-12-05',
    updatedAt: '2025-08-19'
  },
  {
    id: 'customer-010',
    name: 'Charlotte Moore',
    email: 'charlotte.moore@example.com',
    phone: '+1 720-994-2287',
    avatar: '/images/avatars/avatar-10.webp',
    status: 'active',
    registeredAt: '2026-06-08',
    updatedAt: '2026-07-11'
  },
  {
    id: 'customer-011',
    name: 'Benjamin Clark',
    email: 'benjamin.clark@example.com',
    phone: '+1 617-225-8834',
    avatar: '/images/avatars/avatar-11.webp',
    status: 'active',
    registeredAt: '2025-08-14',
    updatedAt: '2026-04-02'
  },
  {
    id: 'customer-012',
    name: 'Mia Rodriguez',
    email: 'mia.rodriguez@example.com',
    phone: '+1 210-773-6612',
    avatar: '/images/avatars/avatar-12.webp',
    status: 'pending',
    registeredAt: '2026-07-30',
    updatedAt: '2026-07-30'
  },
  {
    id: 'customer-013',
    name: 'Lucas Lewis',
    email: 'lucas.lewis@example.com',
    phone: '+1 813-994-2201',
    avatar: '/images/avatars/avatar-13.webp',
    status: 'active',
    registeredAt: '2025-01-23',
    updatedAt: '2026-03-17'
  },
  {
    id: 'customer-014',
    name: 'Amelia Walker',
    email: 'amelia.walker@example.com',
    phone: '+1 512-336-9087',
    avatar: '/images/avatars/avatar-14.webp',
    status: 'inactive',
    registeredAt: '2024-06-30',
    updatedAt: '2025-05-21'
  },
  {
    id: 'customer-015',
    name: 'Henry Hall',
    email: 'henry.hall@example.com',
    phone: '+1 619-448-7765',
    avatar: '/images/avatars/avatar-15.webp',
    status: 'active',
    registeredAt: '2026-07-10',
    updatedAt: '2026-07-29'
  },
  {
    id: 'customer-016',
    name: 'Evelyn Allen',
    email: 'evelyn.allen@example.com',
    phone: '+1 971-556-3320',
    avatar: '/images/avatars/avatar-16.webp',
    status: 'active',
    registeredAt: '2025-10-04',
    updatedAt: '2026-02-11'
  },
  {
    id: 'customer-017',
    name: 'Alexander Young',
    email: 'alexander.young@example.com',
    phone: '+1 404-887-2256',
    avatar: '/images/avatars/avatar-17.webp',
    status: 'pending',
    registeredAt: '2026-07-26',
    updatedAt: '2026-07-26'
  },
  {
    id: 'customer-018',
    name: 'Harper King',
    email: 'harper.king@example.com',
    phone: '+1 206-771-4498',
    avatar: '/images/avatars/avatar-18.webp',
    status: 'active',
    registeredAt: '2025-03-15',
    updatedAt: '2026-01-08'
  },
  {
    id: 'customer-019',
    name: 'Daniel Wright',
    email: 'daniel.wright@example.com',
    phone: '+1 303-559-7743',
    avatar: '/images/avatars/avatar-19.webp',
    status: 'inactive',
    registeredAt: '2024-11-18',
    updatedAt: '2025-09-27'
  },
  {
    id: 'customer-020',
    name: 'Avery Scott',
    email: 'avery.scott@example.com',
    phone: '+1 602-338-1195',
    avatar: '/images/avatars/avatar-20.webp',
    status: 'active',
    registeredAt: '2026-05-21',
    updatedAt: '2026-06-30'
  }
]
