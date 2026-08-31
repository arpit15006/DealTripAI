// Type Imports
import type { BookingStatus, TrackingStage } from '@/types/account/booking-types'

export const BOOKING_STATUS_BADGE_VARIANT: Record<BookingStatus, 'outline' | 'destructive'> = {
  upcoming: 'outline',
  completed: 'outline',
  cancelled: 'destructive'
}

export const BOOKING_STATUS_BADGE_CLASSNAME: Record<BookingStatus, string> = {
  upcoming: 'border-primary/20 bg-primary/10 text-primary',
  completed: '',
  cancelled: ''
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

export type PaymentStatus = 'paid' | 'unpaid' | 'cancelled'

export const derivePaymentStatus = (status: BookingStatus): PaymentStatus =>
  status === 'cancelled' ? 'cancelled' : 'paid'

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  cancelled: 'Cancelled'
}

export const PAYMENT_STATUS_CLASSNAME: Record<PaymentStatus, string> = {
  paid: 'border-green-600/20 bg-green-600/10 text-green-600 dark:border-green-600/40 dark:bg-green-600/20',
  unpaid: 'border-amber-600/20 bg-amber-600/10 text-amber-600 dark:border-amber-600/40 dark:bg-amber-600/20',
  cancelled: ''
}

export const DEFAULT_CONTACT_AVATAR = '/images/avatars/avatar-1.webp'

export const getCountryFromLocation = (location: string): string => location.split(',').pop()?.trim() ?? location

export const deriveTrackingStage = (status: BookingStatus): TrackingStage | null => {
  if (status === 'cancelled') return null

  return 'pre-trip-meeting'
}
