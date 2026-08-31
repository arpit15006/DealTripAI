/**
 * ! The data below is used to seed the Store Information store. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can replace this with your
 * ! own database queries inside the server action.
 *
 * ! `companyProfile.name` and `socialLinks` also drive the public site's `SiteHeader` /
 * ! `SiteFooter` — see `useStoreInformationStore` for the sync.
 */

// Type Imports
import type { StoreInformationSettings } from '@/types/settings/store-information-types'

export const db: StoreInformationSettings = {
  companyProfile: {
    name: 'Tourix',
    tagline: 'Unforgettable journeys, planned for you',
    description:
      'Discover handpicked tour packages, book with confidence, and manage every trip detail from itineraries to payments in one seamless travel experience.',
    logoUrl: '',
    supportEmail: 'support@tourix.com',
    supportPhone: '+14155550199',
    address: {
      street: '148 Market Street, 1847 Willow Creek Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'United States'
    }
  },
  localization: {
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    weekStart: 'sunday'
  },
  socialLinks: {
    instagram: 'https://tourix/instagram.com',
    facebook: 'https://tourix/facebook.com',
    twitter: 'https://tourix/twitter.com'
  }
}
