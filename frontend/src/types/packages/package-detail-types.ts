// Type Imports
import type { TourPackage } from '@/types/packages/tour-package-types'

export type HighlightIcon = 'transfer' | 'stay' | 'meals' | 'sightseeing' | 'flight' | 'guide'

export const HIGHLIGHT_ICON_LIST: HighlightIcon[] = ['transfer', 'stay', 'meals', 'sightseeing', 'flight', 'guide']

export interface PackageHighlight {
  icon: HighlightIcon
  label: string
  value: string
}

export interface GalleryImage {
  src: string
  alt: string
  className?: string
}

export interface ItineraryDay {
  day: number
  title: string
  summary: string
  activities: string[]
}

export interface PolicySection {
  title: string
  points: string[]
}

export interface PackageTestimonial {
  id: string
  name: string
  role: string
  company: string
  avatar: string
  rating: number
  content: string
}

export interface PackageDetail extends TourPackage {
  gallery: GalleryImage[]
  highlights: PackageHighlight[]
  tripInformation: string
  itinerary: ItineraryDay[]
  includedServices: string[]
  excludedServices: string[]
  importantInfo: PolicySection[]
  confirmationPolicy: string[]
  refundPolicy: string[]
  cancellationPolicy: string[]
  paymentPolicy: string[]
  testimonials: PackageTestimonial[]
  originalPrice?: number
}
