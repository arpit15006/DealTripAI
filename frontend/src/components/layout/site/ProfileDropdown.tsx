'use client'

// React Imports
import type { ReactElement } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { UserIcon, SettingsIcon, TicketIcon, HeartIcon, LogOutIcon } from 'lucide-react'

// Component Imports
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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
import { useProfileStore } from '@/store/use-profile-store'

type ProfileDropdownProps = {
  trigger: ReactElement
  align?: 'start' | 'center' | 'end'
}

const ProfileDropdown = ({ trigger, align = 'end' }: ProfileDropdownProps) => {
  const currentUser = useProfileStore(state => state.user)
  const fullName = `${currentUser.firstName} ${currentUser.lastName}`
  const initials = `${currentUser.firstName[0]}${currentUser.lastName[0]}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent className='w-72' align={align || 'end'}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='flex items-center gap-4 px-4 py-2.5 font-normal'>
            <Avatar size='lg'>
              <AvatarImage src={currentUser.avatar || undefined} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-col items-start'>
              <span className='text-foreground text-base font-semibold'>{fullName}</span>
              <span className='text-muted-foreground text-sm'>{currentUser.email}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className='gap-2 px-4 py-2.5 text-base' render={<Link href='/my-dashboard/profile' />}>
            <UserIcon className='text-foreground size-5' />
            <span>My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='gap-2 px-4 py-2.5 text-base' render={<Link href='/my-dashboard/bookings' />}>
            <TicketIcon className='text-foreground size-5' />
            <span>My Bookings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='gap-2 px-4 py-2.5 text-base' render={<Link href='/my-dashboard/favourites' />}>
            <HeartIcon className='text-foreground size-5' />
            <span>Saved Packages</span>
          </DropdownMenuItem>
          <DropdownMenuItem className='gap-2 px-4 py-2.5 text-base' render={<Link href='/my-dashboard' />}>
            <SettingsIcon className='text-foreground size-5' />
            <span>Settings</span>
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

export default ProfileDropdown
