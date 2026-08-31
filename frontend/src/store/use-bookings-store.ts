// Third-party Imports
import { create } from 'zustand'

// Type Imports
import type { AddBookingInput, Booking } from '@/types/account/booking-types'

// Data Imports
import { db } from '@/fake-db/account/bookings'

export type UpdateBookingInput = Partial<Omit<Booking, 'id'>>
export type UpsertBookingInput = Omit<Booking, 'id'>

interface BookingsState {
  bookings: Booking[]

  sessionBookingIds: string[]
  addBooking: (input: AddBookingInput) => string
  updateBooking: (id: string, input: UpdateBookingInput) => void

  upsertBooking: (id: string, input: UpsertBookingInput) => void
  cancelBooking: (id: string) => void
}

export const useBookingsStore = create<BookingsState>()(set => ({
  bookings: db,
  sessionBookingIds: [],

  addBooking: input => {
    const id = crypto.randomUUID()

    set(state => ({
      bookings: [{ ...input, id, status: 'upcoming' }, ...state.bookings],
      sessionBookingIds: [...state.sessionBookingIds, id]
    }))

    return id
  },

  updateBooking: (id, input) =>
    set(state => ({
      bookings: state.bookings.map(booking => (booking.id === id ? { ...booking, ...input } : booking))
    })),

  upsertBooking: (id, input) =>
    set(state => {
      const exists = state.bookings.some(booking => booking.id === id)

      if (exists) {
        return {
          bookings: state.bookings.map(booking => (booking.id === id ? { ...booking, ...input } : booking))
        }
      }

      return { bookings: [{ ...input, id }, ...state.bookings] }
    }),

  cancelBooking: id =>
    set(state => ({
      bookings: state.bookings.map(booking => (booking.id === id ? { ...booking, status: 'cancelled' } : booking))
    }))
}))
