// Type Imports
import type { Transaction, TransactionStatus } from '@/types/apps/transaction-types'

// Data Imports
import { db as bookingsDb } from '@/fake-db/account/bookings'
import { db as customersDb } from '@/fake-db/apps/customers'
import { db as invoicesDb } from '@/fake-db/apps/invoices'

// Utils Imports
import { buildChargeTransactionFromBooking } from '@/utils/transaction-utils'

/**
 * ! The data below is used to seed the Transactions store. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can replace this with your
 * ! own database queries inside the server action.
 *
 * ! `src/fake-db/account/bookings.ts` has ~90 records but only cycles through the same 20
 * ! customers (`src/fake-db/apps/customers.ts`) in long contiguous blocks — mapping every booking
 * ! 1:1 would make this ledger show the same handful of names/avatars over and over. Instead we
 * ! curate exactly one representative booking per customer, so every row is a different person.
 * ! `invoicesDb` is then layered on top so this ledger always agrees with that seed file — a
 * ! charge's `invoiceId` here is exactly what `use-invoices-store.ts`'s `linkInvoice` would set at
 * ! runtime. Keep this list and `invoices.ts` in sync if you change it.
 *
 * ! Order deliberately interleaves the 10 invoiced bookings (below, marked "invoiced") with the
 * ! 10 that aren't (marked "pending"/"failed"/"succeeded" — see `STATUS_OVERRIDES`), so both the
 * ! first and second table page show a mix of statuses instead of all-succeeded on page 1. Only
 * ! bookings without an invoice can get a non-'succeeded' status — a charge that's still
 * ! pending/failed can't have already been invoiced. Two of the ten (`booking-078`, `booking-091`)
 * ! are deliberately left at the base 'succeeded' status with no override, so the Create Invoice
 * ! page's "un-invoiced charge" picker (`invoice-create-form.tsx` filters on
 * ! `status === 'succeeded' && !invoiceId`) always has at least one real option to pick from.
 */
const SELECTED_BOOKING_IDS = [
  'booking-001', // Mitchell Johnson — invoiced
  'booking-015', // Sophia Martinez — pending
  'booking-003', // Amelia Carter — invoiced
  'booking-017', // Liam Anderson — failed
  'booking-009', // Noah Williams — invoiced
  'booking-050', // Benjamin Clark — pending
  'booking-021', // Olivia Brown — invoiced
  'booking-057', // Lucas Lewis — failed
  'booking-027', // Ethan Davis — invoiced
  'booking-065', // Amelia Walker — pending
  'booking-033', // Isabella Wilson — invoiced
  'booking-067', // Henry Hall — failed
  'booking-036', // James Taylor — invoiced
  'booking-072', // Evelyn Allen — pending
  'booking-044', // Charlotte Moore — invoiced
  'booking-078', // Alexander Young — succeeded, un-invoiced
  'booking-052', // Mia Rodriguez — invoiced
  'booking-086', // Daniel Wright — failed
  'booking-084', // Harper King — invoiced
  'booking-091' // Avery Scott — succeeded, un-invoiced
]

// The 10 un-invoiced bookings above split 4 pending / 4 failed / 2 succeeded (rather than every
// charge succeeding) for demo variety in the Status column/filter — the 2 left succeeded are the
// ones eligible to show up in the Create Invoice page's transaction picker.
const STATUS_OVERRIDES: Record<string, TransactionStatus> = {
  'booking-015': 'pending', // Sophia Martinez
  'booking-017': 'failed', // Liam Anderson
  'booking-050': 'pending', // Benjamin Clark
  'booking-057': 'failed', // Lucas Lewis
  'booking-065': 'pending', // Amelia Walker
  'booking-067': 'failed', // Henry Hall
  'booking-072': 'pending', // Evelyn Allen
  'booking-086': 'failed' // Daniel Wright
}

const selectedBookings = SELECTED_BOOKING_IDS.map(id => bookingsDb.find(booking => booking.id === id)).filter(
  booking => booking !== undefined
)

export const db: Transaction[] = selectedBookings.map(booking => {
  const base = buildChargeTransactionFromBooking(booking, customersDb)
  const invoice = invoicesDb.find(item => item.bookingId === booking.id)

  return {
    ...base,
    status: STATUS_OVERRIDES[booking.id] ?? base.status,
    invoiceId: invoice?.id
  }
})
