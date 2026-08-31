// Type Imports
import type { Faq, PopularDestination, RecommendedPackage, Testimonial } from '@/types/pages/home-types'

// Data Imports
import { db as tourPackagesDb } from '@/fake-db/packages/tour-packages'

// countryKey is the image-folder key matching TourPackage['country'], used to derive packageCount/startingPrice below
type PopularDestinationSeed = Omit<PopularDestination, 'packageCount' | 'startingPrice'> & {
  countryKey: string
}

const popularDestinationSeeds: PopularDestinationSeed[] = [
  {
    id: '1',
    name: 'Bali',
    country: 'Indonesia',
    region: 'asia',
    image: '/images/countries/indonesia/indonesia-1.webp',
    currency: '$',
    countryKey: 'indonesia'
  },
  {
    id: '2',
    name: 'Interlaken',
    country: 'Switzerland',
    region: 'europe',
    image: '/images/countries/switzerland/switzerland-1.webp',
    currency: '$',
    countryKey: 'switzerland'
  },
  {
    id: '3',
    name: 'Jaipur',
    country: 'India',
    region: 'asia',
    image: '/images/countries/india/india-1.webp',
    currency: '$',
    countryKey: 'india'
  },
  {
    id: '4',
    name: 'Malé Atoll',
    country: 'Maldives',
    region: 'asia',
    image: '/images/countries/maldives/maldives-1.webp',
    currency: '$',
    countryKey: 'maldives'
  },
  {
    id: '5',
    name: 'Maasai Mara',
    country: 'Kenya',
    region: 'africa',
    image: '/images/countries/kenya/kenya-1.webp',
    currency: '$',
    countryKey: 'kenya'
  },
  {
    id: '6',
    name: 'Santorini',
    country: 'Greece',
    region: 'europe',
    image: '/images/countries/greece/greece-1.webp',
    currency: '$',
    countryKey: 'greece'
  },
  {
    id: '7',
    name: 'Grand Canyon',
    country: 'USA',
    region: 'americas',
    image: '/images/countries/usa/usa-1.webp',
    currency: '$',
    countryKey: 'usa'
  },
  {
    id: '8',
    name: 'Queenstown',
    country: 'New Zealand',
    region: 'oceania',
    image: '/images/countries/newzealand/newzealand-1.webp',
    currency: '$',
    countryKey: 'newzealand'
  }
]

export const popularDestinationsDb: PopularDestination[] = popularDestinationSeeds.map(
  ({ countryKey, ...seed }): PopularDestination => {
    const countryPackages = tourPackagesDb.filter(tourPackage => tourPackage.country === countryKey)

    return {
      ...seed,
      packageCount: countryPackages.length,
      startingPrice: Math.min(...countryPackages.map(tourPackage => tourPackage.price))
    }
  }
)

export const recommendedPackagesDb: RecommendedPackage[] = [
  {
    id: '1',
    src: '/images/countries/japan/japan-1.webp',
    alt: 'Japan travel package',
    className: 'col-span-2 ',
    country: 'Japan: Timeless Beauty Unfolds',
    startingFromLabel: '8 Days/7 Nights',
    slug: 'kyoto-temple-discovery'
  },
  {
    id: '2',
    src: '/images/countries/switzerland/switzerland-2.webp',
    alt: 'Switzerland travel package',
    className: 'row-span-2 col-span-2',
    country: 'Switzerland: Where Mountains Meet Magic',
    startingFromLabel: '7 Days/6 Nights',
    slug: 'swiss-alps-adventure'
  },
  {
    id: '3',
    src: '/images/countries/indonesia/indonesia-1.webp',
    alt: 'Indonesia travel package',
    className: 'col-span-2 ',
    country: 'Indonesia: Where Serenity Lives',
    startingFromLabel: '6 Days/5 Nights',
    slug: 'bali-island-escape'
  },
  {
    id: '4',
    src: '/images/countries/kenya/kenya-1.webp',
    alt: 'Kenya travel package',
    className: '',
    country: 'Kenya: Safari Awaits',
    startingFromLabel: '6 Days/5 Nights',
    slug: 'kenya-safari-explorer'
  },
  {
    id: '5',
    src: '/images/countries/maldives/maldives-3.webp',
    alt: 'Maldives travel package',
    className: '',
    country: 'Maldives: Tropical Paradise',
    startingFromLabel: '5 Days/4 Nights',
    slug: 'maldives-honeymoon-bliss'
  },
  {
    id: '6',
    src: '/images/countries/uae/uae-1.webp',
    alt: 'Dubai travel package',
    className: 'col-span-2 ',
    country: 'Dubai: City of Wonders',
    startingFromLabel: '4 Days/3 Nights',
    slug: 'dubai-luxury-city-break'
  }
]

export const testimonialsDb: Testimonial[] = [
  {
    id: '1',
    name: 'Olivia Sparks',
    location: 'Austin, USA',
    avatar: '/images/avatars/avatar-1.webp',
    quote: 'Our Bali trip was flawlessly planned — every detail felt handpicked just for us.'
  },
  {
    id: '2',
    name: 'Howard Lloyd',
    location: 'Manchester, UK',
    avatar: '/images/avatars/avatar-6.webp',
    quote: 'The Swiss Alps package exceeded expectations. Support was quick and genuinely helpful.'
  },
  {
    id: '3',
    name: 'Hallie Richards',
    location: 'Toronto, Canada',
    avatar: '/images/avatars/avatar-5.webp',
    quote: 'Booking the Maldives honeymoon package here was the best decision we made.'
  },
  {
    id: '4',
    name: 'Liam Walton',
    location: 'Dublin, Ireland',
    avatar: '/images/avatars/avatar-8.webp',
    quote: 'From airport pickup to hotel check-in, everything was smooth and stress-free.'
  },
  {
    id: '5',
    name: 'Maya Fernandez',
    location: 'Madrid, Spain',
    avatar: '/images/avatars/avatar-9.webp',
    quote: 'The itinerary balanced adventure and rest perfectly. We loved every single day.'
  },
  {
    id: '6',
    name: 'Noah Bennett',
    location: 'Seattle, USA',
    avatar: '/images/avatars/avatar-10.webp',
    quote: 'Great communication, fair pricing, and amazing local experiences we would have missed otherwise.'
  },
  {
    id: '7',
    name: 'Chloe Martin',
    location: 'Paris, France',
    avatar: '/images/avatars/avatar-9.webp',
    quote: 'Our family trip to Kenya was unforgettable. The safari arrangements were world-class.'
  },
  {
    id: '8',
    name: 'Arjun Mehta',
    location: 'Bengaluru, India',
    avatar: '/images/avatars/avatar-1.webp',
    quote: 'They suggested destinations based on our budget and still made it feel premium.'
  },
  {
    id: '9',
    name: 'Sofia Rossi',
    location: 'Milan, Italy',
    avatar: '/images/avatars/avatar-4.webp',
    quote: 'Super responsive team and thoughtful recommendations. We are already planning our next trip.'
  },
  {
    id: '10',
    name: 'Ethan Brooks',
    location: 'Cape Town, South Africa',
    avatar: '/images/avatars/avatar-2.webp',
    quote: 'The booking process was simple, transparent, and fast. Zero surprises, only great memories.'
  }
]

export const faqsDb: Faq[] = [
  {
    id: '1',
    question: 'How do I book a tour package?',
    answer:
      'Browse our tour packages, pick the one that suits you, and click "Book Now" to complete your reservation online. You will receive a confirmation email with your itinerary right away.'
  },
  {
    id: '2',
    question: 'Can I customize a tour package?',
    answer:
      'Yes, most packages can be tailored to your preferences — from adding extra nights to changing activities. Contact our support team and we will help you build the perfect itinerary.'
  },
  {
    id: '3',
    question: 'What is your cancellation policy?',
    answer:
      'You can cancel or reschedule up to 7 days before departure for a full refund. Cancellations made within 7 days are subject to a partial refund based on the package terms.'
  },
  {
    id: '4',
    question: 'Are flights included in the package price?',
    answer:
      'Flights are included for select international packages and clearly marked on the package details page. For all other packages, flights can be added during checkout.'
  },
  {
    id: '5',
    question: 'Is travel insurance included?',
    answer:
      'Basic travel insurance is included with every booking. You can upgrade to comprehensive coverage for an additional fee during the booking process.'
  },
  {
    id: '6',
    question: 'Do I need a visa for international packages?',
    answer:
      'Visa requirements depend on your destination and nationality. Our team shares visa guidance during booking, but you are responsible for arranging the required documents.'
  },
  {
    id: '7',
    question: 'Can I pay in installments?',
    answer:
      'Yes, select packages support installment payments. Pay a booking deposit upfront and settle the remaining balance before your departure date.'
  },
  {
    id: '8',
    question: 'What happens if my flight gets delayed?',
    answer:
      'Our support team monitors your itinerary and will adjust transfers or hotel check-ins automatically if your flight is delayed, at no extra cost.'
  },
  {
    id: '9',
    question: 'Do you offer group discounts?',
    answer:
      'Groups of 6 or more travelers qualify for special pricing on most packages. Reach out to our support team for a custom group quote.'
  },
  {
    id: '10',
    question: 'How can I contact support during my trip?',
    answer:
      '24/7 support is available via chat, phone, and email while you are traveling. Your itinerary email includes direct contact details for your trip coordinator.'
  }
]
