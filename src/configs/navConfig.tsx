// Third-party Imports
import type * as Icon from 'lucide-react'

type IconName = keyof typeof Icon

export type MenuLeafSubItem = {
  label: string
  href: string

  /** String = prefix match (`pathname.startsWith`). RegExp = exact pattern match. Use when a
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
    groupLabel: 'Deal Desk',
    items: [
      {
        icon: 'LayoutDashboardIcon',
        label: 'Overview',
        href: '/dashboard'
      },
      {
        icon: 'SparklesIcon',
        label: 'New negotiation',
        href: '/',
        target: '_self'
      },
      {
        icon: 'HistoryIcon',
        label: 'Negotiations',
        href: '/dashboard/negotiations'
      }
    ]
  },
  {
    groupLabel: 'Merchants',
    items: [
      {
        icon: 'StoreIcon',
        label: 'Merchants',
        childItems: [
          { label: 'All merchants', href: '/dashboard/merchants', activePath: /^\/dashboard\/merchants$/ },
          { label: 'Onboard a merchant', href: '/dashboard/merchants/onboard' }
        ]
      }
    ]
  },
  {
    groupLabel: 'Insights',
    items: [
      {
        icon: 'TrendingUpIcon',
        label: 'Revenue simulator',
        href: '/dashboard/simulator'
      }
    ]
  },
  {
    groupLabel: 'Developers',
    items: [
      {
        icon: 'TerminalIcon',
        label: 'Agent API',
        href: '/dashboard/agent-api'
      },
      {
        icon: 'FileJson2Icon',
        label: 'Discovery document',
        href: '/.well-known/agent-commerce.json',
        target: '_blank'
      }
    ]
  }
]
