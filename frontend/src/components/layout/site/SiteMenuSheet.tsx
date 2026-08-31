'use client'

// React Imports
import { useState } from 'react'
import type { ReactElement } from 'react'

// Next Imports
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Third-party Imports
import { useMedia } from 'react-use'
import { ChevronRightIcon, CircleSmallIcon } from 'lucide-react'

// Component Imports
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import LogoSvg from '@/assets/svg/logo'

// Utils Imports
import { cn } from '@/lib/utils'

// Type Imports
import type { NavItem, NavLink } from '@/components/layout/site/nav-items'

// Data Imports
import { isNavGroupList, flattenNavLinks, isNavLinkActive } from '@/components/layout/site/nav-items'
import themeConfig from '@/configs/themeConfig'

type SiteMenuSheetProps = {
  trigger: ReactElement
  navItems: NavItem[]
}

const SiteMenuSheet = ({ trigger, navItems }: SiteMenuSheetProps) => {
  const [open, setOpen] = useState(false)

  const pathname = usePathname()
  const isDesktop = useMedia('(min-width: 1024px)', false)

  const handleLinkClick = () => setOpen(false)

  const isItemActive = (item: NavItem) =>
    item.items ? flattenNavLinks(item.items).some(sub => isNavLinkActive(sub, pathname)) : pathname === item.href

  const renderSubLink = (sub: NavLink) => (
    <Link
      key={sub.label}
      href={sub.href}
      target={sub.target}
      rel={sub.target === '_blank' ? 'noopener noreferrer' : undefined}
      onClick={handleLinkClick}
      className={cn(
        'm-1 flex items-center gap-2 px-4 py-2 text-sm',
        isNavLinkActive(sub, pathname)
          ? 'bg-primary/10 text-primary rounded-md'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <CircleSmallIcon className='ml-2 size-4' />
      {sub.label}
    </Link>
  )

  return (
    <Sheet open={open && !isDesktop} onOpenChange={setOpen}>
      <SheetTrigger render={trigger} />
      <SheetContent side='left' className='w-75 gap-0 p-0'>
        <SheetHeader className='p-4'>
          <SheetTitle hidden />
          <SheetDescription hidden />
          <Link href='/' onClick={handleLinkClick} className='flex items-center gap-2 self-start font-semibold'>
            <LogoSvg className='[&_rect]:fill-primary size-8.5 [&_line]:stroke-white [&_path]:stroke-white' />
            <span className='text-xl font-semibold'>{themeConfig.templateName}</span>
          </Link>
        </SheetHeader>
        <div className='overflow-y-auto px-1 py-2'>
          {navItems.map(item =>
            item.items ? (
              <Collapsible key={item.label} className='w-full'>
                <CollapsibleTrigger
                  className={cn(
                    'group flex w-full items-center justify-between px-4 py-2 text-sm font-medium',
                    isItemActive(item)
                      ? 'bg-primary text-primary-foreground rounded-md'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {item.label}
                  <ChevronRightIcon className='size-4 shrink-0 transition-transform duration-300 group-data-panel-open:rotate-90' />
                </CollapsibleTrigger>
                <CollapsibleContent className='h-(--collapsible-panel-height) overflow-hidden transition-all duration-300 data-ending-style:h-0 data-starting-style:h-0'>
                  {isNavGroupList(item.items)
                    ? item.items.map((group, groupIndex) => (
                        <div key={group.heading} className={cn(groupIndex > 0 && 'border-t pt-1')}>
                          <span className='text-muted-foreground block px-4 pt-2 pb-1 text-xs font-semibold tracking-wide uppercase'>
                            {group.heading}
                          </span>
                          {group.items.map(renderSubLink)}
                        </div>
                      ))
                    : item.items.map(renderSubLink)}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                target={item.target}
                rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground rounded-md'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SiteMenuSheet
