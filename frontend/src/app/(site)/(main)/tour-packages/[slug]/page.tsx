// Next Imports
import type { Metadata } from 'next'

// Component Imports
import PackageDetailsView from '@/views/packages/package-details'

// Data Imports
import { getPackageDetailData } from '@/app/server/actions'

type PackageDetailsPageProps = {
  params: Promise<{ slug: string }>
}

export const generateMetadata = async ({ params }: PackageDetailsPageProps): Promise<Metadata> => {
  const { slug } = await params
  const packageDetail = await getPackageDetailData(slug)

  if (!packageDetail) return {}

  return {
    title: packageDetail.seoTitle || packageDetail.title,
    description: packageDetail.seoDescription || packageDetail.tripInformation.replace(/<[^>]+>/g, '').slice(0, 160)
  }
}

const PackageDetailsPage = async ({ params }: PackageDetailsPageProps) => {
  const { slug } = await params
  const packageDetail = await getPackageDetailData(slug)

  return <PackageDetailsView slug={slug} initialPackageDetail={packageDetail} />
}

export default PackageDetailsPage
