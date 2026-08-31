import { llmConfigured } from '@/lib/dealtrip/llm'
import { razorpayConfigured } from '@/lib/dealtrip/razorpay'
import { allMerchants, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * What is actually wired up right now.
 *
 * Surfaced rather than hidden: a demo that silently falls back to simulated
 * payments or a deterministic planner and lets you believe otherwise is worse
 * than one that says so.
 */
export const GET = async () => {
  const store = await getStore()
  const merchants = await allMerchants()

  return json({
    ok: true,
    persistence: store.kind === 'postgres' ? 'postgres' : 'in-memory (DATABASE_URL unset or unreachable)',
    language_model: llmConfigured()
      ? { configured: true, model: process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b' }
      : { configured: false, note: 'Agents run on the deterministic planner.' },
    payments: razorpayConfigured()
      ? { configured: true, mode: (process.env.RAZORPAY_KEY_ID ?? '').startsWith('rzp_test') ? 'test' : 'live' }
      : { configured: false, note: 'Orders are simulated locally and clearly labelled as such.' },
    marketplace: {
      merchants: merchants.length,
      destinations: [...new Set(merchants.map(m => m.destination))]
    }
  })
}
