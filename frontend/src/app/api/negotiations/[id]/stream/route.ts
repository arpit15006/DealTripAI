import { runNegotiation } from '@/lib/dealtrip/orchestrator'
import { allMerchants, fail } from '@/lib/dealtrip/service'
import { getStore } from '@/lib/dealtrip/store'

import type { DeskEvent } from '@/lib/dealtrip/orchestrator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Server-sent events for the Live Deal Desk.
 *
 * Opening this stream is what actually runs the negotiation, but only once.
 * A reconnect, a refresh, or a second tab replays what already happened from
 * the audit log instead of re-running the whole thing, so a page reload cannot
 * quietly start a second negotiation against the same merchants.
 */
export const GET = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const store = await getStore()
  const negotiation = await store.getNegotiation(id)

  if (!negotiation) return fail(404, 'Negotiation not found.')

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false

      const send = (event: DeskEvent) => {
        if (closed) return

        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        } catch {
          closed = true
        }
      }

      const close = () => {
        if (closed) return
        closed = true

        try {
          controller.close()
        } catch {
          /* already closed by the client */
        }
      }

      request.signal.addEventListener('abort', () => {
        closed = true
      })

      try {
        if (negotiation.status === 'extracting') {
          // Claim the run before any await, so a double-open cannot double-run.
          await store.updateNegotiation(id, { status: 'discovering' })

          const merchants = await allMerchants()

          await runNegotiation({
            negotiation: { ...negotiation, status: 'discovering' },
            merchants,
            store,
            onEvent: send
          })
        } else {
          // Replay: same event shapes, so the client needs no special case.
          const events = await store.listAudit(id)

          for (const event of events) send({ type: 'audit', event })

          const state = await fetch(new URL(`/api/negotiations/${id}`, request.url), {
            headers: { cookie: request.headers.get('cookie') ?? '' }
          }).then(r => r.json() as Promise<{ ranked: unknown; explanation: string }>)

          send({
            type: 'ranked',
            ranked: state.ranked as never,
            explanation: state.explanation
          })
          send({ type: 'status', status: negotiation.status })
        }
      } catch (error) {
        console.error('[dealtrip] negotiation failed', error)
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'The negotiation could not be completed.'
        })
      } finally {
        send({ type: 'status', status: (await store.getNegotiation(id))?.status ?? 'no_deal' })
        close()
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
