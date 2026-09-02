// Next Imports
import { headers } from 'next/headers'

// Component Imports
import MerchantList from '@/views/dealtrip/merchants/list'

// Lib Imports
import { toAgentCommerceProfile } from '@/lib/dealtrip/profile'
import { allMerchants } from '@/lib/dealtrip/service'

export const metadata = { title: 'Merchants · DealTrip' }
export const dynamic = 'force-dynamic'

const MerchantsPage = async () => {
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000'
  const proto = headerList.get('x-forwarded-proto') ?? 'http'
  const baseUrl = `${proto}://${host}`

  const merchants = await allMerchants()

  return (
    <MerchantList
      baseUrl={baseUrl}
      merchants={merchants.map(m => ({
        ...m,
        profile_url: `${baseUrl}/api/agent/${m.slug}/profile`,
        published: toAgentCommerceProfile(m, baseUrl).negotiation
      }))}
    />
  )
}

export default MerchantsPage
