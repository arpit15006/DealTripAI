// Type Imports
import type { PaymentResult, TravelerInfo } from '@/types/packages/checkout-types'

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled'

export const BOOKING_STATUS_LIST: BookingStatus[] = ['upcoming', 'completed', 'cancelled']

export type TrackingStage =
  | 'package-selection'
  | 'travelers-information'
  | 'payment'
  | 'confirm-booking'
  | 'pre-trip-meeting'

export const TRACKING_STAGE_LIST: TrackingStage[] = [
  'package-selection',
  'travelers-information',
  'payment',
  'confirm-booking',
  'pre-trip-meeting'
]

export const TRACKING_STAGE_LABELS: Record<TrackingStage, string> = {
  'package-selection': 'Package Selection',
  'travelers-information': 'Travelers Information',
  payment: 'Payment',
  'confirm-booking': 'Booking Confirmed',
  'pre-trip-meeting': 'Pre-Trip Meeting'
}

export const TRACKING_STAGE_DESCRIPTIONS: Record<TrackingStage, string> = {
  'package-selection': 'You picked your tour package and travel date',
  'travelers-information': 'Contact and traveler details were submitted',
  payment: 'Payment was processed successfully',
  'confirm-booking': 'Your booking was confirmed and a reference was issued',
  'pre-trip-meeting': 'Our travel expert will reach out to finalize details before you depart'
}

export interface Booking {
  id: string
  packageSlug: string
  packageTitle: string
  packageImage: string
  packageLocation: string
  packageDays: number
  packageNights: number
  travelers: number
  travelDate: string
  bookingRef: string
  totalAmount: number
  paymentResult: PaymentResult
  bookedAt: string
  status: BookingStatus
  contactName: string
  contactEmail: string
  contactPhone?: string
  contactAvatar?: string
  travelersInfo?: TravelerInfo[]
  couponCode?: string
  discountAmount?: number
  baseAmount?: number
  notes?: string
}

export type AddBookingInput = Omit<Booking, 'id' | 'status'>
