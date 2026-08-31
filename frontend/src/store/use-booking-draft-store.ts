// Third-party Imports
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Type Imports
import type { BookingContactInfo } from '@/types/packages/checkout-types'

interface BookingDraftState {
  packageSlug: string | null
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests: string
  travelDate: string
  travelers: number
  setBookingDraft: (input: {
    packageSlug: string
    firstName: string
    lastName: string
    email: string
    phone: string
    specialRequests?: string
    travelDate: string
    travelers: number
  }) => void
  updateContactInfo: (info: BookingContactInfo) => void
}

const DEFAULT_STATE = {
  packageSlug: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialRequests: '',
  travelDate: '',
  travelers: 1
}

export const useBookingDraftStore = create<BookingDraftState>()(
  persist(
    set => ({
      ...DEFAULT_STATE,

      setBookingDraft: input =>
        set({
          packageSlug: input.packageSlug,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          specialRequests: input.specialRequests ?? '',
          travelDate: input.travelDate,
          travelers: input.travelers
        }),

      updateContactInfo: info =>
        set({
          firstName: info.firstName,
          lastName: info.lastName,
          email: info.email,
          phone: info.phone
        })
    }),
    {
      name: 'booking-draft',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
