// React Imports
import type { ReactElement } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { CheckCircle2Icon, CreditCardIcon, MailIcon, TagIcon, XIcon } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'

// Utils Imports
import { cn } from '@/lib/utils'

type NotificationDropdownProps = {
  trigger: ReactElement
  align?: 'start' | 'center' | 'end'
}

const notifications = [
  {
    id: 'booking-status',
    icon: CheckCircle2Icon,
    iconClassName: 'bg-green-600/10 text-green-600 dark:text-green-400 dark:bg-green-400/10',
    title: 'Booking Status Update',
    message:
      'Your booking for the Bali Adventure package has been confirmed! Get ready for an unforgettable experience.',
    time: '12 minutes ago',
    href: '/my-dashboard/track-booking',
    unread: true
  },
  {
    id: 'payment-due',
    icon: CreditCardIcon,
    iconClassName: 'bg-amber-600/10 text-amber-600 dark:text-amber-400 dark:bg-amber-400/10',
    title: 'Complete Your Payment',
    message: 'Finish payment for your Maldives Honeymoon Bliss package to secure your spot.',
    time: '27 minutes ago',
    href: '/my-dashboard/bookings',
    unread: true
  },
  {
    id: 'update-email',
    icon: MailIcon,
    iconClassName: 'bg-sky-600/10 text-blue-600 dark:text-blue-400 dark:bg-blue-400/10',
    title: 'Update Your Email',
    message: 'Add a verified email address to receive booking confirmations and receipts.',
    time: '2 hours ago',
    href: '/my-dashboard/profile',
    unread: true
  },
  {
    id: 'price-drop',
    icon: TagIcon,
    iconClassName: 'bg-primary/10 text-primary',
    title: 'Price Drop Alert',
    message: 'Kyoto Temple Discovery just got cheaper — book before the offer ends.',
    time: '1 day ago',
    href: '/tour-packages/kyoto-temple-discovery',
    unread: false
  }
]

const NotificationDropdown = ({ trigger, align = 'end' }: NotificationDropdownProps) => {
  const unreadCount = notifications.filter(notification => notification.unread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent className='w-full max-w-xs sm:max-w-sm' align={align || 'end'}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='flex items-center justify-between gap-6 pb-2.5'>
            <span className='text-muted-foreground text-sm font-normal uppercase'>Notifications</span>
            <Badge variant='secondary' className='bg-primary/10 text-primary font-normal'>
              {unreadCount} New
            </Badge>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className='mt-0 h-0.5' />

        {notifications.map((notification, index) => (
          <div key={notification.id}>
            <DropdownMenuItem
              className='gap-3 px-2 py-3 text-base not-data-[variant=destructive]:focus:**:text-[revert-rule]'
              render={<Link href={notification.href} />}
            >
              <div
                className={cn(
                  'flex size-9.5 shrink-0 items-center justify-center rounded-full',
                  notification.iconClassName
                )}
              >
                <notification.icon className='size-4.5' />
              </div>
              <div className='flex w-full flex-col items-start gap-1'>
                <span className='text-base font-medium'>{notification.title}</span>
                <span className='text-muted-foreground text-sm'>{notification.message}</span>
                <span className='text-muted-foreground text-xs'>{notification.time}</span>
              </div>
              <div className='flex flex-col items-center gap-3'>
                <XIcon className='text-foreground size-3.5' />
                {notification.unread && <div className='bg-primary size-1.5 rounded-full' />}
              </div>
            </DropdownMenuItem>
            {index < notifications.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationDropdown
