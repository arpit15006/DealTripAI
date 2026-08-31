'use client'

// React Imports
import { useMemo } from 'react'

// Next Imports
import { notFound } from 'next/navigation'

// Type Imports
import type { PackageDetail } from '@/types/packages/package-detail-types'

// Component Imports
import { Separator } from '@/components/ui/separator'
import BookingForm from '@/views/packages/package-details/booking-form'
import ImportantInfo from '@/views/packages/package-details/important-info'
import PackageGallery from '@/views/packages/package-details/package-gallery'
import PackageHeader from '@/views/packages/package-details/package-header'
import PackageHighlights from '@/views/packages/package-details/package-highlights'
import PackageItinerary from '@/views/packages/package-details/package-itinerary'
import PackagePolicies from '@/views/packages/package-details/package-policies'
import PackageReviews from '@/views/packages/package-details/package-reviews'
import ServicesComparison from '@/views/packages/package-details/services-comparison'
import TripInformation from '@/views/packages/package-details/trip-information'

// Store Imports
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

// Utils Imports
import { buildPackageDetail } from '@/utils/build-package-detail'

type PackageDetailsViewProps = {
  slug: string
  initialPackageDetail: PackageDetail | null
}

const PackageDetailsView = ({ slug, initialPackageDetail }: PackageDetailsViewProps) => {
  const tourPackage = useTourPackagesStore(state =>
    state.items.find(item => item.slug === slug && item.isPublished !== false)
  )

  const packageDetail = useMemo(
    () => (tourPackage ? buildPackageDetail(tourPackage) : initialPackageDetail),
    [tourPackage, initialPackageDetail]
  )

  if (!packageDetail) {
    notFound()
  }

  return (
    <div className='mx-auto flex w-full max-w-360 min-w-0 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8'>
      <PackageGallery images={packageDetail.gallery} />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='flex flex-col gap-6 lg:col-span-2'>
          <PackageHeader packageDetail={packageDetail} />
          <PackageHighlights packageDetail={packageDetail} />
          <TripInformation tripInformation={packageDetail.tripInformation} />
          <Separator />
          <PackageItinerary itinerary={packageDetail.itinerary} packageTitle={packageDetail.title} />
        </div>
        <div className='lg:col-span-1'>
          <BookingForm packageDetail={packageDetail} />
        </div>
      </div>

      <Separator />

      <PackageReviews
        packageSlug={packageDetail.slug}
        packageTitle={packageDetail.title}
        testimonials={packageDetail.testimonials}
      />

      <Separator />

      <ServicesComparison
        includedServices={packageDetail.includedServices}
        excludedServices={packageDetail.excludedServices}
      />

      <Separator />

      <ImportantInfo sections={packageDetail.importantInfo} />

      <Separator />

      <PackagePolicies packageDetail={packageDetail} />
    </div>
  )
}

export default PackageDetailsView
