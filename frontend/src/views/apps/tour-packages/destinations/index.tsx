'use client'

// React Imports
import { useMemo } from 'react'

// Component Imports
import { Card } from '@/components/ui/card'
import AddDestinationDialog from '@/views/apps/tour-packages/destinations/add-destination-dialog'
import { columns } from '@/views/apps/tour-packages/destinations/columns'
import { DestinationsDataTable } from '@/views/apps/tour-packages/destinations/data-table'

// Store Imports
import { useDestinationsStore } from '@/store/use-destinations-store'
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

// Type Imports
import type { DestinationTableRow } from '@/views/apps/tour-packages/destinations/columns'

const DestinationsView = () => {
  const destinations = useDestinationsStore(state => state.items)
  const items = useTourPackagesStore(state => state.items)

  const rows = useMemo<DestinationTableRow[]>(() => {
    return destinations.map(destination => {
      const packages = items.filter(item => item.country === destination.key)
      const publishedCount = packages.filter(item => item.isPublished !== false).length
      const prices = packages.map(item => item.price)

      return {
        ...destination,
        packageCount: packages.length,
        publishedCount,
        minPrice: prices.length ? Math.min(...prices) : null,
        maxPrice: prices.length ? Math.max(...prices) : null
      }
    })
  }, [destinations, items])

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Destinations</h1>
        <p className='text-muted-foreground text-sm'>Manage countries/destinations packages can be assigned to.</p>
      </div>

      <Card className='w-full gap-0 py-0'>
        <DestinationsDataTable
          columns={columns}
          data={rows}
          toolbarAction={<AddDestinationDialog packages={items} />}
        />
      </Card>
    </div>
  )
}

export default DestinationsView
