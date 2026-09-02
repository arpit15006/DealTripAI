'use client'

// Third-party Imports
import { HistoryIcon, LayoutDashboardIcon, SearchIcon, StoreIcon, TrendingUpIcon } from 'lucide-react'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import AdminProfileDropdown from '@/components/layout/AdminProfileDropdown'
import DynamicBreadcrumb from '@/components/layout/DynamicBreadcrumb'
import CommandMenu from './CommandMenu'

// Store Imports
import { useAdminPersonalInfo } from '@/store/use-admin-profile-store'

// Hook Imports
import { useSettings } from '@/hooks/use-settings'

// Utils Imports
import { cn } from '@/lib/utils'

// Data Imports
import { adminSearchData } from '@/assets/data/admin-search'

/**
 * What the palette offers before anything is typed.
 *
 * These were still the template's own pages, and all three of the lower ones
 * pointed at routes this product does not have, so the first thing the palette
 * did was offer three dead ends.
 */
const ADMIN_SEARCH_SUGGESTIONS = [
  { icon: LayoutDashboardIcon, name: 'Overview', href: '/dashboard' },
  { icon: StoreIcon, name: 'All merchants', href: '/dashboard/merchants' },
  { icon: HistoryIcon, name: 'Negotiations', href: '/dashboard/negotiations' },
  { icon: TrendingUpIcon, name: 'Revenue simulator', href: '/dashboard/simulator' }
]

const Header = () => {
  const { settings, updateSettings } = useSettings()
  const { open, isMobile } = useSidebar()

  const { profile } = useAdminPersonalInfo()
  const fullName = `${profile.firstName} ${profile.lastName}`

  return (
    <header>
      <div
        className={cn(
          'mx-auto flex w-full items-center gap-2 border-b px-4 py-2',
          settings.layout === 'compact' ? 'max-w-348' : 'w-full'
        )}
      >
        <div className='flex min-w-0 items-center gap-2'>
          <SidebarTrigger
            className='[&_svg]:size-5!'
            onClick={() => {
              if (!isMobile) updateSettings({ sidebarOpen: !open })
            }}
          />
          <Separator orientation='vertical' className='h-5 data-vertical:self-center' />
          <DynamicBreadcrumb className='max-lg:hidden' />
        </div>
        <div className='flex flex-1 px-2 md:justify-center'>
          <CommandMenu
            data={adminSearchData}
            suggestions={ADMIN_SEARCH_SUGGESTIONS}
            trigger={
              <Button variant='outline' className='hidden w-full max-w-md justify-start gap-2 px-2.5 sm:flex'>
                <SearchIcon className='size-4' />
                <span className='text-sm font-normal'>Search...</span>
              </Button>
            }
            compactTrigger={
              <Button variant='ghost' size='icon' className='sm:hidden'>
                <SearchIcon />
                <span className='sr-only'>Search</span>
              </Button>
            }
          />
        </div>
        <div className='flex items-center gap-2'>
          <AdminProfileDropdown
            trigger={
              <Button variant='ghost' size='icon' className='rounded-full' aria-label='Open profile menu'>
                <Avatar className='size-8'>
                  <AvatarImage src={profile.avatar || undefined} alt={fullName} />
                  <AvatarFallback className='text-xs'>
                    {profile.firstName[0]}
                    {profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
        </div>
      </div>
    </header>
  )
}

export default Header
