'use client'

// Third-party Imports
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { CircleDollarSignIcon, CreditCardIcon, EllipsisVerticalIcon, WalletIcon } from 'lucide-react'

// Component Imports
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
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

const weeklyRevenueChartData = [
  { day: 'Monday', revenue: 3100 },
  { day: 'Tuesday', revenue: 3100 },
  { day: 'Wednesday', revenue: 5000 },
  { day: 'Thursday', revenue: 5000 },
  { day: 'Friday', revenue: 4000 },
  { day: 'Saturday', revenue: 4000 },
  { day: 'Sunday', revenue: 5920 }
]

const weeklyRevenueChartConfig = {
  revenue: {
    label: 'Revenue'
  }
} satisfies ChartConfig

const reportData = [
  {
    icon: <WalletIcon className='text-chart-2 size-6 stroke-[1.5]' />,
    title: 'Booking Revenue',
    amount: '$5,550'
  },
  {
    icon: <CreditCardIcon className='text-chart-1 size-6 stroke-[1.5]' />,
    title: 'Refunds',
    amount: '$3,520'
  },
  {
    icon: <CircleDollarSignIcon className='text-chart-5 size-6 stroke-[1.5]' />,
    title: 'Net Profit',
    amount: '$2,350'
  }
]

const ChartWeeklyRevenue = ({ className }: { className?: string }) => {
  return (
    <Card className={cn('grid gap-0 py-0 lg:grid-cols-3', className)}>
      <Card className='rounded-none shadow-none ring-0 max-lg:border-b lg:col-span-2 lg:border-r'>
        <CardHeader className='flex justify-between'>
          <div className='flex flex-col gap-1'>
            <span className='text-lg font-semibold'>Weekly Revenue</span>
            <span className='text-muted-foreground text-sm'>Booking revenue overview</span>
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
        <CardContent>
          <ChartContainer
            config={weeklyRevenueChartConfig}
            className='max-h-80 min-h-48 w-full text-sm uppercase max-[400px]:max-w-73'
          >
            <AreaChart data={weeklyRevenueChartData} margin={{ left: -18, right: 12, top: 12, bottom: 0 }}>
              <defs>
                <linearGradient id='fillRevenue' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='20%' stopColor='var(--chart-2)' stopOpacity={1} />
                  <stop offset='80%' stopColor='var(--chart-2)' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3' strokeWidth={2} stroke='var(--border)' vertical={false} />
              <XAxis
                dataKey='day'
                tickLine={false}
                tickMargin={5.5}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)' }}
                tickFormatter={value => value.slice(0, 2)}
              />
              <YAxis
                domain={[1000, 6000]}
                allowDataOverflow
                ticks={[1000, 2000, 3000, 4000, 5000, 6000]}
                tickFormatter={value => `$${value / 1000}k`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                tickMargin={8}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className='normal-case'
                    formatter={value => [`$${((value as number) / 1000).toFixed(1)}k`, ' Revenue']}
                  />
                }
              />
              <Area
                dataKey='revenue'
                type='linear'
                fill='url(#fillRevenue)'
                stroke='var(--chart-2)'
                strokeWidth={2}
                stackId='a'
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className='flex flex-col gap-10 rounded-none shadow-none ring-0'>
        <CardHeader className='flex justify-between'>
          <div className='flex flex-col gap-1'>
            <span className='text-lg font-semibold'>Report</span>
            <span className='text-muted-foreground text-sm'>Weekly activity</span>
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
        <CardContent className='grow text-base'>
          <div className='flex h-full flex-col gap-4'>
            {reportData.map((report, index) => (
              <div key={index} className='bg-muted flex grow items-center justify-between gap-4 rounded-md px-4 py-2'>
                <div className='flex items-center gap-4'>
                  <Avatar size='lg' className='rounded-sm after:border-0'>
                    <AvatarFallback className='bg-card text-primary shrink-0 rounded-sm'>{report.icon}</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-muted-foreground font-medium'>{report.title}</span>
                    <span className='text-lg font-medium'>{report.amount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Card>
  )
}

export default ChartWeeklyRevenue
