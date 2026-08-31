export type NavLink = { label: string; href: string; target?: '_blank'; matchPrefix?: string }
export type NavGroup = { heading: string; items: NavLink[] }
export type NavItem = ({ href: string; items?: never } | { href?: never; items: NavLink[] | NavGroup[] }) & {
  label: string
  target?: '_blank'
}

export const isNavGroupList = (items: NavLink[] | NavGroup[]): items is NavGroup[] =>
  items.length > 0 && 'heading' in items[0]

export const flattenNavLinks = (items: NavLink[] | NavGroup[]): NavLink[] =>
  isNavGroupList(items) ? items.flatMap(group => group.items) : items

export const isNavLinkActive = (link: NavLink, pathname: string) =>
  link.matchPrefix ? pathname.startsWith(link.matchPrefix) : pathname === link.href

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Packages',
    items: [
      { label: 'Tour Packages', href: '/tour-packages' },
      { label: 'Package Details', href: '/tour-packages/bali-island-escape', matchPrefix: '/tour-packages/' }
    ]
  },
  {
    label: 'Pages',
    items: [
      {
        heading: 'Miscellaneous',
        items: [{ label: 'Error Page', href: '/error-page', target: '_blank' }]
      },
      {
        heading: 'Authentication Pages',
        items: [
          { label: 'Login', href: '/login', target: '_blank' },
          { label: 'Register', href: '/register', target: '_blank' },
          { label: 'Forgot Password', href: '/forgot-password', target: '_blank' },
          { label: 'Reset Password', href: '/reset-password', target: '_blank' },
          { label: 'Two Factor Authentication', href: '/two-factor-authentication', target: '_blank' },
          { label: 'Verify Email', href: '/verify-email', target: '_blank' }
        ]
      }
    ]
  },
  {
    label: 'User Pages',
    items: [
      { label: 'My Dashboard', href: '/my-dashboard' },
      { label: 'My Bookings', href: '/my-dashboard/bookings' },
      { label: 'My Favourite', href: '/my-dashboard/favourites' },
      { label: 'Booking Status', href: '/my-dashboard/track-booking' },
      { label: 'Transaction & Cards', href: '/my-dashboard/transactions' },
      { label: 'Notifications', href: '/my-dashboard/notifications' },
      { label: 'Profile', href: '/my-dashboard/profile' }
    ]
  }
]
