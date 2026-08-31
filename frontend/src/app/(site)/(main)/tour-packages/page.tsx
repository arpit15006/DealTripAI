// Type Imports
import { TOUR_PACKAGE_CATEGORY_LIST, type TourPackageCategory } from '@/types/packages/tour-package-types'

// Component Imports
import TourPackagesView from '@/views/packages/tour-packages'

// Data Imports
import { getDestinationsData, getPublishedTourPackagesData } from '@/app/server/actions'

type TourPackagesPageProps = {
  searchParams: Promise<{ location?: string; category?: string }>
}

const isTourPackageCategory = (value: string): value is TourPackageCategory =>
  TOUR_PACKAGE_CATEGORY_LIST.includes(value as TourPackageCategory)

const TourPackagesPage = async ({ searchParams }: TourPackagesPageProps) => {
  const { location, category } = await searchParams
  const [tourPackages, destinations] = await Promise.all([getPublishedTourPackagesData(), getDestinationsData()])

  return (
    <TourPackagesView
      tourPackages={tourPackages}
      destinations={destinations}
      initialLocations={location ? [location] : undefined}
      initialCategories={category && isTourPackageCategory(category) ? [category] : undefined}
    />
  )
}

export default TourPackagesPage
