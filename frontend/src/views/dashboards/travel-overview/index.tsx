'use client'

// Third-party Imports
import { BookMarkedIcon, DollarSignIcon, EyeIcon, TicketCheckIcon } from 'lucide-react'

// Component Imports
import { Card } from '@/components/ui/card'
import { columns } from '@/views/apps/tour-packages/columns'
import { TourPackagesDataTable } from '@/views/apps/tour-packages/data-table'
import BookingFunnelWidget from '@/views/dashboards/travel-overview/booking-funnel-widget'
import ChartBookingPerformance from '@/views/dashboards/travel-overview/chart-booking-performance'
import ChartWeeklyRevenue from '@/views/dashboards/travel-overview/chart-weekly-revenue'
import DestinationsWidget from '@/views/dashboards/travel-overview/destinations-widget'
import SocialMediaWidget from '@/views/dashboards/travel-overview/social-media-widget'
import StatisticsCard, { type StatisticsCardProps } from '@/views/dashboards/travel-overview/statistics-card'
import StatisticsCardSvg from '@/views/dashboards/travel-overview/statistics-card-svg'

// Store Imports
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

const statisticsCardData: StatisticsCardProps[] = [
  {
    icon: <TicketCheckIcon />,
    title: 'Total Bookings Value',
    value: '$13.4k',
    trend: 'up',
    changePercentage: '+38%',
    badgeContent: 'Last 6 months',
    iconClassName: 'bg-chart-1/10 text-chart-1'
  },
  {
    icon: <EyeIcon />,
    title: 'Total Package Views',
    value: '155K',
    trend: 'up',
    changePercentage: '+22%',
    badgeContent: 'Last 4 months',
    iconClassName: 'bg-chart-2/10 text-chart-2'
  },
  {
    icon: <DollarSignIcon />,
    title: 'Total Profit',
    value: '$89.34k',
    trend: 'down',
    changePercentage: '-16%',
    badgeContent: 'Last one year',
    iconClassName: 'bg-chart-3/10 text-chart-3'
  },
  {
    icon: <BookMarkedIcon />,
    title: 'Saved Packages',
    value: '$1,200',
    trend: 'up',
    changePercentage: '+38%',
    badgeContent: 'Last 6 months',
    iconClassName: 'bg-chart-4/10 text-chart-4'
  }
]

const TravelOverviewDashboard = () => {
  const tourPackages = useTourPackagesStore(state => state.items)

  return (
    <div className='grid grid-cols-2 gap-6 xl:grid-cols-3'>
      <div className='col-span-2 grid grid-cols-2 gap-6 xl:grid-cols-4'>
        {statisticsCardData.map((card, index) => (
          <StatisticsCard
            key={index}
            icon={card.icon}
            title={card.title}
            value={card.value}
            trend={card.trend}
            changePercentage={card.changePercentage}
            badgeContent={card.badgeContent}
            iconClassName={card.iconClassName}
          />
        ))}
      </div>

      <StatisticsCardSvg
        title='Travelers'
        badgeContent='Daily travelers'
        value='42.4k'
        changePercentage={9.2}
        className='max-xl:col-span-full'
      />

      <ChartWeeklyRevenue className='col-span-2' />

      <BookingFunnelWidget className='justify-between max-sm:col-span-full md:max-lg:col-span-full' />

      <ChartBookingPerformance className='justify-between *:data-[slot=card-content]:space-y-6 max-sm:col-span-full md:max-lg:col-span-full' />

      <SocialMediaWidget className='max-sm:col-span-full md:max-lg:col-span-full' />

      <DestinationsWidget className='justify-between max-sm:col-span-full md:max-lg:col-span-full' />

      <Card className='col-span-full py-0'>
        <TourPackagesDataTable columns={columns} data={tourPackages} />
      </Card>
    </div>
  )
}

export default TravelOverviewDashboard
