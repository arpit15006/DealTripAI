// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { CreateTourPackageInput, TourPackage } from '@/types/packages/tour-package-types'

// Data Imports
import { db } from '@/fake-db/packages/tour-packages'

// Utils Imports
import { slugify } from '@/utils/slugify'

type TourPackagesData = {
  items: TourPackage[]
}

type TourPackagesActions = {
  addPackage: (input: CreateTourPackageInput) => string
  updatePackage: (id: string, input: CreateTourPackageInput) => void
  deletePackage: (id: string) => void
  togglePublish: (id: string) => void
  reassignPackagesToDestination: (packageIds: string[], destinationKey: string) => void
}

export type TourPackagesStore = TourPackagesData & TourPackagesActions

export const useTourPackagesStore = create<TourPackagesStore>()((set, get) => ({
  items: db,

  addPackage: input => {
    const id = crypto.randomUUID()

    const newPackage: TourPackage = {
      ...input,
      id,
      slug: slugify(input.title),
      rating: 0,
      reviewCount: 0
    }

    set(state => ({ items: [newPackage, ...state.items] }))

    return id
  },

  updatePackage: (id, input) =>
    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, ...input, slug: slugify(input.title) } : item))
    })),

  deletePackage: id => set(state => ({ items: state.items.filter(item => item.id !== id) })),

  togglePublish: id => {
    const target = get().items.find(item => item.id === id)

    if (!target) return

    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, isPublished: item.isPublished === false } : item))
    }))
  },

  reassignPackagesToDestination: (packageIds, destinationKey) => {
    if (packageIds.length === 0) return

    const idSet = new Set(packageIds)

    set(state => ({
      items: state.items.map(item => (idSet.has(item.id) ? { ...item, country: destinationKey } : item))
    }))
  }
}))
