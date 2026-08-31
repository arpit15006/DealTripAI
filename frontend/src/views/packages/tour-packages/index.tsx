'use client'

// React Imports
import { useMemo, useState } from 'react'

// Third-party Imports
import { motion } from 'motion/react'

// Type Imports
import type { Destination } from '@/types/packages/destination-types'
import type { TourPackage, TourPackageCategory } from '@/types/packages/tour-package-types'

// Component Imports
import { Card } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import FilterSidebar, {
  DURATION_RANGES,
  type PackageTypeFilter,
  RATING_MAX,
  RATING_MIN
} from '@/views/packages/tour-packages/filter-sidebar'
import TourPackagesToolbar, {
  SORT_OPTIONS,
  type TourPackageSortOption,
  type ViewMode
} from '@/views/packages/tour-packages/toolbar'
import TourPackageCard from '@/views/packages/tour-package-card'

// Store Imports
import { useDestinationsStore } from '@/store/use-destinations-store'
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

// Utils Imports
import { cn } from '@/lib/utils'
import { getPaginationRange } from '@/utils/pagination-utils'

type TourPackagesViewProps = {
  tourPackages: TourPackage[]
  destinations: Destination[]
  initialLocations?: string[]
  initialCategories?: TourPackageCategory[]
}

const PAGE_SIZE = 12

const TourPackagesView = ({
  tourPackages: initialTourPackages,
  destinations: initialDestinations,
  initialLocations,
  initialCategories
}: TourPackagesViewProps) => {
  const storeItems = useTourPackagesStore(state => state.items)
  const storeDestinations = useDestinationsStore(state => state.items)

  const tourPackages =
    storeItems.length > 0 ? storeItems.filter(item => item.isPublished !== false) : initialTourPackages

  const destinations = storeDestinations.length > 0 ? storeDestinations : initialDestinations

  const destinationNameByKey = Object.fromEntries(destinations.map(destination => [destination.key, destination.name]))

  const packagePrices = tourPackages.map(tourPackage => tourPackage.price)
  const priceBounds = { min: Math.min(...packagePrices), max: Math.max(...packagePrices) }

  const locations = destinations.map(destination => destination.name).sort()

  const [search, setSearch] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => initialLocations ?? [])
  const [packageType, setPackageType] = useState<PackageTypeFilter>('all')
  const [ratingRange, setRatingRange] = useState<[number, number]>([RATING_MIN, RATING_MAX])
  const [priceRange, setPriceRange] = useState<[number, number]>([priceBounds.min, priceBounds.max])
  const [durationRangeId, setDurationRangeId] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<TourPackageCategory[]>(() => initialCategories ?? [])
  const [sortBy, setSortBy] = useState<TourPackageSortOption>(SORT_OPTIONS[0].value)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filteredPackages = useMemo(() => {
    const durationRange = DURATION_RANGES.find(range => range.id === durationRangeId)

    const filtered = tourPackages.filter(tourPackage => {
      const matchesSearch = `${tourPackage.title} ${tourPackage.location} ${tourPackage.category}`
        .toLowerCase()
        .includes(search.toLowerCase())

      const packageCountry = destinationNameByKey[tourPackage.country]
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(packageCountry)
      const matchesPackageType = packageType === 'all' || tourPackage.packageType === 'premium'

      const matchesRating =
        tourPackage.reviewCount === 0 || (tourPackage.rating >= ratingRange[0] && tourPackage.rating <= ratingRange[1])

      const matchesPrice = tourPackage.price >= priceRange[0] && tourPackage.price <= priceRange[1]

      const matchesDuration =
        !durationRange ||
        (tourPackage.days >= durationRange.min && (durationRange.max === null || tourPackage.days <= durationRange.max))

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(tourPackage.category)

      return (
        matchesSearch &&
        matchesLocation &&
        matchesPackageType &&
        matchesRating &&
        matchesPrice &&
        matchesDuration &&
        matchesCategory
      )
    })

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'rating-desc':
          return b.rating - a.rating
        case 'duration-asc':
          return a.days - b.days
        default:
          return 0
      }
    })
  }, [
    tourPackages,
    destinationNameByKey,
    search,
    selectedLocations,
    packageType,
    ratingRange,
    priceRange,
    durationRangeId,
    selectedCategories,
    sortBy
  ])

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / PAGE_SIZE))
  const currentPageClamped = Math.min(currentPage, totalPages)
  const paginationRange = getPaginationRange(currentPageClamped, totalPages)

  const paginatedPackages = useMemo(() => {
    const start = (currentPageClamped - 1) * PAGE_SIZE

    return filteredPackages.slice(start, start + PAGE_SIZE)
  }, [filteredPackages, currentPageClamped])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleLocationsChange = (value: string[]) => {
    setSelectedLocations(value)
    setCurrentPage(1)
  }

  const handlePackageTypeChange = (value: PackageTypeFilter) => {
    setPackageType(value)
    setCurrentPage(1)
  }

  const handleRatingRangeChange = (value: [number, number]) => {
    setRatingRange(value)
    setCurrentPage(1)
  }

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value)
    setCurrentPage(1)
  }

  const handleDurationRangeChange = (id: string | null) => {
    setDurationRangeId(id)
    setCurrentPage(1)
  }

  const handleCategoryToggle = (category: TourPackageCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(item => item !== category) : [...prev, category]
    )
    setCurrentPage(1)
  }

  const handleSortChange = (value: TourPackageSortOption) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSearch('')
    setSelectedLocations([])
    setPackageType('all')
    setRatingRange([RATING_MIN, RATING_MAX])
    setPriceRange([priceBounds.min, priceBounds.max])
    setDurationRangeId(null)
    setSelectedCategories([])
    setCurrentPage(1)
  }

  const filterSidebarProps = {
    locations,
    selectedLocations,
    onLocationsChange: handleLocationsChange,
    packageType,
    onPackageTypeChange: handlePackageTypeChange,
    ratingRange,
    onRatingRangeChange: handleRatingRangeChange,
    priceBounds,
    priceRange,
    onPriceRangeChange: handlePriceRangeChange,
    durationRangeId,
    onDurationRangeChange: handleDurationRangeChange,
    selectedCategories,
    onCategoryToggle: handleCategoryToggle,
    onReset: handleReset
  }

  return (
    <section className='py-8'>
      <div className='mx-auto flex max-w-360 flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-start lg:px-8'>
        <aside className='sticky top-34 hidden w-80 shrink-0 lg:block'>
          <Card className='shadow-none'>
            <FilterSidebar {...filterSidebarProps} />
          </Card>
        </aside>
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side='left' className='overflow-y-auto pb-6 [--card-spacing:--spacing(6)]'>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <FilterSidebar {...filterSidebarProps} />
          </SheetContent>
        </Sheet>
        <div className='flex flex-1 flex-col gap-6'>
          <TourPackagesToolbar
            search={search}
            onSearchChange={handleSearchChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onOpenFilters={() => setMobileFiltersOpen(true)}
          />
          {paginatedPackages.length > 0 ? (
            <div className={cn('grid gap-6', viewMode === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
              {paginatedPackages.map(tourPackage => (
                <motion.div key={tourPackage.id} layout='position' transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <TourPackageCard tourPackage={tourPackage} viewMode={viewMode} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center'>
              <p className='font-medium'>No tour packages found</p>
              <p className='text-muted-foreground text-sm'>Try adjusting your filters or search terms.</p>
            </div>
          )}
          {filteredPackages.length > 0 && totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={currentPageClamped === 1}
                    className={cn(currentPageClamped === 1 && 'pointer-events-none opacity-50')}
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
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
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </section>
  )
}

export default TourPackagesView
