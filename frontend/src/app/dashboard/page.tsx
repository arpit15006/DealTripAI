// Component Imports
import Overview from '@/views/dealtrip/overview'

// Lib Imports
import { llmConfigured } from '@/lib/dealtrip/llm'
import { razorpayConfigured } from '@/lib/dealtrip/razorpay'
import { allMerchants } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'

export const metadata = { title: 'Overview · DealTrip' }
export const dynamic = 'force-dynamic'

const DashboardPage = async () => {
  const store = await getStore()
  const [merchants, negotiations] = await Promise.all([allMerchants(), store.listNegotiations(12)])

  return (
    <Overview
      negotiations={negotiations}
      health={{
        ok: true,
        persistence:
          store.kind === 'postgres' ? 'postgres' : 'in-memory (DATABASE_URL unset or unreachable)',
        language_model: llmConfigured()
          ? { configured: true, model: process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b' }
          : { configured: false, note: 'Agents run on the deterministic planner.' },
        payments: razorpayConfigured()
          ? {
              configured: true,
              mode: (process.env.RAZORPAY_KEY_ID ?? '').startsWith('rzp_test') ? 'test' : 'live'
            }
          : { configured: false, note: 'Orders are simulated locally.' },
        marketplace: {
          merchants: merchants.length,
          destinations: [...new Set(merchants.map(m => m.destination))]
        }
      }}
    />
  )
}

export default DashboardPage
