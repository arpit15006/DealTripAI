// Third-party Imports
import {
  CalendarCheckIcon,
  CompassIcon,
  CreditCardIcon,
  EyeIcon,
  LayoutDashboardIcon,
  MailIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  StoreIcon,
  TicketPercentIcon,
  UserIcon,
  UsersIcon
} from 'lucide-react'

// Type Imports
import type { SearchData } from '@/assets/data/search'

// Data Imports
import { db as bookingsDb } from '@/fake-db/account/bookings'
import { db as invoicesDb } from '@/fake-db/apps/invoices'
import { db as tourPackagesDb } from '@/fake-db/packages/tour-packages'

export const adminSearchData: SearchData[] = [
  {
    title: 'Travel Management',
    data: [
      {
        icon: LayoutDashboardIcon,
        name: 'Dashboard',
        href: '/dashboard',
        tags: ['overview', 'analytics']
      },
      {
        icon: CalendarCheckIcon,
        name: 'All Bookings',
        href: '/dashboard/bookings',
        tags: ['reservations', 'calendar', 'table']
      },
      {
        icon: PlusIcon,
        name: 'Create Booking',
        href: '/dashboard/bookings/create'
      },
      {
        icon: EyeIcon,
        name: 'Booking Details',
        href: `/dashboard/bookings/${bookingsDb[0].id}`
      },
      {
        icon: PencilIcon,
        name: 'Edit Booking',
        href: `/dashboard/bookings/${bookingsDb[0].id}/edit`
      },
      {
        icon: UsersIcon,
        name: 'Customer List',
        href: '/dashboard/customers-list',
        tags: ['customers']
      },
      {
        icon: UserIcon,
        name: 'Customer Profile',
        href: '/dashboard/customers-list/profile'
      },
      {
        icon: PackageIcon,
        name: 'Tour Packages',
        href: '/dashboard/tour-packages',
        tags: ['trips', 'packages']
      },
      {
        icon: PlusIcon,
        name: 'Create Package',
        href: '/dashboard/tour-packages/create'
      },
      {
        icon: EyeIcon,
        name: 'Package Details',
        href: '/dashboard/tour-packages/package-details'
      },
      {
        icon: PencilIcon,
        name: 'Edit Package',
        href: `/dashboard/tour-packages/${tourPackagesDb[0].id}/edit`
      },
      {
        icon: CompassIcon,
        name: 'Destinations',
        href: '/dashboard/tour-packages/destinations'
      }
    ]
  },
  {
    title: 'Commerce & Finance',
    data: [
      {
        icon: TicketPercentIcon,
        name: 'Coupons & Promotions',
        href: '/dashboard/coupons-promotions',
        tags: ['discounts', 'offers']
      },
      {
        icon: CreditCardIcon,
        name: 'Transactions',
        href: '/dashboard/payments-invoices/transactions',
        tags: ['payments', 'invoices', 'billing']
      },
      {
        icon: PlusIcon,
        name: 'Create Invoice',
        href: '/dashboard/payments-invoices/invoices/create'
      },
      {
        icon: EyeIcon,
        name: 'Invoice View',
        href: `/dashboard/payments-invoices/invoices/${invoicesDb[0].id}`
      }
    ]
  },
  {
    title: 'Settings',
    data: [
      {
        icon: UserIcon,
        name: 'Profile Settings',
        href: '/dashboard/settings/profile'
      },
      {
        icon: StoreIcon,
        name: 'Store Information',
        href: '/dashboard/settings/store-information'
      },
      {
        icon: UsersIcon,
        name: 'Members',
        href: '/dashboard/settings/members',
        tags: ['team']
      },
      {
        icon: UsersIcon,
        name: 'Roles & Permissions',
        href: '/dashboard/settings/roles-permissions',
        tags: ['access', 'security']
      },
      {
        icon: MailIcon,
        name: 'Email Templates',
        href: '/dashboard/settings/email-templates'
      },
      {
        icon: StarIcon,
        name: 'Reviews & Ratings',
        href: '/dashboard/settings/reviews-ratings',
        tags: ['feedback']
      }
    ]
  }
]
