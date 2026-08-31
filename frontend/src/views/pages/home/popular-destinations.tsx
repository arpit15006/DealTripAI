'use client'

// Next Imports
import Link from 'next/link'

// Type Imports
import type { DestinationRegion, PopularDestination } from '@/types/pages/home-types'
import { DESTINATION_REGION_LABELS, DESTINATION_REGION_LIST } from '@/types/pages/home-types'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TextFlip from '@/components/ui/text-flip'
import { Badge } from '@/components/ui/badge'

type PopularDestinationsProps = {
  popularDestinations: PopularDestination[]
}

const DestinationGrid = ({ destinations }: { destinations: PopularDestination[] }) => {
  return (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {destinations.map(destination => (
        <Link key={destination.id} href={`/tour-packages?location=${encodeURIComponent(destination.country)}`}>
          <Card className='overflow-hidden pt-0'>
            <CardContent className='px-0'>
              <img src={destination.image} alt={destination.name} className='h-40 w-full object-cover' />
            </CardContent>
            <CardContent className='flex items-start justify-between gap-1'>
              <div>
                <h3 className='text-lg font-semibold'>{destination.name}</h3>
                <p className='text-muted-foreground text-base'>{destination.country}</p>
              </div>
              <TextFlip
                words={[
                  `${destination.packageCount} packages`,
                  `from ${destination.currency} ${destination.startingPrice}`
                ]}
                duration={3000}
              />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

const PopularDestinations = ({ popularDestinations }: PopularDestinationsProps) => {
  return (
    <section className='bg-muted py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-360 px-4 sm:px-6 lg:px-8'>
        <div className='mb-12 space-y-4 text-center sm:mb-16 lg:mb-24'>
          <Badge className='h-auto text-sm font-normal' variant='outline'>
            Favorites
          </Badge>
          <h2 className='text-3xl font-bold'>Popular Destinations</h2>
          <p className='text-muted-foreground'>Explore top-rated destinations loved by travelers around the world.</p>
        </div>
        <Tabs defaultValue='all' className='gap-4'>
          <TabsList className='bg-card'>
            <TabsTrigger className='data-active:bg-muted' value='all'>
              All
            </TabsTrigger>
            {DESTINATION_REGION_LIST.map(region => (
              <TabsTrigger className='data-active:bg-muted' key={region} value={region}>
                {DESTINATION_REGION_LABELS[region]}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value='all'>
            <DestinationGrid destinations={popularDestinations} />
          </TabsContent>
          {DESTINATION_REGION_LIST.map((region: DestinationRegion) => (
            <TabsContent key={region} value={region}>
              <DestinationGrid
                destinations={popularDestinations.filter(destination => destination.region === region)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}

export default PopularDestinations
