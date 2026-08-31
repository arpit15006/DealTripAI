// React Imports
import type { ReactElement } from 'react'

// Third-party Imports
import {
  CalendarCheckIcon,
  CircleOffIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  MousePointerClickIcon,
  SearchIcon,
  TriangleAlertIcon
} from 'lucide-react'

// Component Imports
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Utils Imports
import { cn } from '@/lib/utils'

const listItems = ['Share', 'Update', 'Refresh']

type BookingFunnelStep = {
  icon: ReactElement
  title: string
  value: string
  percentage: string
  avatarClassName?: string
}

const bookingFunnelData: BookingFunnelStep[] = [
  {
    icon: <SearchIcon />,
    title: 'Inquiries',
    value: '14,250',
    percentage: '0.3%',
    avatarClassName: 'bg-chart-1/10 text-chart-1'
  },
  {
    icon: <EyeIcon />,
    title: 'Package Views',
    value: '4,523',
    percentage: '3.1%',
    avatarClassName: 'bg-chart-2/10 text-chart-2'
  },
  {
    icon: <MousePointerClickIcon />,
    title: 'Bookings Started',
    value: '1,250',
    percentage: '1.3%',
    avatarClassName: 'bg-chart-4/10 text-chart-4'
  },
  {
    icon: <CalendarCheckIcon />,
    title: 'Confirmed Bookings',
    value: '750',
    percentage: '9.8%',
    avatarClassName: 'bg-chart-3/10 text-chart-3'
  },
  {
    icon: <TriangleAlertIcon />,
    title: 'Payment Errors',
    value: '20',
    percentage: '1.5%',
    avatarClassName: 'bg-chart-5/10 text-chart-5'
  },
  {
    icon: <CircleOffIcon />,
    title: 'Cancelled',
    value: '86',
    percentage: '0.6%'
  }
]

const BookingFunnelWidget = ({ className }: { className?: string }) => {
  return (
    <Card className={className}>
      <CardHeader className='flex justify-between'>
        <div className='flex flex-col gap-1'>
          <span className='text-lg font-semibold'>Monthly Booking Funnel</span>
          <span className='text-muted-foreground text-sm'>7.58k Website Visitors</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant='ghost' size='icon' className='text-muted-foreground size-6 rounded-full' />}
          >
            <EllipsisVerticalIcon />
            <span className='sr-only'>Menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              {listItems.map((item, index) => (
                <DropdownMenuItem key={index}>{item}</DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col justify-between gap-4'>
        {bookingFunnelData.map((step, index) => (
          <div key={index} className='flex items-center justify-between gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <Avatar className='rounded-sm after:border-0'>
                <AvatarFallback
                  className={cn('bg-primary/10 text-primary shrink-0 rounded-sm *:size-4', step.avatarClassName)}
                >
                  {step.icon}
                </AvatarFallback>
              </Avatar>
              <span className='text-base font-medium'>{step.title}</span>
            </div>
            <div className='flex items-center justify-between gap-2 text-sm'>
              <span className='text-muted-foreground'>{step.value}</span>
              <span>{step.percentage}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default BookingFunnelWidget
