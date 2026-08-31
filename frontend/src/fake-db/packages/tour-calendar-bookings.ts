// Type Imports
import type { Booking } from '@/types/account/booking-types'
import type { TravelerGender, TravelerInfo } from '@/types/packages/checkout-types'

const AVATAR_COUNT = 20
const AVATARS = Array.from({ length: AVATAR_COUNT }, (_, index) => `/images/avatars/avatar-${index + 1}.webp`)

const GENDERS: TravelerGender[] = ['male', 'female', 'other']

// Pulled from the primary contacts below — reused as a name pool for guest travelers so a
// multi-traveler booking shows real-looking names instead of a literal "Guest 2", "Guest 3".
const GUEST_NAME_POOL: { firstName: string; lastName: string }[] = [
  { firstName: 'Sophia', lastName: 'Turner' },
  { firstName: 'Liam', lastName: 'Carter' },
  { firstName: 'Ava', lastName: 'Mitchell' },
  { firstName: 'Noah', lastName: 'Bennett' },
  { firstName: 'Isabella', lastName: 'Reyes' },
  { firstName: 'Ethan', lastName: 'Brooks' },
  { firstName: 'Mia', lastName: 'Foster' },
  { firstName: 'Lucas', lastName: 'Hayes' },
  { firstName: 'Chloe', lastName: 'Ramirez' },
  { firstName: 'Benjamin', lastName: 'Cole' },
  { firstName: 'Amelia', lastName: 'Ross' },
  { firstName: 'James', lastName: 'Patterson' },
  { firstName: 'Harper', lastName: 'Simmons' },
  { firstName: 'Henry', lastName: 'Blake' },
  { firstName: 'Grace', lastName: 'Ellison' },
  { firstName: 'Jack', lastName: 'Donovan' },
  { firstName: 'Ella', lastName: 'Whitfield' },
  { firstName: 'Owen', lastName: 'Sinclair' },
  { firstName: 'Zoe', lastName: 'Harrington' },
  { firstName: 'Daniel', lastName: 'Marsh' },
  { firstName: 'Layla', lastName: 'Osborne' },
  { firstName: 'Ryan', lastName: 'Whitaker' },
  { firstName: 'Nora', lastName: 'Kingsley' },
  { firstName: 'Caleb', lastName: 'Fenwick' },
  { firstName: 'Stella', lastName: 'Pemberton' },
  { firstName: 'Adrian', lastName: 'Voss' },
  { firstName: 'Victoria', lastName: 'Lang' },
  { firstName: 'Sebastian', lastName: 'Cruz' },
  { firstName: 'Ivy', lastName: 'Sutherland' },
  { firstName: 'Marcus', lastName: 'Delaney' },
  { firstName: 'Freya', lastName: 'Callahan' },
  { firstName: 'Grant', lastName: 'Whitmore' },
  { firstName: 'Priya', lastName: 'Anand' },
  { firstName: 'Oliver', lastName: 'Wren' },
  { firstName: 'Hannah', lastName: 'Marlowe' },
  { firstName: 'Felix', lastName: 'Donahue' }
]

const NOTE_TEMPLATES = [
  'Requested a vegetarian meal plan for the whole trip.',
  'Celebrating an anniversary — asked for a room upgrade if available.',
  'Traveling with an infant, requested a crib at the hotel.',
  'Prefers a window seat on all connecting flights.',
  'Asked for an early check-in and late checkout.',
  'Mobility assistance requested at the airport.',
  'First-time visitor — would like a local guide for day one.',
  'Allergic to shellfish, please inform all dining venues.'
]

// Simple deterministic string hash — same id always yields the same "random" pick, so
// avatars/phones/notes stay stable across renders instead of reshuffling on every reload.
// Masks to 32 bits on every step (not just at the end) — without it, `acc * 31` on a
// 15-char string blows past Number's safe-integer range and every id collapses to the
// same hash, which is what silently pinned every booking to avatar-1 before.
const hashString = (value: string) => {
  let hash = 7

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0
  }

  return hash >>> 0
}

type RawCalendarBooking = Omit<Booking, 'contactPhone' | 'contactAvatar' | 'travelersInfo' | 'notes'>

/**
 * Fills in the fields a real checkout booking would have (phone, traveler roster, avatar, notes)
 * from the booking's own id/contact so `/dashboard/bookings/{id}` never renders an empty page —
 * every calendar-only booking resolves to a fully aligned detail view, avatars shuffled per booking.
 */
// Builds a phone number from any seed string — called per-person (not just per-booking) so
// guests on the same trip don't all end up sharing the primary traveler's phone number.
const phoneFromSeed = (seed: string) => {
  const hash = hashString(seed)

  return `+1 (555) ${String(100 + (hash % 800)).padStart(3, '0')}-${String(hash % 10000).padStart(4, '0')}`
}

const enrichBooking = (raw: RawCalendarBooking, index: number): Booking => {
  const hash = hashString(raw.id)
  const contactPhone = phoneFromSeed(raw.id)

  const [firstName, ...rest] = raw.contactName.split(' ')
  const lastName = rest.join(' ') || firstName

  const travelersInfo: TravelerInfo[] = [
    {
      firstName,
      lastName,
      email: raw.contactEmail,
      phone: contactPhone,
      age: 24 + (hash % 40),
      gender: GENDERS[hash % 2]
    },
    ...Array.from({ length: Math.max(raw.travelers - 1, 0) }, (_, guestIndex) => {
      const poolSize = GUEST_NAME_POOL.length
      const primaryPoolIndex = poolSize ? index % poolSize : 0
      let poolIndex = (index + (guestIndex + 1) * 7) % poolSize

      // Skip past the primary traveler's own pool slot so a guest never duplicates their name.
      if (poolIndex === primaryPoolIndex) poolIndex = (poolIndex + 1) % poolSize

      const guest = GUEST_NAME_POOL[poolIndex]

      return {
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: `${guest.firstName}.${guest.lastName}@example.com`.toLowerCase(),
        phone: phoneFromSeed(`${raw.id}-guest-${guestIndex}`),
        age: 20 + ((hash + guestIndex * 7) % 45),
        gender: GENDERS[(hash + guestIndex) % GENDERS.length]
      }
    })
  ]

  return {
    ...raw,
    contactPhone,
    contactAvatar: AVATARS[hash % AVATAR_COUNT],
    travelersInfo,
    notes: index % 3 === 0 ? undefined : NOTE_TEMPLATES[hash % NOTE_TEMPLATES.length]
  }
}

/**
 * Extra departures shown only on the agent dashboard's Booking Calendar (`src/views/apps/bookings`).
 * Kept separate from `@/fake-db/account/bookings` so the customer-facing account pages
 * (My Account bookings, dashboard, track booking) aren't padded with admin-only calendar filler.
 *
 * Spread 3 per month across all of 2026 so every month has departures to show on the calendar.
 */
const RAW: RawCalendarBooking[] = [
  // January
  {
    id: 'cal-booking-001',
    packageSlug: 'bali-island-escape',
    packageTitle: 'Bali Island Escape',
    packageImage: '/images/countries/indonesia/indonesia-1.webp',
    packageLocation: 'Bali, Indonesia',
    packageDays: 6,
    packageNights: 5,
    travelers: 2,
    travelDate: '2026-01-08',
    bookingRef: 'TRV-CAL01-Q7W2',
    totalAmount: 1798,
    paymentResult: { method: 'card', cardLast4: '4412' },
    bookedAt: '2025-12-18T09:00:00.000Z',
    status: 'completed',
    contactName: 'Sophia Turner',
    contactEmail: 'sophia.turner@example.com'
  },
  {
    id: 'cal-booking-002',
    packageSlug: 'ubud-rice-terrace-retreat',
    packageTitle: 'Ubud Rice Terrace Retreat',
    packageImage: '/images/countries/indonesia/indonesia-3.webp',
    packageLocation: 'Ubud, Indonesia',
    packageDays: 5,
    packageNights: 4,
    travelers: 1,
    travelDate: '2026-01-16',
    bookingRef: 'TRV-CAL02-M3K9',
    totalAmount: 749,
    paymentResult: { method: 'upi' },
    bookedAt: '2025-12-22T10:30:00.000Z',
    status: 'completed',
    contactName: 'Liam Carter',
    contactEmail: 'liam.carter@example.com'
  },
  {
    id: 'cal-booking-003',
    packageSlug: 'swiss-alps-adventure',
    packageTitle: 'Swiss Alps Adventure',
    packageImage: '/images/countries/switzerland/switzerland-1.webp',
    packageLocation: 'Interlaken, Switzerland',
    packageDays: 7,
    packageNights: 6,
    travelers: 3,
    travelDate: '2026-01-24',
    bookingRef: 'TRV-CAL03-P8D4',
    totalAmount: 6597,
    paymentResult: { method: 'card', cardLast4: '2290' },
    bookedAt: '2026-01-02T11:00:00.000Z',
    status: 'completed',
    contactName: 'Ava Mitchell',
    contactEmail: 'ava.mitchell@example.com'
  },

  // February
  {
    id: 'cal-booking-004',
    packageSlug: 'zermatt-alpine-escape',
    packageTitle: 'Zermatt Alpine Escape',
    packageImage: '/images/countries/switzerland/switzerland-3.webp',
    packageLocation: 'Zermatt, Switzerland',
    packageDays: 6,
    packageNights: 5,
    travelers: 2,
    travelDate: '2026-02-07',
    bookingRef: 'TRV-CAL04-T1N6',
    totalAmount: 4198,
    paymentResult: { method: 'card', cardLast4: '7731' },
    bookedAt: '2026-01-15T09:20:00.000Z',
    status: 'completed',
    contactName: 'Noah Bennett',
    contactEmail: 'noah.bennett@example.com'
  },
  {
    id: 'cal-booking-005',
    packageSlug: 'geneva-lakeside-discovery',
    packageTitle: 'Geneva Lakeside Discovery',
    packageImage: '/images/countries/switzerland/switzerland-2.webp',
    packageLocation: 'Geneva, Switzerland',
    packageDays: 4,
    packageNights: 3,
    travelers: 4,
    travelDate: '2026-02-14',
    bookingRef: 'TRV-CAL05-H5V3',
    totalAmount: 7196,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-01-20T13:00:00.000Z',
    status: 'completed',
    contactName: 'Isabella Reyes',
    contactEmail: 'isabella.reyes@example.com'
  },
  {
    id: 'cal-booking-006',
    packageSlug: 'taj-mahal-trail',
    packageTitle: 'Taj Mahal',
    packageImage: '/images/countries/india/india-1.webp',
    packageLocation: 'Agra, India',
    packageDays: 8,
    packageNights: 7,
    travelers: 2,
    travelDate: '2026-02-21',
    bookingRef: 'TRV-CAL06-B2X7',
    totalAmount: 2298,
    paymentResult: { method: 'card', cardLast4: '6604' },
    bookedAt: '2026-01-28T14:30:00.000Z',
    status: 'completed',
    contactName: 'Ethan Brooks',
    contactEmail: 'ethan.brooks@example.com'
  },

  // March
  {
    id: 'cal-booking-007',
    packageSlug: 'kerala-backwaters-bliss',
    packageTitle: 'Kerala Backwaters Bliss',
    packageImage: '/images/countries/india/india-3.webp',
    packageLocation: 'Kerala, India',
    packageDays: 6,
    packageNights: 5,
    travelers: 5,
    travelDate: '2026-03-05',
    bookingRef: 'TRV-CAL07-Y9L1',
    totalAmount: 6495,
    paymentResult: { method: 'card', cardLast4: '3357' },
    bookedAt: '2026-02-10T09:40:00.000Z',
    status: 'completed',
    contactName: 'Mia Foster',
    contactEmail: 'mia.foster@example.com'
  },
  {
    id: 'cal-booking-008',
    packageSlug: 'maldives-honeymoon-bliss',
    packageTitle: 'Maldives Honeymoon Bliss',
    packageImage: '/images/countries/maldives/maldives-1.webp',
    packageLocation: 'Malé Atoll, Maldives',
    packageDays: 5,
    packageNights: 4,
    travelers: 2,
    travelDate: '2026-03-15',
    bookingRef: 'TRV-CAL08-C4R8',
    totalAmount: 6598,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-02-20T10:10:00.000Z',
    status: 'completed',
    contactName: 'Lucas Hayes',
    contactEmail: 'lucas.hayes@example.com'
  },
  {
    id: 'cal-booking-009',
    packageSlug: 'maldives-scuba-snorkel-adventure',
    packageTitle: 'Maldives Scuba & Snorkel Adventure',
    packageImage: '/images/countries/maldives/maldives-3.webp',
    packageLocation: 'Baa Atoll, Maldives',
    packageDays: 5,
    packageNights: 4,
    travelers: 3,
    travelDate: '2026-03-25',
    bookingRef: 'TRV-CAL09-F6J5',
    totalAmount: 8697,
    paymentResult: { method: 'card', cardLast4: '8823' },
    bookedAt: '2026-03-01T15:00:00.000Z',
    status: 'completed',
    contactName: 'Chloe Ramirez',
    contactEmail: 'chloe.ramirez@example.com'
  },

  // April
  {
    id: 'cal-booking-010',
    packageSlug: 'kenya-safari-explorer',
    packageTitle: 'Kenya Safari Explorer',
    packageImage: '/images/countries/kenya/kenya-3.webp',
    packageLocation: 'Maasai Mara, Kenya',
    packageDays: 6,
    packageNights: 5,
    travelers: 6,
    travelDate: '2026-04-06',
    bookingRef: 'TRV-CAL10-D2E9',
    totalAmount: 15294,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-03-12T08:45:00.000Z',
    status: 'completed',
    contactName: 'Benjamin Cole',
    contactEmail: 'benjamin.cole@example.com'
  },
  {
    id: 'cal-booking-011',
    packageSlug: 'amboseli-elephant-safari',
    packageTitle: 'Amboseli Elephant Safari',
    packageImage: '/images/countries/kenya/kenya-1.webp',
    packageLocation: 'Amboseli, Kenya',
    packageDays: 5,
    packageNights: 4,
    travelers: 1,
    travelDate: '2026-04-17',
    bookingRef: 'TRV-CAL11-K7M2',
    totalAmount: 2199,
    paymentResult: { method: 'card', cardLast4: '1190' },
    bookedAt: '2026-03-24T11:15:00.000Z',
    status: 'completed',
    contactName: 'Amelia Ross',
    contactEmail: 'amelia.ross@example.com'
  },
  {
    id: 'cal-booking-012',
    packageSlug: 'santorini-sunset-getaway',
    packageTitle: 'Santorini Sunset Getaway',
    packageImage: '/images/countries/greece/greece-1.webp',
    packageLocation: 'Santorini, Greece',
    packageDays: 6,
    packageNights: 5,
    travelers: 2,
    travelDate: '2026-04-27',
    bookingRef: 'TRV-CAL12-W4P6',
    totalAmount: 5398,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-04-02T09:30:00.000Z',
    status: 'completed',
    contactName: 'James Patterson',
    contactEmail: 'james.patterson@example.com'
  },

  // May
  {
    id: 'cal-booking-013',
    packageSlug: 'athens-ancient-wonders',
    packageTitle: 'Athens Ancient Wonders',
    packageImage: '/images/countries/greece/greece-2.webp',
    packageLocation: 'Athens, Greece',
    packageDays: 5,
    packageNights: 4,
    travelers: 4,
    travelDate: '2026-05-04',
    bookingRef: 'TRV-CAL13-S8T3',
    totalAmount: 6396,
    paymentResult: { method: 'card', cardLast4: '2718' },
    bookedAt: '2026-04-10T10:00:00.000Z',
    status: 'completed',
    contactName: 'Harper Simmons',
    contactEmail: 'harper.simmons@example.com'
  },
  {
    id: 'cal-booking-014',
    packageSlug: 'queenstown-adrenaline-rush',
    packageTitle: 'Queenstown Adrenaline Rush',
    packageImage: '/images/countries/newzealand/newzealand-2.webp',
    packageLocation: 'Queenstown, New Zealand',
    packageDays: 7,
    packageNights: 6,
    travelers: 2,
    travelDate: '2026-05-14',
    bookingRef: 'TRV-CAL14-N6Q1',
    totalAmount: 4798,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-04-19T12:20:00.000Z',
    status: 'completed',
    contactName: 'Henry Blake',
    contactEmail: 'henry.blake@example.com'
  },
  {
    id: 'cal-booking-015',
    packageSlug: 'fiordland-wilderness-trail',
    packageTitle: 'Fiordland Wilderness Trail',
    packageImage: '/images/countries/newzealand/newzealand-3.webp',
    packageLocation: 'Fiordland, New Zealand',
    packageDays: 6,
    packageNights: 5,
    travelers: 7,
    travelDate: '2026-05-24',
    bookingRef: 'TRV-CAL15-Z1U7',
    totalAmount: 16093,
    paymentResult: { method: 'card', cardLast4: '6035' },
    bookedAt: '2026-04-29T14:40:00.000Z',
    status: 'completed',
    contactName: 'Grace Ellison',
    contactEmail: 'grace.ellison@example.com'
  },

  // June
  {
    id: 'cal-booking-016',
    packageSlug: 'kyoto-temple-discovery',
    packageTitle: 'Kyoto Temple Discovery',
    packageImage: '/images/countries/japan/japan-1.webp',
    packageLocation: 'Kyoto, Japan',
    packageDays: 8,
    packageNights: 7,
    travelers: 2,
    travelDate: '2026-06-05',
    bookingRef: 'TRV-CAL16-G3A5',
    totalAmount: 3798,
    paymentResult: { method: 'card', cardLast4: '4470' },
    bookedAt: '2026-05-11T09:15:00.000Z',
    status: 'completed',
    contactName: 'Jack Donovan',
    contactEmail: 'jack.donovan@example.com'
  },
  {
    id: 'cal-booking-017',
    packageSlug: 'tokyo-neon-nights',
    packageTitle: 'Tokyo Neon Nights',
    packageImage: '/images/countries/japan/japan-3.webp',
    packageLocation: 'Tokyo, Japan',
    packageDays: 6,
    packageNights: 5,
    travelers: 3,
    travelDate: '2026-06-16',
    bookingRef: 'TRV-CAL17-V8B2',
    totalAmount: 7197,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-05-22T13:50:00.000Z',
    status: 'completed',
    contactName: 'Ella Whitfield',
    contactEmail: 'ella.whitfield@example.com'
  },
  {
    id: 'cal-booking-018',
    packageSlug: 'osaka-street-food-trail',
    packageTitle: 'Osaka Street Food Trail',
    packageImage: '/images/countries/japan/japan-2.webp',
    packageLocation: 'Osaka, Japan',
    packageDays: 5,
    packageNights: 4,
    travelers: 1,
    travelDate: '2026-06-26',
    bookingRef: 'TRV-CAL18-R5C9',
    totalAmount: 1699,
    paymentResult: { method: 'card', cardLast4: '3392' },
    bookedAt: '2026-06-01T10:05:00.000Z',
    status: 'completed',
    contactName: 'Owen Sinclair',
    contactEmail: 'owen.sinclair@example.com'
  },

  // July
  {
    id: 'cal-booking-019',
    packageSlug: 'dubai-luxury-city-break',
    packageTitle: 'Dubai Luxury City Break',
    packageImage: '/images/countries/uae/uae-1.webp',
    packageLocation: 'Dubai, UAE',
    packageDays: 4,
    packageNights: 3,
    travelers: 5,
    travelDate: '2026-07-08',
    bookingRef: 'TRV-CAL19-L2D4',
    totalAmount: 9995,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-06-14T09:00:00.000Z',
    status: 'completed',
    contactName: 'Zoe Harrington',
    contactEmail: 'zoe.harrington@example.com'
  },
  {
    id: 'cal-booking-020',
    packageSlug: 'abu-dhabi-desert-safari',
    packageTitle: 'Abu Dhabi Desert Safari',
    packageImage: '/images/countries/uae/uae-3.webp',
    packageLocation: 'Abu Dhabi, UAE',
    packageDays: 4,
    packageNights: 3,
    travelers: 2,
    travelDate: '2026-07-18',
    bookingRef: 'TRV-CAL20-J9F6',
    totalAmount: 3198,
    paymentResult: { method: 'card', cardLast4: '1508' },
    bookedAt: '2026-06-24T11:40:00.000Z',
    status: 'completed',
    contactName: 'Daniel Marsh',
    contactEmail: 'daniel.marsh@example.com'
  },
  {
    id: 'cal-booking-021',
    packageSlug: 'dubai-marina-cruise-and-skyline',
    packageTitle: 'Dubai Marina Cruise & Skyline',
    packageImage: '/images/countries/uae/uae-2.webp',
    packageLocation: 'Dubai Marina, UAE',
    packageDays: 4,
    packageNights: 3,
    travelers: 2,
    travelDate: '2026-07-28',
    bookingRef: 'TRV-CAL21-X3H8',
    totalAmount: 4598,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-07-03T15:20:00.000Z',
    status: 'completed',
    contactName: 'Layla Osborne',
    contactEmail: 'layla.osborne@example.com'
  },

  // August
  {
    id: 'cal-booking-022',
    packageSlug: 'sharjah-heritage-walk',
    packageTitle: 'Sharjah Heritage Walk',
    packageImage: '/images/countries/uae/uae-1.webp',
    packageLocation: 'Sharjah, UAE',
    packageDays: 3,
    packageNights: 2,
    travelers: 4,
    travelDate: '2026-08-10',
    bookingRef: 'TRV-CAL22-P1K7',
    totalAmount: 3996,
    paymentResult: { method: 'card', cardLast4: '6650' },
    bookedAt: '2026-07-17T09:30:00.000Z',
    status: 'upcoming',
    contactName: 'Ryan Whitaker',
    contactEmail: 'ryan.whitaker@example.com'
  },
  {
    id: 'cal-booking-023',
    packageSlug: 'patagonia-trekking-expedition',
    packageTitle: 'Patagonia Trekking Expedition',
    packageImage: '/images/countries/chile/chile-3.webp',
    packageLocation: 'Torres del Paine, Chile',
    packageDays: 9,
    packageNights: 8,
    travelers: 2,
    travelDate: '2026-08-20',
    bookingRef: 'TRV-CAL23-M6N2',
    totalAmount: 6398,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-07-27T13:10:00.000Z',
    status: 'upcoming',
    contactName: 'Nora Kingsley',
    contactEmail: 'nora.kingsley@example.com'
  },
  {
    id: 'cal-booking-024',
    packageSlug: 'atacama-desert-stargazing',
    packageTitle: 'Atacama Desert Stargazing',
    packageImage: '/images/countries/chile/chile-1.webp',
    packageLocation: 'San Pedro de Atacama, Chile',
    packageDays: 5,
    packageNights: 4,
    travelers: 2,
    travelDate: '2026-08-30',
    bookingRef: 'TRV-CAL24-Q4R9',
    totalAmount: 5198,
    paymentResult: { method: 'card', cardLast4: '4287' },
    bookedAt: '2026-08-02T10:00:00.000Z',
    status: 'upcoming',
    contactName: 'Caleb Fenwick',
    contactEmail: 'caleb.fenwick@example.com'
  },

  // September
  {
    id: 'cal-booking-025',
    packageSlug: 'phuket-beach-bliss',
    packageTitle: 'Phuket Beach Bliss',
    packageImage: '/images/countries/thailand/thailand-2.webp',
    packageLocation: 'Phuket, Thailand',
    packageDays: 6,
    packageNights: 5,
    travelers: 6,
    travelDate: '2026-09-05',
    bookingRef: 'TRV-CAL25-B7S3',
    totalAmount: 6594,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-08-03T09:00:00.000Z',
    status: 'upcoming',
    contactName: 'Stella Pemberton',
    contactEmail: 'stella.pemberton@example.com'
  },
  {
    id: 'cal-booking-026',
    packageSlug: 'bangkok-grand-palace-tour',
    packageTitle: 'Bangkok Grand Palace Tour',
    packageImage: '/images/countries/thailand/thailand-1.webp',
    packageLocation: 'Bangkok, Thailand',
    packageDays: 5,
    packageNights: 4,
    travelers: 2,
    travelDate: '2026-09-15',
    bookingRef: 'TRV-CAL26-T2V5',
    totalAmount: 2198,
    paymentResult: { method: 'card', cardLast4: '5561' },
    bookedAt: '2026-08-03T09:30:00.000Z',
    status: 'upcoming',
    contactName: 'Adrian Voss',
    contactEmail: 'adrian.voss@example.com'
  },
  {
    id: 'cal-booking-027',
    packageSlug: 'chiang-mai-jungle-retreat',
    packageTitle: 'Chiang Mai Jungle Retreat',
    packageImage: '/images/countries/thailand/thailand-3.webp',
    packageLocation: 'Chiang Mai, Thailand',
    packageDays: 5,
    packageNights: 4,
    travelers: 3,
    travelDate: '2026-09-25',
    bookingRef: 'TRV-CAL27-D5W8',
    totalAmount: 3747,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-08-03T10:00:00.000Z',
    status: 'upcoming',
    contactName: 'Victoria Lang',
    contactEmail: 'victoria.lang@example.com'
  },

  // October
  {
    id: 'cal-booking-028',
    packageSlug: 'banff-wildlife-and-rockies-trail',
    packageTitle: 'Banff Wildlife & Rockies Trail',
    packageImage: '/images/countries/canada/canada-1.webp',
    packageLocation: 'Banff, Canada',
    packageDays: 6,
    packageNights: 5,
    travelers: 1,
    travelDate: '2026-10-06',
    bookingRef: 'TRV-CAL28-K9Y1',
    totalAmount: 2299,
    paymentResult: { method: 'card', cardLast4: '9915' },
    bookedAt: '2026-08-03T10:30:00.000Z',
    status: 'upcoming',
    contactName: 'Sebastian Cruz',
    contactEmail: 'sebastian.cruz@example.com'
  },
  {
    id: 'cal-booking-029',
    packageSlug: 'niagara-falls-getaway',
    packageTitle: 'Niagara Falls Getaway',
    packageImage: '/images/countries/canada/canada-2.webp',
    packageLocation: 'Niagara Falls, Canada',
    packageDays: 3,
    packageNights: 2,
    travelers: 7,
    travelDate: '2026-10-16',
    bookingRef: 'TRV-CAL29-F3H6',
    totalAmount: 6293,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-08-03T11:00:00.000Z',
    status: 'upcoming',
    contactName: 'Ivy Sutherland',
    contactEmail: 'ivy.sutherland@example.com'
  },
  {
    id: 'cal-booking-030',
    packageSlug: 'great-barrier-reef-discovery',
    packageTitle: 'Great Barrier Reef Discovery',
    packageImage: '/images/countries/australia/australia-3.webp',
    packageLocation: 'Cairns, Australia',
    packageDays: 6,
    packageNights: 5,
    travelers: 2,
    travelDate: '2026-10-26',
    bookingRef: 'TRV-CAL30-U6J4',
    totalAmount: 5598,
    paymentResult: { method: 'card', cardLast4: '5203' },
    bookedAt: '2026-08-03T11:30:00.000Z',
    status: 'upcoming',
    contactName: 'Marcus Delaney',
    contactEmail: 'marcus.delaney@example.com'
  },

  // November
  {
    id: 'cal-booking-031',
    packageSlug: 'sydney-harbour-explorer',
    packageTitle: 'Sydney Harbour Explorer',
    packageImage: '/images/countries/australia/australia-1.webp',
    packageLocation: 'Sydney, Australia',
    packageDays: 5,
    packageNights: 4,
    travelers: 4,
    travelDate: '2026-11-04',
    bookingRef: 'TRV-CAL31-A4L2',
    totalAmount: 7596,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-08-03T12:00:00.000Z',
    status: 'upcoming',
    contactName: 'Freya Callahan',
    contactEmail: 'freya.callahan@example.com'
  },
  {
    id: 'cal-booking-032',
    packageSlug: 'moscow-kremlin-and-red-square',
    packageTitle: 'Moscow Kremlin & Red Square',
    packageImage: '/images/countries/russia/russia-1.webp',
    packageLocation: 'Moscow, Russia',
    packageDays: 5,
    packageNights: 4,
    travelers: 2,
    travelDate: '2026-11-14',
    bookingRef: 'TRV-CAL32-E7N9',
    totalAmount: 3598,
    paymentResult: { method: 'card', cardLast4: '7203' },
    bookedAt: '2026-08-03T12:30:00.000Z',
    status: 'upcoming',
    contactName: 'Grant Whitmore',
    contactEmail: 'grant.whitmore@example.com'
  },
  {
    id: 'cal-booking-033',
    packageSlug: 'saint-petersburg-palace-tour',
    packageTitle: 'Saint Petersburg Palace Tour',
    packageImage: '/images/countries/russia/russia-2.webp',
    packageLocation: 'Saint Petersburg, Russia',
    packageDays: 5,
    packageNights: 4,
    travelers: 3,
    travelDate: '2026-11-24',
    bookingRef: 'TRV-CAL33-H2K5',
    totalAmount: 5847,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-08-03T13:00:00.000Z',
    status: 'upcoming',
    contactName: 'Priya Anand',
    contactEmail: 'priya.anand@example.com'
  },

  // December
  {
    id: 'cal-booking-034',
    packageSlug: 'new-york-city-explorer',
    packageTitle: 'New York City Explorer',
    packageImage: '/images/countries/usa/usa-2.webp',
    packageLocation: 'New York City, USA',
    packageDays: 5,
    packageNights: 4,
    travelers: 5,
    travelDate: '2026-12-05',
    bookingRef: 'TRV-CAL34-F3T6',
    totalAmount: 10995,
    paymentResult: { method: 'card', cardLast4: '3316' },
    bookedAt: '2026-08-03T13:30:00.000Z',
    status: 'upcoming',
    contactName: 'Oliver Wren',
    contactEmail: 'oliver.wren@example.com'
  },
  {
    id: 'cal-booking-035',
    packageSlug: 'grand-canyon-adventure',
    packageTitle: 'Grand Canyon Adventure',
    packageImage: '/images/countries/usa/usa-1.webp',
    packageLocation: 'Grand Canyon, Arizona, USA',
    packageDays: 4,
    packageNights: 3,
    travelers: 1,
    travelDate: '2026-12-15',
    bookingRef: 'TRV-CAL35-U6J8',
    totalAmount: 1699,
    paymentResult: { method: 'upi' },
    bookedAt: '2026-08-03T14:00:00.000Z',
    status: 'upcoming',
    contactName: 'Hannah Marlowe',
    contactEmail: 'hannah.marlowe@example.com'
  },
  {
    id: 'cal-booking-036',
    packageSlug: 'bali-island-escape',
    packageTitle: 'Bali Island Escape',
    packageImage: '/images/countries/indonesia/indonesia-1.webp',
    packageLocation: 'Bali, Indonesia',
    packageDays: 6,
    packageNights: 5,
    travelers: 2,
    travelDate: '2026-12-25',
    bookingRef: 'TRV-CAL36-N9P1',
    totalAmount: 1798,
    paymentResult: { method: 'card', cardLast4: '8871' },
    bookedAt: '2026-08-03T14:30:00.000Z',
    status: 'upcoming',
    contactName: 'Felix Donahue',
    contactEmail: 'felix.donahue@example.com'
  }
]

export const db: Booking[] = RAW.map(enrichBooking)
