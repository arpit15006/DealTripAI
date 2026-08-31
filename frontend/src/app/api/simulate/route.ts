import { runSimulation } from '@/lib/dealtrip/simulator'
import { allMerchants, fail, json } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Revenue simulator. Synthetic demand against the live catalogs, run twice:
 * once with negotiation available and once without.
 *
 * Deterministic from its seed and run entirely on the planner, so it costs
 * nothing to run and anyone can reproduce a number by quoting the seed.
 */
export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => ({}))) as {
    intents?: number
    destination?: string
    seed?: number
  }

  const intents = Math.min(1000, Math.max(10, Math.round(body.intents ?? 200)))
  const destination = (body.destination ?? 'Goa').slice(0, 60)
  const seed = Math.round(body.seed ?? 42)

  const merchants = await allMerchants()

  if (!merchants.some(m => m.destination.toLowerCase() === destination.toLowerCase()))
    return fail(400, `No merchants sell in ${destination}.`, {
      available: [...new Set(merchants.map(m => m.destination))]
    })

  const started = Date.now()
  const result = await runSimulation(merchants, { intents, destination, seed })
  const store = await getStore()

  await store.saveSimulation({
    id: `sim_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
    config: { intents, destination, seed },
    result: result as unknown as Record<string, unknown>
  })

  return json({ ...result, runtime_ms: Date.now() - started })
}

export const GET = async () => {
  const store = await getStore()

  return json({ simulations: await store.listSimulations(10) })
}
