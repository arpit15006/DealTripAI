// Next Imports
import { notFound } from 'next/navigation'

// Component Imports
import PolicyStudio from '@/views/dealtrip/merchants/policy-studio'

// Lib Imports
import { allMerchants } from '@/lib/dealtrip/service'

export const dynamic = 'force-dynamic'

const PolicyStudioPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const merchant = (await allMerchants()).find(m => m.slug === slug || m.id === slug)

  if (!merchant) notFound()

  return <PolicyStudio merchant={merchant} />
}

export default PolicyStudioPage
