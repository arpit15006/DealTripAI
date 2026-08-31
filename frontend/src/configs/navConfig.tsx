// Third-party Imports
import type * as Icon from 'lucide-react'

// Data Imports
import { db as bookingsDb } from '@/fake-db/account/bookings'
import { db as invoicesDb } from '@/fake-db/apps/invoices'

type IconName = keyof typeof Icon

export type MenuLeafSubItem = {
  label: string
  href: string

  /** String = prefix match (`pathname.startsWith`). RegExp = exact pattern match — use when a
   * prefix would also match sibling routes (e.g. `/bookings/create`, `/bookings/{id}/edit`). */
  activePath?: string | RegExp
  badge?: string
  badgeClassName?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
}

export type MenuGroupSubItem = {
  label: string
  childItems: MenuLeafSubItem[]
}

export type MenuSubItem = MenuLeafSubItem | MenuGroupSubItem

export type MenuItem = {
  icon: IconName
  label: string
} & (
  | {
      href: string
      badge?: string
      badgeClassName?: string
      childItems?: never
      target?: '_blank' | '_self' | '_parent' | '_top'
    }
  | { href?: never; badge?: never; childItems: MenuSubItem[] }
)

export type NavItem = {
  groupLabel?: string
  items: MenuItem[]
}

export const navItems: NavItem[] = [
  {
    groupLabel: 'Travel Management',
    items: [
      {
        icon: 'LayoutDashboardIcon',
        label: 'Dashboard',
        href: '/dashboard'
      },
      {
        icon: 'CalendarCheckIcon',
        label: 'Bookings',
        childItems: [
          { label: 'All Bookings', href: '/dashboard/bookings' },
          { label: 'Create Booking', href: '/dashboard/bookings/create' },
          {
            label: 'Booking Details',
            href: `/dashboard/bookings/${bookingsDb[0].id}`,

            // Any booking's detail page, but not /create or /{id}/edit — both also start with
            // `/dashboard/bookings/` and would otherwise match too.
            activePath: /^\/dashboard\/bookings\/(?!create$)[^/]+$/
          },
          {
            label: 'Edit Booking',
            href: `/dashboard/bookings/${bookingsDb[0].id}/edit`,
            activePath: /^\/dashboard\/bookings\/[^/]+\/edit$/
          }
        ]
      },
      {
        icon: 'UsersIcon',
        label: 'Customers',
        childItems: [
          { label: 'Customer List', href: '/dashboard/customers-list' },
          { label: 'Customer Profile', href: '/dashboard/customers-list/profile' }
        ]
      },
      {
        icon: 'PackageIcon',
        label: 'Tour Packages',
        childItems: [
          { label: 'Package List', href: '/dashboard/tour-packages' },
          { label: 'Create Package', href: '/dashboard/tour-packages/create' },
          { label: 'Destinations', href: '/dashboard/tour-packages/destinations' },
          {
            label: 'Package Details',
            href: '/dashboard/tour-packages/package-details',

            // Also match single-package deep links `/dashboard/tour-packages/{id}` and
            // `/dashboard/tour-packages/{id}/edit` (e.g. from a "View package" action) while
            // excluding static sibling routes.
            activePath: /^\/dashboard\/tour-packages\/(?!create$|destinations$)[^/]+(?:\/edit)?$/
          }
        ]
      }
    ]
  },
  {
    groupLabel: 'Commerce & Finance',
    items: [
      {
        icon: 'TicketPercentIcon',
        label: 'Coupons & Promotions',
        href: '/dashboard/coupons-promotions'
      },
      {
        icon: 'CreditCardIcon',
        label: 'Payments & Invoices',
        childItems: [
          { label: 'Transactions', href: '/dashboard/payments-invoices/transactions' },
          { label: 'Create Invoice', href: '/dashboard/payments-invoices/invoices/create' },
          {
            label: 'Invoice View',
            href: `/dashboard/payments-invoices/invoices/${invoicesDb[0].id}`,
            activePath: /^\/dashboard\/payments-invoices\/invoices\/(?!create$)[^/]+$/
          }
        ]
      }
    ]
  },
  {
    groupLabel: 'Settings',
    items: [
      {
        icon: 'UserIcon',
        label: 'Profile Settings',
        href: '/dashboard/settings/profile'
      },
      {
        icon: 'StoreIcon',
        label: 'Store Information',
        href: '/dashboard/settings/store-information'
      },
      {
        icon: 'UsersIcon',
        label: 'Members',
        href: '/dashboard/settings/members'
      },
      {
        icon: 'ShieldCheckIcon',
        label: 'Roles & Permissions',
        href: '/dashboard/settings/roles-permissions'
      },
      {
        icon: 'MailIcon',
        label: 'Email Templates',
        href: '/dashboard/settings/email-templates'
      },
      {
        icon: 'StarIcon',
        label: 'Reviews & Ratings',
        href: '/dashboard/settings/reviews-ratings'
      }
    ]
  },
  {
    groupLabel: 'Miscellaneous',
    items: [
      {
        icon: 'MenuIcon',
        label: 'Menu Level',
        childItems: [
          {
            label: 'Menu Item ',
            href: '#'
          },
          {
            label: 'Menu Level 1',
            childItems: [{ label: 'Menu Level 2', href: '#' }]
          }
        ]
      },
      {
        icon: 'BookOpenTextIcon',
        label: 'Documentation',
        href: 'https://shadcnstudio.com/docs/documentation-admin/getting-started',
        target: '_blank'
      }
    ]
  }
]
