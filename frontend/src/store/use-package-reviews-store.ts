// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { PackageTestimonial } from '@/types/packages/package-detail-types'

interface PackageReviewsState {
  reviewsBySlug: Record<string, PackageTestimonial[]>
  addReview: (slug: string, review: PackageTestimonial) => void
}

export const usePackageReviewsStore = create<PackageReviewsState>()(set => ({
  reviewsBySlug: {},

  addReview: (slug, review) =>
    set(state => ({
      reviewsBySlug: {
        ...state.reviewsBySlug,
        [slug]: [review, ...(state.reviewsBySlug[slug] ?? [])]
      }
    }))
}))
