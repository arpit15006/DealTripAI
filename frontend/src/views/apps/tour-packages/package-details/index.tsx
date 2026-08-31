'use client'

// React Imports
import { useEffect, useMemo } from 'react'

// Component Imports
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import PackageCatalogFilters from './package-catalog-filters'
import PackageCatalogGrid from './package-catalog-grid'

// Store Imports
import { usePackageCatalogStore } from '@/store/use-package-catalog-store'
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

// Utils Imports
import { cn } from '@/lib/utils'
import { filterCatalogPackages, getPackagePriceBounds } from '@/utils/tour-package-catalog-utils'
import { getPaginationRange } from '@/utils/pagination-utils'

const PAGE_SIZE = 6

type PackageDetailsViewProps = {
  packageId?: string
}

const PackageDetailsView = ({ packageId }: PackageDetailsViewProps) => {
  const items = useTourPackagesStore(state => state.items)

  const search = usePackageCatalogStore(state => state.search)
  const priceRange = usePackageCatalogStore(state => state.priceRange)
  const packageType = usePackageCatalogStore(state => state.packageType)
  const status = usePackageCatalogStore(state => state.status)
  const currentPage = usePackageCatalogStore(state => state.currentPage)
  const setCurrentPage = usePackageCatalogStore(state => state.setCurrentPage)
  const setSearch = usePackageCatalogStore(state => state.setSearch)
  const resetFilters = usePackageCatalogStore(state => state.resetFilters)

  useEffect(() => {
    if (!packageId) {
      resetFilters()

      return
    }

    const match = items.find(item => item.id === packageId)

    if (!match) return

    resetFilters()
    setSearch(match.title)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reseed filters when the target package id changes
  }, [packageId])

  const priceBounds = useMemo(() => getPackagePriceBounds(items), [items])

  const filteredPackages = useMemo(
    () => filterCatalogPackages(items, { search, priceRange, packageType, status }),
    [items, search, priceRange, packageType, status]
  )

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / PAGE_SIZE))
  const currentPageClamped = Math.min(currentPage, totalPages)
  const paginationRange = getPaginationRange(currentPageClamped, totalPages)

  const paginatedPackages = useMemo(() => {
    const start = (currentPageClamped - 1) * PAGE_SIZE

    return filteredPackages.slice(start, start + PAGE_SIZE)
  }, [filteredPackages, currentPageClamped])

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Package Details</h1>
        <p className='text-muted-foreground text-sm'>Browse, filter, and manage every tour package.</p>
      </div>

      <PackageCatalogFilters priceBounds={priceBounds} />

      <PackageCatalogGrid
        packages={paginatedPackages}
        filteredCount={filteredPackages.length}
        totalCount={items.length}
      />

      {filteredPackages.length > 0 && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                aria-disabled={currentPageClamped === 1}
                className={cn(currentPageClamped === 1 && 'pointer-events-none opacity-50')}
                onClick={() => setCurrentPage(Math.max(1, currentPageClamped - 1))}
              />
            </PaginationItem>
            {paginationRange.map((page, index) =>
              page === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink isActive={page === currentPageClamped} onClick={() => setCurrentPage(page)}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                aria-disabled={currentPageClamped === totalPages}
                className={cn(currentPageClamped === totalPages && 'pointer-events-none opacity-50')}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPageClamped + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default PackageDetailsView
