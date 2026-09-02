// React Imports
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

// Third-party Imports
import {
  AlertTriangleIcon,
  BellIcon,
  ChartAreaIcon,
  CircleUserIcon,
  CreditCardIcon,
  HeartIcon,
  HomeIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  type LucideProps,
  LogInIcon,
  MailCheckIcon,
  MapIcon,
  SearchCheckIcon,
  ShieldCheckIcon,
  TicketIcon,
  UserIcon,
  UserPlusIcon
} from 'lucide-react'

export type SearchData = {
  title: string
  data: {
    icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
    name: string
    href: string
    shortcut?: string
    openInNewTab?: boolean
    tags?: string[]
  }[]
}

export const searchData: SearchData[] = [
  {
    title: 'Main',
    data: [
      {
        icon: HomeIcon,
        name: 'Home',
        href: '/'
      },
      {
        icon: MapIcon,
        name: 'Tour Packages',
        href: '/tour-packages',
        tags: ['packages', 'destinations', 'trips']
      },
      {
        icon: ChartAreaIcon,
        name: 'Admin Dashboard',
        href: '/dashboard',
        tags: ['admin', 'analytics']
      }
    ]
  },
  {
    title: 'My Dashboard',
    data: [
      {
        icon: LayoutDashboardIcon,
        name: 'My Dashboard',
        href: '/my-dashboard',
        tags: ['account', 'overview']
      },
      {
        icon: TicketIcon,
        name: 'My Bookings',
        href: '/my-dashboard/bookings'
      },
      {
        icon: HeartIcon,
        name: 'My Favourites',
        href: '/my-dashboard/favourites',
        tags: ['wishlist', 'saved']
      },
      {
        icon: SearchCheckIcon,
        name: 'Booking Status',
        href: '/my-dashboard/track-booking',
        tags: ['track booking']
      },
      {
        icon: CreditCardIcon,
        name: 'Transaction & Cards',
        href: '/my-dashboard/transactions',
        tags: ['payments', 'billing']
      },
      {
        icon: BellIcon,
        name: 'Notifications',
        href: '/my-dashboard/notifications'
      },
      {
        icon: UserIcon,
        name: 'Profile',
        href: '/my-dashboard/profile'
      }
    ]
  },
  {
    title: 'Pages',
    data: [
      {
        icon: CircleUserIcon,
        name: 'About Us',
        href: '/about-us'
      },
      {
        icon: AlertTriangleIcon,
        name: 'Error Page',
        href: '/error-page',
        openInNewTab: true
      },
      {
        icon: LogInIcon,
        name: 'Login',
        href: '/login',
        openInNewTab: true
      },
      {
        icon: UserPlusIcon,
        name: 'Register',
        href: '/register',
        openInNewTab: true
      },
      {
        icon: KeyRoundIcon,
        name: 'Forgot Password',
        href: '/forgot-password',
        openInNewTab: true
      },
      {
        icon: KeyRoundIcon,
        name: 'Reset Password',
        href: '/reset-password',
        openInNewTab: true
      },
      {
        icon: ShieldCheckIcon,
        name: 'Two Factor Authentication',
        href: '/two-factor-authentication',
        openInNewTab: true
      },
      {
        icon: MailCheckIcon,
        name: 'Verify Email',
        href: '/verify-email',
        openInNewTab: true
      }
    ]
  }
]
