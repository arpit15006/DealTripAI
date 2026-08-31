export type DestinationRegion = 'asia' | 'europe' | 'africa' | 'americas' | 'oceania'

export const DESTINATION_REGION_LIST: DestinationRegion[] = ['asia', 'europe', 'africa', 'americas', 'oceania']

export const DESTINATION_REGION_LABELS: Record<DestinationRegion, string> = {
  asia: 'Asia',
  europe: 'Europe',
  africa: 'Africa',
  americas: 'Americas',
  oceania: 'Oceania'
}

export interface PopularDestination {
  id: string
  name: string
  country: string
  region: DestinationRegion
  image: string
  packageCount: number
  startingPrice: number
  currency: string
}

export interface RecommendedPackage {
  id: string
  src: string
  alt: string
  className: string
  country: string
  startingFromLabel: string
  slug: string
}

export interface SpecialOffer {
  id: string
  title: string
  discountLabel: string
  description: string
  couponCode: string
  validUntil: string
  image: string
  discountPercent: number
}

export interface Testimonial {
  id: string
  name: string
  location: string
  avatar: string
  quote: string
}

export interface Faq {
  id: string
  question: string
  answer: string
}
