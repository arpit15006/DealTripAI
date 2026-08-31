// Third-party Imports
import { ChevronDownIcon, ChevronUpIcon, EllipsisVerticalIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const listItems = ['Share', 'Update', 'Refresh']

const destinationsData = [
  {
    img: '/images/countries/flags/switzerland.webp',
    revenue: '$867k',
    destination: 'Switzerland',
    changePercentage: '20.3%',
    trend: 'up'
  },
  {
    img: '/images/countries/flags/greece.webp',
    revenue: '$1.2M',
    destination: 'Greece',
    changePercentage: '15.7%',
    trend: 'up'
  },
  {
    img: '/images/countries/flags/russia.webp',
    revenue: '$750k',
    destination: 'Russia',
    changePercentage: '18.2%',
    trend: 'down'
  },
  {
    img: '/images/countries/flags/india.webp',
    revenue: '$1.5M',
    destination: 'India',
    changePercentage: '22.1%',
    trend: 'up'
  },
  {
    img: '/images/countries/flags/usa.webp',
    revenue: '$2.5M',
    destination: 'USA',
    changePercentage: '22.1%',
    trend: 'up'
  },
  {
    img: '/images/countries/flags/nz.webp',
    revenue: '$500k',
    destination: 'New Zealand',
    changePercentage: '22.1%',
    trend: 'up'
  },
  {
    img: '/images/countries/flags/kenya.webp',
    revenue: '$700k',
    destination: 'Kenya',
    changePercentage: '22.1%',
    trend: 'up'
  },
  {
    img: '/images/countries/flags/thailand.webp',
    revenue: '$980k',
    destination: 'Thailand',
    changePercentage: '19.6%',
    trend: 'down'
  }
]

const DestinationsWidget = ({ className }: { className?: string }) => {
  return (
    <Card className={className}>
      <CardHeader className='flex justify-between'>
        <div className='flex flex-col gap-1'>
          <span className='text-lg font-semibold'>Top Destinations by Revenue</span>
          <span className='text-muted-foreground text-sm'>Monthly booking revenue overview</span>
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
      <CardContent className='mt-2 flex flex-1 flex-col gap-4'>
        {destinationsData.map((item, index) => (
          <div key={index} className='flex items-center justify-between gap-4'>
            <div className='flex items-center justify-between gap-4'>
              <div className='overflow-hidden rounded-full border-2'>
                <img src={item.img} alt={item.destination} className='size-10 object-cover' />
              </div>
              <div className='flex flex-col gap-0.5'>
                <span className='text-base font-medium'>{item.revenue}</span>
                <span className='text-muted-foreground text-sm'>{item.destination}</span>
              </div>
            </div>
            <span className='flex items-center gap-1'>
              {item.trend === 'up' ? <ChevronUpIcon className='size-4' /> : <ChevronDownIcon className='size-4' />}
              <span className='text-sm'>{item.changePercentage}</span>
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default DestinationsWidget
