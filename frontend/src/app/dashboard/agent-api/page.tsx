// Next Imports
import { headers } from 'next/headers'

// Component Imports
import AgentApiReference from '@/views/dealtrip/agent-api'

export const metadata = { title: 'Agent API · DealTrip' }
export const dynamic = 'force-dynamic'

const AgentApiPage = async () => {
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000'
  const proto = headerList.get('x-forwarded-proto') ?? 'http'

  return <AgentApiReference baseUrl={`${proto}://${host}`} />
}

export default AgentApiPage
