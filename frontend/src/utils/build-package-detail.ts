// Type Imports
import type {
  GalleryImage,
  ItineraryDay,
  PackageDetail,
  PackageHighlight,
  PackageTestimonial,
  PolicySection
} from '@/types/packages/package-detail-types'
import type { TourPackage } from '@/types/packages/tour-package-types'

const GALLERY_LAYOUT_CLASSES = ['col-span-2 row-span-2', '', '', 'col-span-2 max-h-60']

const ACTIVITY_TEMPLATES = [
  [
    'Airport pickup and private transfer to your hotel',
    'Welcome briefing with your local host over refreshments',
    'Room check-in and orientation walk around the neighborhood',
    'Evening at leisure to settle in before the trip begins'
  ],
  [
    'Guided city tour covering key landmarks and monuments',
    'Traditional lunch at a local eatery recommended by your guide',
    'Free time for shopping at nearby markets and boutiques',
    'Optional photo walk through the old town at golden hour'
  ],
  [
    'Full-day excursion to the region’s top attractions',
    'Photo stops at scenic viewpoints along the route',
    'Group dinner featuring authentic local cuisine',
    'Storytelling session with your guide about local history'
  ],
  [
    'Adventure activity session led by certified local instructors',
    'Visit to a nearby heritage site with a guided walkthrough',
    'Sunset viewing at a signature scenic spot',
    'Relaxed group dinner to recap the day’s highlights'
  ],
  [
    'Leisure morning at the resort with breakfast by the view',
    'Optional spa or wellness activity for a relaxed pace',
    'Evening cultural performance with dinner included',
    'Free time to explore at your own pace'
  ],
  [
    'Day trip to a nearby town known for its charm',
    'Local market exploration and tasting of regional specialties',
    'Meeting with artisans to learn traditional crafts',
    'Farewell dinner with the group at a scenic venue'
  ],
  [
    'Nature walk or wildlife spotting with an expert naturalist',
    'Visit to a local community project supporting the region',
    'Relaxed evening by the water with light refreshments',
    'Stargazing session, weather permitting'
  ],
  [
    'Checkout and a final relaxed breakfast',
    'Last-minute souvenir shopping near the hotel',
    'Free time until your scheduled transfer',
    'Private transfer to the airport for departure'
  ]
]

const DAY_TITLE_TEMPLATES = [
  'Airport Transfer & Welcome',
  'City Highlights Tour',
  'Full-Day Excursion',
  'Adventure & Heritage Visit',
  'Leisure & Wellness Morning',
  'Local Town & Market Visit',
  'Nature Walk & Community Visit',
  'Checkout & Departure'
]

const DAY_SUMMARY_TEMPLATES = [
  'Kick off your journey with a smooth transfer and a warm welcome from your local host.',
  'Explore iconic landmarks and immerse yourself in the local city life.',
  'Spend a full day discovering top attractions and scenic viewpoints.',
  'Balance thrill and culture with an action-packed day of activities.',
  'Take it slow with relaxation and wellness at your own pace.',
  'Venture beyond the city to discover charming local towns and markets.',
  'Connect with nature and the local community on a guided walk.',
  'Wrap up your trip with a relaxed morning before heading to the airport.'
]

const INCLUDED_SERVICES = [
  'Return airport transfers',
  'Accommodation as per itinerary',
  'Daily breakfast',
  'English-speaking tour guide',
  'All sightseeing entrance fees',
  'Welcome and farewell dinners'
]

const INCLUDED_SERVICES_PREMIUM = ['Business class flight upgrade', 'Private guided tours', 'Airport lounge access']

const EXCLUDED_SERVICES = [
  'International flights',
  'Travel insurance',
  'Personal expenses and tips',
  'Visa fees',
  'Optional activities not listed in the itinerary',
  'Lunches and dinners not mentioned'
]

const IMPORTANT_INFO: PolicySection[] = [
  {
    title: 'Passport & Visa',
    points: [
      'Passport must be valid for at least 6 months from the date of travel.',
      'Check visa requirements for your nationality well before booking.',
      'Keep a scanned copy of your passport and visa accessible during the trip.'
    ]
  },
  {
    title: 'Packing Essentials',
    points: [
      'Pack weather-appropriate clothing and comfortable walking shoes.',
      'Carry a copy of your travel documents and travel insurance.',
      'Bring a reusable water bottle and basic first-aid supplies.',
      'Pack a universal travel adapter for local power outlets.'
    ]
  },
  {
    title: 'Health & Safety',
    points: [
      'Consult your physician for recommended vaccinations before travel.',
      'Follow the guidance of your tour coordinator at all times.',
      'Carry any personal medication in its original, labeled packaging.'
    ]
  },
  {
    title: 'Currency & Payments',
    points: [
      'Local currency exchange counters are available at the airport and major hotels.',
      'Credit and debit cards are widely accepted in cities; carry cash for rural areas.',
      'Inform your bank of your travel dates to avoid card blocks.'
    ]
  },
  {
    title: 'Local Customs & Etiquette',
    points: [
      'Dress modestly when visiting religious or cultural sites.',
      'Ask permission before photographing local people.',
      'Tipping is appreciated but not mandatory unless stated otherwise.'
    ]
  },
  {
    title: 'Connectivity & Emergency Contacts',
    points: [
      'Local SIM cards and portable Wi-Fi devices are available on arrival.',
      'Your trip coordinator shares a 24/7 emergency contact number at check-in.',
      'Save the nearest embassy or consulate contact for your nationality.'
    ]
  }
]

const CONFIRMATION_POLICY = [
  'Booking is confirmed once the initial deposit is received and processed.',
  'A confirmation email with your itinerary, invoice, and travel voucher is sent within 24 hours.',
  'Please review your voucher carefully and report any discrepancies in traveler names or dates within 48 hours.',
  'Seat and room availability are held for 24 hours pending deposit; unpaid bookings may be released after that window.',
  'A dedicated trip coordinator is assigned to your booking and shared in the confirmation email.'
]

const REFUND_POLICY = [
  'Refunds are processed within 7-10 business days to the original payment method.',
  'Non-refundable components (flights, visas, permits) are excluded from refund calculations.',
  'Bank or payment gateway processing fees, where applicable, are deducted from the refunded amount.',
  'Refunds for partially used packages are calculated pro-rata based on services already availed.',
  'In case of trip disruption due to natural events beyond our control, refunds follow the supplier’s policy first.'
]

const CANCELLATION_POLICY = [
  'Free cancellation up to 15 days before departure.',
  'Cancellations within 7-14 days incur a 50% charge; within 7 days are non-refundable.',
  'Cancellations must be submitted in writing via email to be considered valid.',
  'No-shows on the departure date are treated as a full cancellation with no refund.',
  'Date changes requested more than 15 days in advance are permitted once at no extra charge, subject to availability.'
]

const PAYMENT_POLICY = [
  '25% deposit required at the time of booking to confirm your slot.',
  'Remaining balance is due 30 days before the departure date.',
  'Bookings made within 30 days of departure require full payment upfront.',
  'We accept major credit/debit cards, bank transfers, and select digital wallets.',
  'Installment plans are available on select premium packages — ask your trip coordinator for eligibility.',
  'All prices are quoted per person and exclude applicable local taxes unless stated otherwise.'
]

const TESTIMONIAL_POOL: Omit<PackageTestimonial, 'id'>[] = [
  {
    name: 'Olivia Sparks',
    role: 'Marketing Manager',
    company: 'Austin, USA',
    avatar: '/images/avatars/avatar-1.webp',
    rating: 5,
    content: 'Every detail felt handpicked just for us — the itinerary was flawless from start to finish.'
  },
  {
    name: 'Howard Lloyd',
    role: 'Product Designer',
    company: 'Manchester, UK',
    avatar: '/images/avatars/avatar-6.webp',
    rating: 5,
    content: 'Exceeded expectations at every turn. Support was quick and genuinely helpful throughout.'
  },
  {
    name: 'Hallie Richards',
    role: 'Software Engineer',
    company: 'Toronto, Canada',
    avatar: '/images/avatars/avatar-5.webp',
    rating: 4.5,
    content: 'Booking this package was the best decision we made all year. Highly recommended.'
  },
  {
    name: 'Liam Walton',
    role: 'Photographer',
    company: 'Dublin, Ireland',
    avatar: '/images/avatars/avatar-8.webp',
    rating: 5,
    content: 'From airport pickup to hotel check-in, everything was smooth and stress-free.'
  }
]

const appendCustomServices = (defaults: string[], custom?: string[]) => {
  if (!custom || custom.length === 0) return defaults

  const normalizedDefaults = new Set(defaults.map(item => item.trim().toLowerCase()))

  const customOnly = custom.filter(item => {
    const normalized = item.trim().toLowerCase()

    return normalized.length > 0 && !normalizedDefaults.has(normalized)
  })

  return [...defaults, ...customOnly]
}

const buildGallery = (tourPackage: TourPackage): GalleryImage[] => {
  return tourPackage.images.map((src, index) => ({
    src,
    alt: `${tourPackage.title} gallery photo ${index + 1}`,
    className: GALLERY_LAYOUT_CLASSES[index] ?? ''
  }))
}

export const getDiscountedPrice = (tourPackage: Pick<TourPackage, 'price' | 'discountPercent'>): number => {
  if (!tourPackage.discountPercent) return tourPackage.price

  return Math.round(tourPackage.price * (1 - tourPackage.discountPercent / 100))
}

const buildHighlights = (tourPackage: TourPackage): PackageHighlight[] => {
  if (tourPackage.tripHighlights && tourPackage.tripHighlights.length > 0) {
    return tourPackage.tripHighlights.map(value => ({ icon: 'sightseeing', label: 'Highlight', value }))
  }

  const highlights: PackageHighlight[] = [
    { icon: 'transfer', label: 'Transfers', value: 'Airport & sightseeing' },
    { icon: 'stay', label: 'Stay', value: `${tourPackage.nights} nights, 4-star hotels` },
    { icon: 'meals', label: 'Meals', value: 'Daily breakfast included' }
  ]

  if (tourPackage.packageType === 'premium') {
    highlights.push(
      { icon: 'sightseeing', label: 'Sightseeing', value: 'Guided city & nature tours' },
      { icon: 'flight', label: 'Flights', value: 'Business class upgrade' },
      { icon: 'guide', label: 'Guide', value: 'English-speaking local expert' }
    )
  }

  return highlights
}

const buildFallbackTripInformation = (tourPackage: TourPackage): string => {
  const paragraphs = [
    `Witness the natural beauty of ${tourPackage.location}, where the landscape shifts through breathtaking colors and textures at every turn.`,
    `Dive into the spirit of adventure as you navigate ${tourPackage.location}'s most scenic routes and hidden trails.`,
    `Discover the culture and stories behind ${tourPackage.location}, visiting landmarks that reveal its rich heritage.`,
    `Savor authentic local cuisine at handpicked restaurants recommended by your ${tourPackage.title} trip coordinator.`,
    `Every day of this ${tourPackage.days}-day journey is planned to balance sightseeing with time to simply relax.`
  ]

  return paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('')
}

export const resolveItinerary = (tourPackage: TourPackage): ItineraryDay[] => {
  if (tourPackage.itinerary && tourPackage.itinerary.length > 0) {
    return tourPackage.itinerary
  }

  return Array.from({ length: tourPackage.days }, (_, index) => {
    const isFirstDay = index === 0
    const isLastDay = index === tourPackage.days - 1
    const templateIndex = index % (ACTIVITY_TEMPLATES.length - 1)

    const activities = isLastDay ? ACTIVITY_TEMPLATES[ACTIVITY_TEMPLATES.length - 1] : ACTIVITY_TEMPLATES[templateIndex]

    const title = isFirstDay
      ? `Arrival in ${tourPackage.location}`
      : isLastDay
        ? 'Departure'
        : DAY_TITLE_TEMPLATES[templateIndex]

    const summary = isFirstDay
      ? `Touch down and settle in to begin your ${tourPackage.title} experience.`
      : isLastDay
        ? DAY_SUMMARY_TEMPLATES[DAY_SUMMARY_TEMPLATES.length - 1]
        : DAY_SUMMARY_TEMPLATES[templateIndex]

    return {
      day: index + 1,
      title,
      summary,
      activities
    }
  })
}

const buildTestimonials = (tourPackage: TourPackage): PackageTestimonial[] => {
  return TESTIMONIAL_POOL.map((testimonial, index) => ({
    id: `${tourPackage.id}-testimonial-${index + 1}`,
    ...testimonial
  }))
}

export const resolveTripInformation = (tourPackage: TourPackage): string =>
  tourPackage.tripInformation && tourPackage.tripInformation.trim().length > 0
    ? tourPackage.tripInformation
    : buildFallbackTripInformation(tourPackage)

export const buildPackageDetail = (tourPackage: TourPackage): PackageDetail => ({
  ...tourPackage,
  price: getDiscountedPrice(tourPackage),
  originalPrice: tourPackage.discountPercent ? tourPackage.price : undefined,
  gallery: buildGallery(tourPackage),
  highlights: buildHighlights(tourPackage),
  tripInformation: resolveTripInformation(tourPackage),
  itinerary: resolveItinerary(tourPackage),
  includedServices: appendCustomServices(
    tourPackage.packageType === 'premium' ? [...INCLUDED_SERVICES, ...INCLUDED_SERVICES_PREMIUM] : INCLUDED_SERVICES,
    tourPackage.inclusions
  ),
  excludedServices: appendCustomServices(EXCLUDED_SERVICES, tourPackage.exclusions),
  importantInfo: IMPORTANT_INFO,
  confirmationPolicy: CONFIRMATION_POLICY,
  refundPolicy: REFUND_POLICY,
  cancellationPolicy: CANCELLATION_POLICY,
  paymentPolicy: PAYMENT_POLICY,
  testimonials: buildTestimonials(tourPackage)
})
