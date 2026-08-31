'use client'

// Third-party Imports
import { format } from 'date-fns'
import { CalendarIcon, MailIcon, PhoneIcon } from 'lucide-react'

// Type Imports
import type { Booking } from '@/types/account/booking-types'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// Store Imports
import { useProfileStore } from '@/store/use-profile-store'

// Utils Imports
import { DEFAULT_CONTACT_AVATAR } from '@/utils/booking-utils'

type CustomerInfoCardProps = {
  booking: Booking
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')

const CustomerInfoCard = ({ booking }: CustomerInfoCardProps) => {
  const profileUser = useProfileStore(state => state.user)

  const isProfileUser = Boolean(profileUser.email) && booking.contactEmail === profileUser.email
  const avatarSrc = (isProfileUser ? profileUser.avatar : booking.contactAvatar) || DEFAULT_CONTACT_AVATAR

  return (
    <Card className='shadow-none'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base font-semibold'>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <Avatar className='size-11'>
            <AvatarImage src={avatarSrc} alt={booking.contactName} />
            <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
              {getInitials(booking.contactName) || 'NA'}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <p className='truncate font-semibold'>{booking.contactName || 'Not provided'}</p>
            <p className='text-muted-foreground text-xs'>Primary Contact</p>
          </div>
        </div>

        <Separator />

        <div className='flex flex-col gap-2.5 text-sm'>
          <div className='flex items-center gap-2'>
            <MailIcon className='text-muted-foreground size-3.5 shrink-0' />
            <span className='text-muted-foreground'>Email</span>
            <span className='ml-auto truncate font-medium'>{booking.contactEmail || '—'}</span>
          </div>
          <div className='flex items-center gap-2'>
            <PhoneIcon className='text-muted-foreground size-3.5 shrink-0' />
            <span className='text-muted-foreground'>Phone</span>
            <span className='ml-auto font-medium'>{booking.contactPhone || '—'}</span>
          </div>
          <div className='flex items-center gap-2'>
            <CalendarIcon className='text-muted-foreground size-3.5 shrink-0' />
            <span className='text-muted-foreground'>Booked On</span>
            <span className='ml-auto font-medium'>{format(new Date(booking.bookedAt), 'dd MMM yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerInfoCard
