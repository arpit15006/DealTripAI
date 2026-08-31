'use client'

// React Imports
import { Fragment } from 'react'

// Next Imports
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Third-party Imports
import {
  GlobeIcon,
  BellIcon,
  SearchIcon,
  MenuIcon,
  LayoutDashboardIcon,
  SmartphoneIcon,
  BinocularsIcon,
  ZapIcon
} from 'lucide-react'

import type { NavItem } from '@/components/layout/site/nav-items'

// Component Imports
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu'
import ModeToggle from '@/components/layout/ModeToggle'
import ThemeCustomizer from '@/components/layout/ThemeCustomizer'
import CommandMenu from '@/components/layout/CommandMenu'
import LanguageDropdown from '@/components/layout/site/LanguageDropdown'
import NotificationDropdown from '@/components/layout/site/NotificationDropdown'
import ProfileDropdown from '@/components/layout/site/ProfileDropdown'
import SiteMenuSheet from '@/components/layout/site/SiteMenuSheet'

// SVGs Imports
import LogoSvg from '@/assets/svg/logo'

// Utils Imports
import { cn } from '@/lib/utils'

// Store Imports
import { useProfileStore } from '@/store/use-profile-store'
import { useCompanyProfile } from '@/store/use-store-information-store'

// Data Imports
import { navItems, isNavGroupList, flattenNavLinks, isNavLinkActive } from '@/components/layout/site/nav-items'

const RECENTLY_VIEWED_PACKAGES = [
  {
    slug: 'swiss-alps-adventure',
    title: 'Swiss Alps Adventure',
    image: '/images/countries/switzerland/switzerland-1.webp',
    price: 2199,
    originalPrice: 2299
  },
  {
    slug: 'maldives-honeymoon-bliss',
    title: 'Maldives Honeymoon Bliss',
    image: '/images/countries/maldives/maldives-1.webp',
    price: 3299,
    originalPrice: 3499
  },
  {
    slug: 'dubai-luxury-city-break',
    title: 'Dubai Luxury City Break',
    image: '/images/countries/uae/uae-1.webp',
    price: 1999,
    originalPrice: 2099
  }
]

const SiteHeader = () => {
  const pathname = usePathname()
  const currentUser = useProfileStore(state => state.user)
  const { companyProfile } = useCompanyProfile()

  const isItemActive = (item: NavItem) =>
    item.items ? flattenNavLinks(item.items).some(sub => isNavLinkActive(sub, pathname)) : pathname === item.href

  return (
    <header className='bg-card sticky top-0 z-50 border-b shadow-sm backdrop-blur-sm'>
      <div className='border-b'>
        <div className='mx-auto flex max-w-360 items-center justify-between gap-2.5 px-4 py-3 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-4'>
            <SiteMenuSheet
              navItems={navItems}
              trigger={
                <Button variant='outline' size='icon-lg' className='inline-flex lg:hidden'>
                  <MenuIcon />
                  <span className='sr-only'>Menu</span>
                </Button>
              }
            />
            <Link href='/' className='flex items-center gap-2 font-semibold'>
              <LogoSvg className='[&_rect]:fill-primary size-8.5' />
              <span className='hidden text-lg sm:block'>{companyProfile.name}</span>
            </Link>
          </div>
          <CommandMenu
            trigger={
              <Button variant='outline' className='hidden w-full max-w-72 justify-start gap-2 px-2.5 lg:flex'>
                <SearchIcon className='size-4' />
                <span className='text-sm font-normal'>Search...</span>
              </Button>
            }
            compactTrigger={
              <Button variant='ghost' size='icon-lg' className='hover:bg-white/20! aria-expanded:bg-white/20 lg:hidden'>
                <SearchIcon />
                <span className='sr-only'>Search</span>
              </Button>
            }
          />
          <div className='flex items-center gap-1.5'>
            <LanguageDropdown
              trigger={
                <Button variant='ghost'>
                  <GlobeIcon /> <p className='hidden md:block'>EN | US</p>
                  <span className='sr-only'>Language</span>
                </Button>
              }
            />
            <div className='hidden md:block'>
              <HoverCard>
                <HoverCardTrigger
                  delay={100}
                  closeDelay={100}
                  render={
                    <Button variant='ghost'>
                      <SmartphoneIcon />
                      App
                    </Button>
                  }
                />
                <HoverCardContent className='w-83'>
                  <div className='flex items-center gap-4'>
                    <div className='flex flex-col items-center gap-2'>
                      <img
                        src='/images/qr-code.webp'
                        alt='QR code to download the app'
                        className='size-28 rounded-md border object-contain p-1'
                      />
                      <p className='text-muted-foreground text-center text-xs'>Scan to get the app</p>
                    </div>
                    <Separator orientation='vertical' className='h-auto' />
                    <div className='flex flex-1 flex-col justify-center gap-2'>
                      <Link
                        href='#'
                        target='_blank'
                        className='bg-card-foreground flex items-center gap-2.5 rounded-sm px-3 py-2'
                      >
                        <img src='/images/apple-icon.webp' alt='App Store' className='size-8.5 invert dark:invert-0' />
                        <div className='flex flex-col items-start'>
                          <p className='text-card text-xs leading-4'>Download on the</p>
                          <p className='text-card text-sm leading-5 font-medium opacity-90'>App Store</p>
                        </div>
                      </Link>
                      <Link
                        href='#'
                        target='_blank'
                        className='bg-card-foreground flex items-center gap-2.5 rounded-sm px-3 py-2'
                      >
                        <img src='/images/google-play.webp' alt='Google Play' className='size-8.5' />
                        <div className='flex flex-col items-start'>
                          <p className='text-card text-xs leading-4'>GET IT ON</p>
                          <p className='text-card text-sm leading-5 font-medium opacity-90'>Google Play</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div className='hidden md:block'>
              <HoverCard>
                <HoverCardTrigger
                  delay={100}
                  closeDelay={100}
                  render={
                    <Button variant='ghost'>
                      <BinocularsIcon />
                      Recently Viewed
                    </Button>
                  }
                />
                <HoverCardContent className='w-80 p-2'>
                  <div className='space-y-2'>
                    {RECENTLY_VIEWED_PACKAGES.map((pkg, index) => (
                      <Fragment key={pkg.slug}>
                        <Link
                          href={`/tour-packages/${pkg.slug}`}
                          className='hover:bg-muted flex items-center gap-3 rounded-md p-2'
                        >
                          <img src={pkg.image} alt={pkg.title} className='size-14 shrink-0 rounded-md object-cover' />
                          <div className='min-w-0 flex-1'>
                            <p className='line-clamp-2 text-base font-medium'>{pkg.title}</p>
                            <span className='text-muted-foreground text-xs line-through'>
                              US$ {pkg.originalPrice.toLocaleString()}
                            </span>
                            <div className='flex items-center gap-1'>
                              <span className='text-base'>US$ {pkg.price.toLocaleString()}</span>
                              <ZapIcon className='size-3.5 fill-amber-500 text-amber-500' />
                            </div>
                          </div>
                        </Link>
                        {index !== RECENTLY_VIEWED_PACKAGES.length - 1 && <Separator />}
                      </Fragment>
                    ))}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <NotificationDropdown
              trigger={
                <Button variant='ghost' size='icon-lg' className='relative'>
                  <BellIcon />
                  <span className='bg-destructive absolute top-[14%] right-[23%] size-2 rounded-full' />
                  <span className='sr-only'>Notifications</span>
                </Button>
              }
            />
            <ThemeCustomizer scope='site' />
            <ModeToggle />
            <ProfileDropdown
              trigger={
                <Button size='icon-lg' variant='ghost' className='h-full p-0'>
                  <Avatar className='size-[inherit] rounded-[inherit] after:rounded-[inherit]'>
                    <AvatarImage src={currentUser.avatar || undefined} className='rounded-[inherit]' />
                    <AvatarFallback className='rounded-[inherit]'>
                      {currentUser.firstName[0]}
                      {currentUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              }
            />
          </div>
        </div>
      </div>
      <div className='mx-auto flex max-w-360 items-center justify-between gap-8 px-4 py-3 sm:px-6 lg:px-8'>
        <NavigationMenu className='max-lg:hidden'>
          <NavigationMenuList className='gap-1'>
            {navItems.map(item => (
              <NavigationMenuItem key={item.label}>
                {item.items ? (
                  <>
                    <NavigationMenuTrigger
                      className={cn(
                        'h-auto gap-1.5 px-3 py-1.5 text-sm font-medium',
                        isItemActive(item)
                          ? 'bg-primary! text-primary-foreground! hover:bg-primary! hover:text-primary-foreground! focus:bg-primary! data-popup-open:bg-primary!'
                          : 'text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent focus:bg-transparent data-popup-open:bg-transparent'
                      )}
                    >
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className='grid w-56 gap-1'>
                        {isNavGroupList(item.items)
                          ? item.items.map((group, groupIndex) => (
                              <li key={group.heading} className={cn(groupIndex > 0 && 'border-t pt-2')}>
                                <span className='text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase'>
                                  {group.heading}
                                </span>
                                <ul className='mt-1 grid gap-1'>
                                  {group.items.map(sub => (
                                    <li key={sub.label}>
                                      <NavigationMenuLink
                                        render={
                                          <Link
                                            href={sub.href}
                                            target={sub.target}
                                            rel={sub.target === '_blank' ? 'noopener noreferrer' : undefined}
                                          />
                                        }
                                        className={cn(
                                          isNavLinkActive(sub, pathname)
                                            ? 'bg-primary/10! text-primary! hover:bg-primary/10! hover:text-primary!'
                                            : undefined
                                        )}
                                      >
                                        {sub.label}
                                      </NavigationMenuLink>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))
                          : item.items.map(sub => (
                              <li key={sub.label}>
                                <NavigationMenuLink
                                  render={
                                    <Link
                                      href={sub.href}
                                      target={sub.target}
                                      rel={sub.target === '_blank' ? 'noopener noreferrer' : undefined}
                                    />
                                  }
                                  className={cn(
                                    isNavLinkActive(sub, pathname)
                                      ? 'bg-primary/10! text-primary! hover:bg-primary/10! hover:text-primary!'
                                      : undefined
                                  )}
                                >
                                  {sub.label}
                                </NavigationMenuLink>
                              </li>
                            ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    render={
                      <Link
                        href={item.href}
                        target={item.target}
                        rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      />
                    }
                    className={cn(
                      'bg-transparent px-3 py-1.5 text-sm font-medium',
                      isItemActive(item)
                        ? 'bg-primary! text-primary-foreground! hover:bg-primary! hover:text-primary-foreground!'
                        : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
                    )}
                  >
                    {item.label}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <Button size='lg' render={<Link href='/dashboard' />} nativeButton={false}>
          <LayoutDashboardIcon />
          Admin
        </Button>
      </div>
    </header>
  )
}

export default SiteHeader
