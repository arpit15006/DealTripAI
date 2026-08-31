export type TourPackageCategory = 'beach' | 'adventure' | 'cultural' | 'honeymoon' | 'wildlife'

export const TOUR_PACKAGE_CATEGORY_LIST: TourPackageCategory[] = [
  'beach',
  'adventure',
  'cultural',
  'honeymoon',
  'wildlife'
]

export type TourPackageType = 'regular' | 'premium'

export const TOUR_PACKAGE_TYPE_LIST: TourPackageType[] = ['regular', 'premium']

export const COUNTRY_NAMES: Record<string, string> = {
  indonesia: 'Indonesia',
  switzerland: 'Switzerland',
  india: 'India',
  maldives: 'Maldives',
  kenya: 'Kenya',
  greece: 'Greece',
  newzealand: 'New Zealand',
  japan: 'Japan',
  uae: 'UAE',
  chile: 'Chile',
  thailand: 'Thailand',
  canada: 'Canada',
  australia: 'Australia',
  russia: 'Russia',
  usa: 'USA'
}

export interface TourPackageItineraryDay {
  day: number
  title: string
  summary: string
  activities: string[]
}

export interface TourPackage {
  id: string
  slug: string
  title: string
  category: TourPackageCategory
  packageType: TourPackageType
  location: string
  days: number
  nights: number
  price: number
  rating: number
  reviewCount: number
  country: string
  images: string[]
  tripInformation?: string
  isRecommended?: boolean
  isTrending?: boolean
  isPublished?: boolean
  discountPercent?: number
  inclusions?: string[]
  exclusions?: string[]
  tripHighlights?: string[]
  itinerary?: TourPackageItineraryDay[]
  availableDates?: string[]
  maxMembers?: number
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
}

export type CreateTourPackageInput = Omit<TourPackage, 'id' | 'slug' | 'rating' | 'reviewCount'>

export type UpdateTourPackageInput = CreateTourPackageInput & { id: string }
