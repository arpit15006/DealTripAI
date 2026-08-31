// Type Imports
import type { PackageCatalogStatusFilter, PackageCatalogTypeFilter } from '@/store/use-package-catalog-store'
import type { TourPackage } from '@/types/packages/tour-package-types'

export type PackageCatalogFilters = {
  search: string
  priceRange: [number, number] | null
  packageType: PackageCatalogTypeFilter
  status: PackageCatalogStatusFilter
}

export const getPackagePriceBounds = (items: TourPackage[]): [number, number] => {
  if (items.length === 0) return [0, 0]

  const prices = items.map(item => item.price)

  return [Math.min(...prices), Math.max(...prices)]
}

export const filterCatalogPackages = (items: TourPackage[], filters: PackageCatalogFilters): TourPackage[] =>
  items.filter(item => {
    if (filters.search.trim() && !item.title.toLowerCase().includes(filters.search.trim().toLowerCase())) {
      return false
    }

    if (filters.priceRange && (item.price < filters.priceRange[0] || item.price > filters.priceRange[1])) {
      return false
    }

    if (filters.packageType !== 'all' && item.packageType !== filters.packageType) {
      return false
    }

    const isPublished = item.isPublished !== false

    if (filters.status === 'published' && !isPublished) return false
    if (filters.status === 'draft' && isPublished) return false

    return true
  })
