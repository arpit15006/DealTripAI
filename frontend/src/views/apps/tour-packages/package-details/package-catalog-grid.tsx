// Third-party Imports
import { PackageSearchIcon } from 'lucide-react'

// Type Imports
import type { TourPackage } from '@/types/packages/tour-package-types'

// Component Imports
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import PackageCatalogCard from './package-catalog-card'

type PackageCatalogGridProps = {
  packages: TourPackage[]
  filteredCount: number
  totalCount: number
}

const PackageCatalogGrid = ({ packages, filteredCount, totalCount }: PackageCatalogGridProps) => {
  return (
    <div className='flex flex-col gap-4'>
      <p className='text-muted-foreground text-sm'>
        Showing {filteredCount} of {totalCount} packages
      </p>

      {packages.length === 0 ? (
        <Empty className='rounded-lg border border-dashed py-16'>
          <EmptyHeader>
            <EmptyMedia variant='icon' className='size-12'>
              <PackageSearchIcon className='size-7' />
            </EmptyMedia>
            <EmptyTitle className='text-base'>No packages found</EmptyTitle>
            <EmptyDescription>Try adjusting your filters to find what you are looking for.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='flex flex-col gap-4'>
          {packages.map(tourPackage => (
            <PackageCatalogCard key={tourPackage.id} tourPackage={tourPackage} />
          ))}
        </div>
      )}
    </div>
  )
}

export default PackageCatalogGrid
