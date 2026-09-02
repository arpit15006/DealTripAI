// Component Imports
import RevenueSimulator from '@/views/dealtrip/simulator'

// Lib Imports
import { allMerchants } from '@/lib/dealtrip/service'

export const metadata = { title: 'Revenue simulator · DealTrip' }
export const dynamic = 'force-dynamic'

const SimulatorPage = async () => {
  const merchants = await allMerchants()

  return <RevenueSimulator destinations={[...new Set(merchants.map(m => m.destination))]} />
}

export default SimulatorPage
