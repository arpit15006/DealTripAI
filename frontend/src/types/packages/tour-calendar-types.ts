// Type Imports
import type { TourPackageCategory } from '@/types/packages/tour-package-types'

export type TourCalendarView = 'month' | 'agenda'

export interface TourCalendarEvent {
  id: string
  bookingId: string
  packageId: string
  bookingRef: string
  title: string
  location: string
  image: string
  category: TourPackageCategory
  contactName: string
  travelers: number
  totalAmount: number
  start: Date
  end: Date
}
