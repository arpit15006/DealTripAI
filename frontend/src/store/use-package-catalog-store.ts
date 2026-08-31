// Third-party Imports
import { create } from 'zustand'

export type PackageCatalogTypeFilter = 'all' | 'regular' | 'premium'
export type PackageCatalogStatusFilter = 'all' | 'published' | 'draft'

type PackageCatalogData = {
  search: string
  priceRange: [number, number] | null
  packageType: PackageCatalogTypeFilter
  status: PackageCatalogStatusFilter
  currentPage: number
}

type PackageCatalogActions = {
  setSearch: (search: string) => void
  setPriceRange: (range: [number, number] | null) => void
  setPackageType: (packageType: PackageCatalogTypeFilter) => void
  setStatus: (status: PackageCatalogStatusFilter) => void
  setCurrentPage: (page: number) => void
  resetFilters: () => void
}

export type PackageCatalogStore = PackageCatalogData & PackageCatalogActions

const DEFAULT_FILTERS: PackageCatalogData = {
  search: '',
  priceRange: null,
  packageType: 'all',
  status: 'all',
  currentPage: 1
}

export const usePackageCatalogStore = create<PackageCatalogStore>()(set => ({
  ...DEFAULT_FILTERS,

  setSearch: search => set({ search, currentPage: 1 }),
  setPriceRange: priceRange => set({ priceRange, currentPage: 1 }),
  setPackageType: packageType => set({ packageType, currentPage: 1 }),
  setStatus: status => set({ status, currentPage: 1 }),
  setCurrentPage: currentPage => set({ currentPage }),
  resetFilters: () => set(DEFAULT_FILTERS)
}))
