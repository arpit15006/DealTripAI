'use client'

// React Imports
import { useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Third-party Imports
import { MapPinIcon, XIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { columns } from '@/views/apps/tour-packages/columns'
import { TourPackagesDataTable } from '@/views/apps/tour-packages/data-table'
import PackageStats from '@/views/apps/tour-packages/package-stats'

// Store Imports
import { useDestinationsStore } from '@/store/use-destinations-store'
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

const TourPackagesView = () => {
  const items = useTourPackagesStore(state => state.items)
  const destinations = useDestinationsStore(state => state.items)
  const searchParams = useSearchParams()

  const country = searchParams.get('country') ?? undefined

  const activeDestination = useMemo(
    () => (country ? destinations.find(destination => destination.key === country) : undefined),
    [destinations, country]
  )

  const filteredItems = useMemo(
    () => (country ? items.filter(item => item.country === country) : items),
    [items, country]
  )

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Tour Packages</h1>
        <p className='text-muted-foreground text-sm'>Manage and publish tour packages to the public site.</p>
      </div>

      {activeDestination && (
        <div className='bg-muted/40 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm'>
          <MapPinIcon className='text-muted-foreground size-4' />
          <span>
            Showing packages for <span className='font-medium'>{activeDestination.name}</span>
          </span>
          <Button
            variant='ghost'
            size='sm'
            className='ml-auto'
            render={<Link href='/dashboard/tour-packages' />}
            nativeButton={false}
          >
            <XIcon className='size-3.5' />
            Clear
          </Button>
        </div>
      )}

      <PackageStats items={filteredItems} />
      <Card className='w-full gap-0 py-0'>
        <TourPackagesDataTable columns={columns} data={filteredItems} />
      </Card>
    </div>
  )
}

export default TourPackagesView
