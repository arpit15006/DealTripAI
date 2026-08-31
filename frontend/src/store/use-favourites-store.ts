// Third-party Imports
import { create } from 'zustand'

interface FavouritesState {
  slugs: string[]
  isFavourite: (slug: string) => boolean
  toggleFavourite: (slug: string) => void
}

export const useFavouritesStore = create<FavouritesState>()((set, get) => ({
  slugs: [],

  isFavourite: slug => get().slugs.includes(slug),

  toggleFavourite: slug =>
    set(state => ({
      slugs: state.slugs.includes(slug) ? state.slugs.filter(s => s !== slug) : [...state.slugs, slug]
    }))
}))
