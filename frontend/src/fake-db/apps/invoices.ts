// Type Imports
import type { Invoice } from '@/types/apps/invoice-types'

/**
 * ! The data below is used to seed the Invoices store. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can replace this with your
 * ! own database queries inside the server action.
 *
 * ! Sourced from the same curated, one-booking-per-customer pool as
 * ! `src/fake-db/apps/transactions.ts` (see that file's `SELECTED_BOOKING_IDS`) — every
 * ! `bookingId`/`transactionId` here must be one of those 20 ids. Only a subset is invoiced on
 * ! purpose, so the Create Invoice transaction picker (which only lists un-invoiced charges)
 * ! isn't empty out of the box. Keep the two files in sync if you edit this.
 */
export const db: Invoice[] = [
  {
    id: 'invoice-001',
    invoiceNumber: 'INV-2026-0001',
    bookingId: 'booking-001',
    transactionId: 'txn-booking-001',
    customerId: 'customer-001',
    status: 'paid',
    issueDate: '2026-06-02',
    dueDate: '2026-06-16',
    billTo: { name: 'Mitchell Johnson', email: 'mitchell11@gmail.com', phone: '+1 (555) 204-7788' },
    travel: {
      packageTitle: 'Bali Island Escape',
      packageLocation: 'Bali, Indonesia',
      packageDays: 6,
      packageNights: 5,
      travelDate: '2026-08-15',
      travelers: 2,
      bookingRef: 'TRV-DEM01-A1B2'
    },
    travelersInfo: [
      {
        firstName: 'Mitchell',
        lastName: 'Johnson',
        email: 'mitchell11@gmail.com',
        phone: '+1 (555) 204-7788',
        age: 34,
        gender: 'male'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson11@gmail.com',
        phone: '+1 (555) 204-7790',
        age: 31,
        gender: 'female'
      }
    ],
    lineItems: [
      {
        id: 'li-invoice-001-1',
        label: 'Package Cost — Bali Island Escape (6D/5N)',
        description: '2 travelers',
        quantity: 1,
        unitPrice: 2598,
        amount: 2598
      }
    ],
    discountAmount: 200,
    couponCode: 'SUMMER20',
    taxRate: 0,
    taxAmount: 0,
    subtotal: 2598,
    total: 2398,
    amountPaid: 2398,
    balanceDue: 0,
    paymentMethod: 'card',
    cardLast4: '7658',
    createdAt: '2026-06-02T09:15:00.000Z',
    updatedAt: '2026-06-02T09:15:00.000Z'
  },
  {
    id: 'invoice-002',
    invoiceNumber: 'INV-2026-0002',
    bookingId: 'booking-003',
    transactionId: 'txn-booking-003',
    customerId: 'customer-002',
    status: 'paid',
    issueDate: '2026-05-24',
    dueDate: '2026-06-07',
    billTo: { name: 'Amelia Carter', email: 'amelia.carter@example.com', phone: '+1 415-552-1187' },
    travel: {
      packageTitle: 'Bali Island Escape',
      packageLocation: 'Bali, Indonesia',
      packageDays: 6,
      packageNights: 5,
      travelDate: '2026-06-22',
      travelers: 1,
      bookingRef: 'TRV-0021-JBNA'
    },
    lineItems: [
      {
        id: 'li-invoice-002-1',
        label: 'Package Cost — Bali Island Escape (6D/5N)',
        quantity: 1,
        unitPrice: 899,
        amount: 899
      }
    ],
    taxRate: 0,
    taxAmount: 0,
    subtotal: 899,
    total: 899,
    amountPaid: 899,
    balanceDue: 0,
    paymentMethod: 'card',
    cardLast4: '8104',
    createdAt: '2026-05-24T16:06:00.000Z',
    updatedAt: '2026-05-24T16:06:00.000Z'
  },
  {
    id: 'invoice-003',
    invoiceNumber: 'INV-2026-0003',
    bookingId: 'booking-009',
    transactionId: 'txn-booking-009',
    customerId: 'customer-003',
    status: 'paid',
    issueDate: '2025-10-28',
    dueDate: '2025-11-11',
    billTo: { name: 'Noah Williams', email: 'noah.williams@example.com', phone: '+1 312-664-2098' },
    travel: {
      packageTitle: 'Kerala Backwaters Bliss',
      packageLocation: 'Kerala, India',
      packageDays: 6,
      packageNights: 5,
      travelDate: '2025-11-25',
      travelers: 3,
      bookingRef: 'TRV-0031-MRBS'
    },
    lineItems: [
      {
        id: 'li-invoice-003-1',
        label: 'Package Cost — Kerala Backwaters Bliss (6D/5N)',
        description: '3 travelers',
        quantity: 1,
        unitPrice: 3897,
        amount: 3897
      }
    ],
    taxRate: 0,
    taxAmount: 0,
    subtotal: 3897,
    total: 3897,
    amountPaid: 3897,
    balanceDue: 0,
    paymentMethod: 'card',
    cardLast4: '8301',
    createdAt: '2025-10-28T09:17:00.000Z',
    updatedAt: '2025-10-28T09:17:00.000Z'
  },
  {
    id: 'invoice-004',
    invoiceNumber: 'INV-2026-0004',
    bookingId: 'booking-021',
    transactionId: 'txn-booking-021',
    customerId: 'customer-006',
    status: 'sent',
    issueDate: '2026-07-10',
    dueDate: '2026-07-24',
    billTo: { name: 'Olivia Brown', email: 'olivia.brown@example.com', phone: '+1 702-330-5561' },
    travel: {
      packageTitle: 'Dubai Luxury City Break',
      packageLocation: 'Dubai, UAE',
      packageDays: 4,
      packageNights: 3,
      travelDate: '2026-09-19',
      travelers: 1,
      bookingRef: 'TRV-0061-UMEU'
    },
    lineItems: [
      {
        id: 'li-invoice-004-1',
        label: 'Package Cost — Dubai Luxury City Break (4D/3N)',
        quantity: 1,
        unitPrice: 1999,
        amount: 1999
      }
    ],
    taxRate: 0,
    taxAmount: 0,
    subtotal: 1999,
    total: 1999,
    amountPaid: 1999,
    balanceDue: 0,
    paymentMethod: 'card',
    cardLast4: '6447',
    createdAt: '2026-07-10T20:45:00.000Z',
    updatedAt: '2026-07-10T20:45:00.000Z'
  },
  {
    id: 'invoice-005',
    invoiceNumber: 'INV-2026-0005',
    bookingId: 'booking-033',
    transactionId: 'txn-booking-033',
    customerId: 'customer-008',
    status: 'paid',
    issueDate: '2026-07-20',
    dueDate: '2026-08-03',
    billTo: { name: 'Isabella Wilson', email: 'isabella.wilson@example.com', phone: '+1 305-889-7712' },
    travel: {
      packageTitle: 'Sydney Harbour Explorer',
      packageLocation: 'Sydney, Australia',
      packageDays: 5,
      packageNights: 4,
      travelDate: '2027-03-09',
      travelers: 1,
      bookingRef: 'TRV-0081-GAUG'
    },
    lineItems: [
      {
        id: 'li-invoice-005-1',
        label: 'Package Cost — Sydney Harbour Explorer (5D/4N)',
        quantity: 1,
        unitPrice: 1899,
        amount: 1899
      }
    ],
    taxRate: 0,
    taxAmount: 0,
    subtotal: 1899,
    total: 1899,
    amountPaid: 1899,
    balanceDue: 0,
    paymentMethod: 'card',
    cardLast4: '3122',
    createdAt: '2026-07-20T09:05:00.000Z',
    updatedAt: '2026-07-20T09:05:00.000Z'
  },
  {
    id: 'invoice-006',
    invoiceNumber: 'INV-2026-0006',
    bookingId: 'booking-036',
    transactionId: 'txn-booking-036',
    customerId: 'customer-009',
    status: 'paid',
    issueDate: '2026-06-25',
    dueDate: '2026-07-09',
    billTo: { name: 'James Taylor', email: 'james.taylor@example.com', phone: '+1 480-556-3390' },
    travel: {
      packageTitle: 'New York City Explorer',
      packageLocation: 'New York City, USA',
      packageDays: 5,
      packageNights: 4,
      travelDate: '2026-10-27',
      travelers: 2,
      bookingRef: 'TRV-0091-NFCD'
    },
    lineItems: [
      {
        id: 'li-invoice-006-1',
        label: 'Package Cost — New York City Explorer (5D/4N)',
        description: '2 travelers',
        quantity: 1,
        unitPrice: 4398,
        amount: 4398
      }
    ],
    taxRate: 0,
    taxAmount: 0,
    subtotal: 4398,
    total: 4398,
    amountPaid: 4398,
    balanceDue: 0,
    paymentMethod: 'card',
    cardLast4: '1825',
    createdAt: '2026-06-25T10:02:00.000Z',
    updatedAt: '2026-06-25T10:02:00.000Z'
  },
  {
    id: 'invoice-007',
    invoiceNumber: 'INV-2026-0007',
    bookingId: 'booking-044',
    transactionId: 'txn-booking-044',
    customerId: 'customer-010',
    status: 'draft',
    issueDate: '2026-07-25',
    dueDate: '2026-08-08',
    billTo: { name: 'Charlotte Moore', email: 'charlotte.moore@example.com', phone: '+1 720-994-2287' },
    travel: {
      packageTitle: 'Kerala Backwaters Bliss',
      packageLocation: 'Kerala, India',
      packageDays: 6,
      packageNights: 5,
      travelDate: '2026-12-24',
      travelers: 2,
      bookingRef: 'TRV-0101-QDVT'
    },
    lineItems: [
      {
        id: 'li-invoice-007-1',
        label: 'Package Cost — Kerala Backwaters Bliss (6D/5N)',
        description: '2 travelers',
        quantity: 1,
        unitPrice: 2598,
        amount: 2598
      }
    ],
    taxRate: 0,
    taxAmount: 0,
    subtotal: 2598,
    total: 2598,
    amountPaid: 2598,
    balanceDue: 0,
    paymentMethod: 'card',
    cardLast4: '9404',
    createdAt: '2026-07-25T12:46:00.000Z',
    updatedAt: '2026-07-25T12:46:00.000Z'
  },
  {
    id: 'invoice-008',
    invoiceNumber: 'INV-2026-0008',
    bookingId: 'booking-052',
    transactionId: 'txn-booking-052',
    customerId: 'customer-012',
    status: 'sent',
    issueDate: '2026-07-01',
    dueDate: '2026-07-15',
    billTo: { name: 'Mia Rodriguez', email: 'mia.rodriguez@example.com', phone: '+1 210-773-6612' },
    travel: {
      packageTitle: 'Fiordland Wilderness Trail',
      packageLocation: 'Fiordland, New Zealand',
      packageDays: 6,
      packageNights: 5,
      travelDate: '2026-09-25',
      travelers: 1,
      bookingRef: 'TRV-0121-DVNX'
    },
    lineItems: [
      {
        id: 'li-invoice-008-1',
        label: 'Package Cost — Fiordland Wilderness Trail (6D/5N)',
        quantity: 1,
        unitPrice: 2299,
        amount: 2299
      }
    ],
    taxRate: 0,
    taxAmount: 0,
    subtotal: 2299,
    total: 2299,
    amountPaid: 2299,
    balanceDue: 0,
    paymentMethod: 'card',
    cardLast4: '6983',
    createdAt: '2026-07-01T12:23:00.000Z',
    updatedAt: '2026-07-01T12:23:00.000Z'
  },
  {
    id: 'invoice-009',
    invoiceNumber: 'INV-2026-0009',
    bookingId: 'booking-027',
    transactionId: 'txn-booking-027',
    customerId: 'customer-007',
    status: 'overdue',
    issueDate: '2025-10-09',
    dueDate: '2025-10-23',
    billTo: { name: 'Ethan Davis', email: 'ethan.davis@example.com', phone: '+1 917-440-6623' },
    travel: {
      packageTitle: 'Phuket Beach Bliss',
      packageLocation: 'Phuket, Thailand',
      packageDays: 6,
      packageNights: 5,
      travelDate: '2025-11-11',
      travelers: 3,
      bookingRef: 'TRV-0071-FGUN'
    },
    lineItems: [
      {
        id: 'li-invoice-009-1',
        label: 'Package Cost — Phuket Beach Bliss (6D/5N)',
        description: '3 travelers',
        quantity: 1,
        unitPrice: 3297,
        amount: 3297
      }
    ],
    taxRate: 0,
    taxAmount: 0,
    subtotal: 3297,
    total: 3297,
    amountPaid: 3297,
    balanceDue: 0,
    paymentMethod: 'card',
    cardLast4: '1456',
    notes: 'Payment reminder sent — due date has passed.',
    createdAt: '2025-10-09T16:03:00.000Z',
    updatedAt: '2025-10-20T12:00:00.000Z'
  },
  {
    id: 'invoice-010',
    invoiceNumber: 'INV-2026-0010',
    bookingId: 'booking-084',
    transactionId: 'txn-booking-084',
    customerId: 'customer-018',
    status: 'cancelled',
    issueDate: '2026-05-08',
    dueDate: '2026-05-22',
    billTo: { name: 'Harper King', email: 'harper.king@example.com', phone: '+1 206-771-4498' },
    travel: {
      packageTitle: 'Santorini Sunset Getaway',
      packageLocation: 'Santorini, Greece',
      packageDays: 6,
      packageNights: 5,
      travelDate: '2026-06-21',
      travelers: 2,
      bookingRef: 'TRV-0181-PYJW'
    },
    lineItems: [
      {
        id: 'li-invoice-010-1',
        label: 'Package Cost — Santorini Sunset Getaway (6D/5N)',
        description: '2 travelers',
        quantity: 1,
        unitPrice: 5398,
        amount: 5398
      }
    ],
    taxRate: 0,
    taxAmount: 0,
    subtotal: 5398,
    total: 5398,
    amountPaid: 5398,
    balanceDue: 0,
    paymentMethod: 'card',
    cardLast4: '8358',
    notes: 'Cancelled — trip plans changed after booking.',
    createdAt: '2026-05-08T17:52:00.000Z',
    updatedAt: '2026-05-20T12:00:00.000Z'
  }
]
