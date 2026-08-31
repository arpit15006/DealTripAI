// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { Review, ReviewStatus } from '@/types/settings/reviews-types'

// Data Imports
import { db } from '@/fake-db/settings/reviews'

interface ReviewsState {
  items: Review[]
  setReviewStatus: (id: string, status: ReviewStatus) => void
  deleteReview: (id: string) => void
}

export const useReviewsStore = create<ReviewsState>()(set => ({
  items: db,

  setReviewStatus: (id, status) =>
    set(state => ({
      items: state.items.map(item => (item.id === id ? { ...item, status } : item))
    })),

  deleteReview: id => set(state => ({ items: state.items.filter(item => item.id !== id) }))
}))
