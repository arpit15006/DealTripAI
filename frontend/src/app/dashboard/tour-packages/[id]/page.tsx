// Component Imports
import PackageDetailsView from '@/views/apps/tour-packages/package-details'

type PackageDetailsPageProps = {
  params: Promise<{ id: string }>
}

const PackageDetailsPage = async ({ params }: PackageDetailsPageProps) => {
  const { id } = await params

  return <PackageDetailsView packageId={id} />
}

export default PackageDetailsPage
