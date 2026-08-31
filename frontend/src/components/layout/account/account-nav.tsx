'use client'

// Next Imports
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Third-party Imports
import {
  BellIcon,
  CreditCardIcon,
  HeartIcon,
  LayoutDashboardIcon,
  MapPinnedIcon,
  TicketIcon,
  UserIcon
} from 'lucide-react'

// Type Imports
import type { NavLink } from '@/components/layout/site/nav-items'

// Utils Imports
import { cn } from '@/lib/utils'

// Data Imports
import { navItems, flattenNavLinks } from '@/components/layout/site/nav-items'

const ACCOUNT_NAV_ICONS: Record<string, typeof LayoutDashboardIcon> = {
  '/my-dashboard': LayoutDashboardIcon,
  '/my-dashboard/bookings': TicketIcon,
  '/my-dashboard/favourites': HeartIcon,
  '/my-dashboard/track-booking': MapPinnedIcon,
  '/my-dashboard/transactions': CreditCardIcon,
  '/my-dashboard/notifications': BellIcon,
  '/my-dashboard/profile': UserIcon
}

const accountLinks: NavLink[] = flattenNavLinks(navItems.find(item => item.label === 'User Pages')?.items ?? [])

const AccountNav = () => {
  const pathname = usePathname()

  return (
    <nav className='flex flex-col gap-1'>
      {accountLinks.map(link => {
        const Icon = ACCOUNT_NAV_ICONS[link.href] ?? LayoutDashboardIcon
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className='size-4' />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default AccountNav
