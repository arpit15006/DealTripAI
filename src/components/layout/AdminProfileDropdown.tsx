'use client'

// React Imports
import type { ReactElement } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { CalendarCheckIcon, CreditCardIcon, LogOutIcon, PackageIcon, UserIcon } from 'lucide-react'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Store Imports
import { useAdminPersonalInfo } from '@/store/use-admin-profile-store'

type AdminProfileDropdownProps = {
  trigger: ReactElement
  align?: 'start' | 'center' | 'end'
}

const AdminProfileDropdown = ({ trigger, align = 'end' }: AdminProfileDropdownProps) => {
  const { profile } = useAdminPersonalInfo()
  const fullName = `${profile.firstName} ${profile.lastName}`
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent className='w-72' align={align || 'end'}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='flex items-center gap-4 px-4 py-2.5 font-normal'>
            <Avatar size='lg'>
              <AvatarImage src={profile.avatar || undefined} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-col items-start'>
              <span className='text-foreground text-base font-semibold'>{fullName}</span>
              <span className='text-muted-foreground text-sm'>{profile.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='gap-2 px-4 py-2.5 text-base' render={<Link href='/dashboard/bookings' />}>
            <CalendarCheckIcon className='text-foreground size-5' />
            <span>All Bookings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='gap-2 px-4 py-2.5 text-base' render={<Link href='/dashboard/tour-packages' />}>
            <PackageIcon className='text-foreground size-5' />
            <span>Tour Packages</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='gap-2 px-4 py-2.5 text-base'
            render={<Link href='/dashboard/payments-invoices/transactions' />}
          >
            <CreditCardIcon className='text-foreground size-5' />
            <span>Transactions</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='gap-2 px-4 py-2.5 text-base'
            render={<Link href='/dashboard/settings/profile' />}
          >
            <UserIcon className='text-foreground size-5' />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant='destructive'
            className='gap-2 px-4 py-2.5 text-base'
            render={<Link href='/login' />}
          >
            <LogOutIcon className='size-5' />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AdminProfileDropdown
