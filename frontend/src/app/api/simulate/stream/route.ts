import { runSimulation } from '@/lib/dealtrip/simulator'
import { allMerchants, fail } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'

import type { SimulationTick } from '@/lib/dealtrip/simulator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * The revenue simulation, streamed as it runs.
 *
 * A few hundred negotiations take long enough that a spinner tells the viewer
 * nothing about whether anything is happening — or whether the numbers at the
 * end were arrived at honestly. Streaming each traveller's outcome as it is
 * decided means the result is watched being computed rather than simply
 * asserted, and the running totals in every tick are the same ones the final
 * summary is built from.
 */
export const GET = async (request: Request) => {
  const url = new URL(request.url)
  const intents = Math.min(1000, Math.max(10, Number(url.searchParams.get('intents') ?? 200)))
  const destination = (url.searchParams.get('destination') ?? 'Goa').slice(0, 60)
  const seed = Number(url.searchParams.get('seed') ?? 42)

  const merchants = await allMerchants()

  if (!merchants.some(m => m.destination.toLowerCase() === destination.toLowerCase()))
    return fail(400, `No merchants sell in ${destination}.`, {
      available: [...new Set(merchants.map(m => m.destination))]
    })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false

      const send = (event: Record<string, unknown>) => {
        if (closed) return

        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        } catch {
          closed = true
        }
      }

      request.signal.addEventListener('abort', () => {
        closed = true
      })

      const started = Date.now()

      send({
        type: 'start',
        intents,
        destination,
        seed,
        merchants: merchants
          .filter(m => m.destination.toLowerCase() === destination.toLowerCase())
          .map(m => m.name)
      })

      try {
        // Yield to the event loop periodically so ticks actually reach the
        // client while the run proceeds, rather than arriving in one burst.
        let sinceBreath = 0

        const result = await runSimulation(merchants, { intents, destination, seed }, async (tick: SimulationTick) => {
          send({ type: 'tick', tick })

          if (++sinceBreath >= 5) {
            sinceBreath = 0
            await new Promise(resolve => setTimeout(resolve, 0))
          }
        })

        const store = await getStore()

        await store.saveSimulation({
          id: `sim_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
          created_at: new Date().toISOString(),
          config: { intents, destination, seed },
          result: result as unknown as Record<string, unknown>
        })

        send({ type: 'done', result: { ...result, runtime_ms: Date.now() - started } })
      } catch (error) {
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'The simulation failed.'
        })
      } finally {
        if (!closed) {
          closed = true

          try {
            controller.close()
          } catch {
            /* client already gone */
          }
        }
      }
    }
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no'
    }
  })
}
