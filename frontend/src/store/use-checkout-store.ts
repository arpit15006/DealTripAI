// Third-party Imports
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Type Imports
import type { BookingContactInfo, CheckoutStep, PaymentResult, TravelerInfo } from '@/types/packages/checkout-types'

// Store Imports
import { useBookingHistoryStore } from '@/store/use-booking-history-store'

interface CheckoutState {
  packageSlug: string | null
  step: CheckoutStep
  contactInfo: BookingContactInfo | null
  travelersInfo: TravelerInfo[] | null
  promoDiscount: number
  bookingRef: string | null
  paymentResult: PaymentResult | null
  bookedAt: string | null
  initializeForPackage: (packageSlug: string) => void
  startNewCheckout: (packageSlug: string) => void
  setPromoDiscount: (discount: number) => void
  completeInfoStep: (info: BookingContactInfo, travelersInfo: TravelerInfo[], discount: number) => void
  completePaymentStep: (bookingRef: string, result: PaymentResult, bookedAtIso: string) => void
}

const DEFAULT_PROGRESS = {
  step: 'enter-info' as CheckoutStep,
  contactInfo: null,
  travelersInfo: null,
  promoDiscount: 0,
  bookingRef: null,
  paymentResult: null,
  bookedAt: null
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      packageSlug: null,
      ...DEFAULT_PROGRESS,

      initializeForPackage: packageSlug => {
        const state = get()

        if (state.packageSlug !== packageSlug) {
          set({ packageSlug, ...DEFAULT_PROGRESS })

          return
        }

        const isPaymentDataIncomplete = state.step === 'payment' && (!state.contactInfo || !state.travelersInfo)

        const isConfirmationDataIncomplete =
          state.step === 'confirmation' &&
          (!state.contactInfo || !state.travelersInfo || !state.bookingRef || !state.paymentResult || !state.bookedAt)

        if (isPaymentDataIncomplete || isConfirmationDataIncomplete) {
          set({ packageSlug, ...DEFAULT_PROGRESS })
        }
      },

      startNewCheckout: packageSlug => set({ packageSlug, ...DEFAULT_PROGRESS }),

      setPromoDiscount: discount => set({ promoDiscount: discount }),

      completeInfoStep: (info, travelersInfo, discount) =>
        set({ contactInfo: info, travelersInfo, promoDiscount: discount, step: 'payment' }),

      completePaymentStep: (bookingRef, result, bookedAtIso) => {
        const { packageSlug } = get()

        if (packageSlug) {
          useBookingHistoryStore.getState().incrementBookingCount(packageSlug)
        }

        set({ bookingRef, paymentResult: result, bookedAt: bookedAtIso, step: 'confirmation' })
      }
    }),
    {
      name: 'checkout-progress',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
