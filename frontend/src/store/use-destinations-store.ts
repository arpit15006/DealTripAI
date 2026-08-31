// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { CreateDestinationInput, Destination } from '@/types/packages/destination-types'

// Data Imports
import { db } from '@/fake-db/packages/destinations'

// Store Imports
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

// Utils Imports
import { slugify } from '@/utils/slugify'

type DestinationsData = {
  items: Destination[]
}

type DestinationsActions = {
  createDestination: (input: CreateDestinationInput) => Destination
  deleteDestination: (id: string) => void
}

export type DestinationsStore = DestinationsData & DestinationsActions

export const useDestinationsStore = create<DestinationsStore>()((set, get) => ({
  items: db,

  createDestination: input => {
    const { items } = get()
    const baseKey = slugify(input.name)
    let key = baseKey
    let suffix = 2

    while (items.some(destination => destination.key === key)) {
      key = `${baseKey}-${suffix}`
      suffix += 1
    }

    const newDestination: Destination = {
      id: crypto.randomUUID(),
      key,
      name: input.name
    }

    set(state => ({ items: [...state.items, newDestination] }))

    if (input.assignPackageIds?.length) {
      useTourPackagesStore.getState().reassignPackagesToDestination(input.assignPackageIds, key)
    }

    return newDestination
  },

  deleteDestination: id => set(state => ({ items: state.items.filter(destination => destination.id !== id) }))
}))
