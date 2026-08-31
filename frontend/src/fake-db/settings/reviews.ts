/**
 * ! The data below is used to seed the Reviews & Ratings store. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can replace this with your
 * ! own database queries inside the server action.
 */

// Type Imports
import type { Review } from '@/types/settings/reviews-types'

export const db: Review[] = [
  {
    id: 'review-001',
    userName: 'Olivia Sparks',
    userAvatar: '/images/avatars/avatar-1.webp',
    tourPackageTitle: 'Bali Island Escape',
    rating: 5,
    review: 'Our Bali trip was flawlessly planned — every detail felt handpicked just for us.',
    date: '2026-06-12',
    status: 'published'
  },
  {
    id: 'review-002',
    userName: 'Howard Lloyd',
    userAvatar: '/images/avatars/avatar-6.webp',
    tourPackageTitle: 'Swiss Alps Adventure',
    rating: 5,
    review: 'The Swiss Alps package exceeded expectations. Support was quick and genuinely helpful.',
    date: '2026-05-28',
    status: 'published'
  },
  {
    id: 'review-003',
    userName: 'Hallie Richards',
    userAvatar: '/images/avatars/avatar-5.webp',
    tourPackageTitle: 'Maldives Honeymoon Bliss',
    rating: 5,
    review: 'Booking the Maldives honeymoon package here was the best decision we made.',
    date: '2026-07-02',
    status: 'published'
  },
  {
    id: 'review-004',
    userName: 'Liam Walton',
    userAvatar: '/images/avatars/avatar-8.webp',
    tourPackageTitle: 'Dubai Luxury City Break',
    rating: 4,
    review: 'From airport pickup to hotel check-in, everything was smooth and stress-free.',
    date: '2026-04-19',
    status: 'published'
  },
  {
    id: 'review-005',
    userName: 'Maya Fernandez',
    userAvatar: '/images/avatars/avatar-9.webp',
    tourPackageTitle: 'Queenstown Adrenaline Rush',
    rating: 4,
    review: 'The itinerary balanced adventure and rest perfectly. We loved every single day.',
    date: '2026-07-20',
    status: 'pending'
  },
  {
    id: 'review-006',
    userName: 'Noah Bennett',
    userAvatar: '/images/avatars/avatar-10.webp',
    tourPackageTitle: 'Kyoto Temple Discovery',
    rating: 5,
    review: 'Great communication, fair pricing, and amazing local experiences we would have missed otherwise.',
    date: '2026-03-15',
    status: 'published'
  },
  {
    id: 'review-007',
    userName: 'Chloe Martin',
    userAvatar: '/images/avatars/avatar-9.webp',
    tourPackageTitle: 'Kenya Safari Explorer',
    rating: 5,
    review: 'Our family trip to Kenya was unforgettable. The safari arrangements were world-class.',
    date: '2026-06-30',
    status: 'published'
  },
  {
    id: 'review-008',
    userName: 'Arjun Mehta',
    userAvatar: '/images/avatars/avatar-1.webp',
    tourPackageTitle: 'Kerala Backwaters Bliss',
    rating: 4,
    review: 'They suggested destinations based on our budget and still made it feel premium.',
    date: '2026-07-25',
    status: 'pending'
  },
  {
    id: 'review-009',
    userName: 'Sofia Rossi',
    userAvatar: '/images/avatars/avatar-4.webp',
    tourPackageTitle: 'Santorini Sunset Getaway',
    rating: 5,
    review: 'Super responsive team and thoughtful recommendations. We are already planning our next trip.',
    date: '2026-05-08',
    status: 'published'
  },
  {
    id: 'review-010',
    userName: 'Ethan Brooks',
    userAvatar: '/images/avatars/avatar-2.webp',
    tourPackageTitle: 'Athens Ancient Wonders',
    rating: 2,
    review: 'The booking process was simple, but our travel date got shuffled without much notice.',
    date: '2026-02-11',
    status: 'rejected'
  },
  {
    id: 'review-011',
    userName: 'Grace Kim',
    userAvatar: '/images/avatars/avatar-3.webp',
    tourPackageTitle: 'Ubud Rice Terrace Retreat',
    rating: 5,
    review:
      'Waking up to the sound of the rice terraces every morning was magical. Our guide knew every hidden temple and warung worth visiting, and the villa the agency booked us into had the most incredible infinity pool. Genuinely one of the best trips of our lives.',
    date: '2026-01-22',
    status: 'published'
  },
  {
    id: 'review-012',
    userName: 'Marcus Webb',
    userAvatar: '/images/avatars/avatar-7.webp',
    tourPackageTitle: 'Zermatt Alpine Escape',
    rating: 4,
    review:
      'The views of the Matterhorn from our chalet were unbeatable and the cable car passes were sorted before we even landed. Only reason it is not five stars is the shuttle transfer ran late on day two, but the concierge sorted it quickly.',
    date: '2025-12-30',
    status: 'published'
  },
  {
    id: 'review-013',
    userName: 'Priya Nair',
    userAvatar: '/images/avatars/avatar-5.webp',
    tourPackageTitle: 'Geneva Lakeside Discovery',
    rating: 5,
    review:
      'Lake Geneva at sunset, a private boat cruise, and a chocolate-making class — this itinerary was perfectly paced.',
    date: '2026-02-04',
    status: 'published'
  },
  {
    id: 'review-014',
    userName: 'Daniel Cho',
    userAvatar: '/images/avatars/avatar-8.webp',
    tourPackageTitle: 'Taj Mahal',
    rating: 5,
    review:
      'Seeing the Taj Mahal at sunrise with almost no crowds was worth waking up at 4am for. Our local guide gave incredible historical context and the whole day felt unhurried despite covering three sites.',
    date: '2026-03-02',
    status: 'published'
  },
  {
    id: 'review-015',
    userName: 'Isla Thompson',
    userAvatar: '/images/avatars/avatar-6.webp',
    tourPackageTitle: 'Maldives Scuba & Snorkel Adventure',
    rating: 4,
    review:
      'Turtle sightings on our very first dive! The dive instructors were patient with our beginner group the whole week.',
    date: '2026-04-11',
    status: 'pending'
  },
  {
    id: 'review-016',
    userName: 'Victor Alvarez',
    userAvatar: '/images/avatars/avatar-2.webp',
    tourPackageTitle: 'Amboseli Elephant Safari',
    rating: 5,
    review:
      'Herds of elephants with Kilimanjaro in the background, morning and evening game drives, and a camp that overlooked the plains — this was the trip of a lifetime for our whole family.',
    date: '2026-05-19',
    status: 'published'
  },
  {
    id: 'review-017',
    userName: 'Freya Nilsson',
    userAvatar: '/images/avatars/avatar-4.webp',
    tourPackageTitle: 'Fiordland Wilderness Trail',
    rating: 3,
    review:
      'Milford Sound was breathtaking, but two of our planned hikes were cancelled due to weather with only a partial refund offered. The scenery when we could see it was worth the trip regardless.',
    date: '2026-01-08',
    status: 'pending'
  },
  {
    id: 'review-018',
    userName: 'Kenji Watanabe',
    userAvatar: '/images/avatars/avatar-10.webp',
    tourPackageTitle: 'Tokyo Neon Nights',
    rating: 5,
    review:
      'Shibuya crossing, an izakaya crawl with a local host, and a robot restaurant show — non-stop energy every night.',
    date: '2026-06-05',
    status: 'published'
  },
  {
    id: 'review-019',
    userName: 'Ruby Foster',
    userAvatar: '/images/avatars/avatar-9.webp',
    tourPackageTitle: 'Osaka Street Food Trail',
    rating: 4,
    review:
      'We ate our way through Dotonbori with a guide who clearly loved the city. Takoyaki, okonomiyaki, kushikatsu — every stop was a highlight, and the pace never felt rushed.',
    date: '2026-07-14',
    status: 'published'
  },
  {
    id: 'review-020',
    userName: 'Omar Farouk',
    userAvatar: '/images/avatars/avatar-1.webp',
    tourPackageTitle: 'Abu Dhabi Desert Safari',
    rating: 1,
    review:
      'Our dune bashing vehicle broke down and we waited over an hour in the heat for a replacement with no apology or compensation offered afterward.',
    date: '2025-11-27',
    status: 'rejected'
  }
]
