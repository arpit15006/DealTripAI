// Third-party Imports
import { format } from 'date-fns'

// Component Imports
import CheckoutView from '@/views/packages/checkout'

// Server action Imports
import { getPackageDetailData } from '@/app/server/actions'

type CheckoutPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ travelers?: string; date?: string }>
}

const CheckoutPage = async ({ params, searchParams }: CheckoutPageProps) => {
  const { slug } = await params
  const { travelers, date } = await searchParams
  const packageDetail = await getPackageDetailData(slug)

  const travelersCount = Math.min(30, Math.max(1, Number(travelers) || 1))
  const travelDate = date ?? format(new Date(), 'yyyy-MM-dd')

  return (
    <CheckoutView slug={slug} initialPackageDetail={packageDetail} travelers={travelersCount} travelDate={travelDate} />
  )
}

export default CheckoutPage
