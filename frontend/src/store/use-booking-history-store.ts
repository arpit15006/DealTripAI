// Third-party Imports
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface BookingHistoryState {
  counts: Record<string, number>
  incrementBookingCount: (packageSlug: string) => void
}

export const useBookingHistoryStore = create<BookingHistoryState>()(
  persist(
    set => ({
      counts: {},

      incrementBookingCount: packageSlug =>
        set(state => ({
          counts: { ...state.counts, [packageSlug]: (state.counts[packageSlug] ?? 0) + 1 }
        }))
    }),
    {
      name: 'booking-history',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)
