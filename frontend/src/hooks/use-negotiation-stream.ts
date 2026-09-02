'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Type Imports
import type { DeskEvent } from '@/lib/dealtrip/orchestrator'
import type { AuditEvent, CounterRequest, GuardVerdict, NegotiationStatus, Offer, RankedOffer } from '@/lib/dealtrip/types'

export interface DeskMerchant {
  id: string
  name: string
  tagline: string
  rating: number
  /** Latest offer this merchant has on the table, if any. */
  offer: Offer | null
  verdict: GuardVerdict | null
  /** Every counter the desk has sent this merchant. */
  counters: { round: number; counter: CounterRequest }[]
  withdrawn: string | null
  /** Drives the "thinking" state while we wait for a response. */
  pending: boolean
}

export interface DeskState {
  status: NegotiationStatus | 'connecting'
  merchants: DeskMerchant[]
  audit: AuditEvent[]
  ranked: RankedOffer[]
  explanation: string
  error: string | null
  /** True once the stream has closed, the run is over, successfully or not. */
  finished: boolean
}

const INITIAL: DeskState = {
  status: 'connecting',
  merchants: [],
  audit: [],
  ranked: [],
  explanation: '',
  error: null,
  finished: false
}

/**
 * Consumes the negotiation's server-sent event stream.
 *
 * Opening the stream is what runs the negotiation, and the server only runs it
 * once (a refresh or a second tab replays from the audit log) so this hook is
 * deliberately careful to open exactly one EventSource per negotiation id and
 * to close it on unmount. Under React strict mode the effect fires twice in
 * development; the ref guard means the second pass reuses the first connection
 * rather than racing it.
 */
export const useNegotiationStream = (negotiationId: string | null): DeskState => {
  const [state, setState] = useState<DeskState>(INITIAL)
  const sourceRef = useRef<EventSource | null>(null)
  const openedFor = useRef<string | null>(null)

  useEffect(() => {
    if (!negotiationId) return
    if (openedFor.current === negotiationId && sourceRef.current) return

    sourceRef.current?.close()
    setState(INITIAL)
    openedFor.current = negotiationId

    const source = new EventSource(`/api/negotiations/${negotiationId}/stream`)

    sourceRef.current = source

    source.onmessage = event => {
      let parsed: DeskEvent

      try {
        parsed = JSON.parse(event.data) as DeskEvent
      } catch {
        return
      }

      setState(previous => reduce(previous, parsed))
    }

    source.onerror = () => {
      // The server closes the stream when the run ends, which surfaces here as
      // an error. Only report it as one if we never reached a terminal state.
      source.close()
      setState(previous =>
        previous.finished || previous.ranked.length > 0
          ? { ...previous, finished: true }
          : { ...previous, finished: true, error: 'Lost connection to the deal desk.' }
      )
    }

    return () => {
      source.close()
      sourceRef.current = null
      openedFor.current = null
    }
  }, [negotiationId])

  return state
}

const reduce = (state: DeskState, event: DeskEvent): DeskState => {
  switch (event.type) {
    case 'status':
      return {
        ...state,
        status: event.status,
        finished: ['booked', 'no_deal', 'awaiting_approval', 'payment_failed'].includes(event.status)
          ? state.finished
          : state.finished
      }

    case 'merchants':
      return {
        ...state,
        merchants: event.merchants.map(m => ({
          ...m,
          offer: null,
          verdict: null,
          counters: [],
          withdrawn: null,
          pending: true
        }))
      }

    case 'offer':
      return {
        ...state,
        merchants: state.merchants.map(m =>
          m.id === event.offer.merchant_id
            ? { ...m, offer: event.offer, verdict: event.verdict, pending: false }
            : m
        )
      }

    case 'counter':
      return {
        ...state,
        merchants: state.merchants.map(m =>
          m.id === event.merchant_id
            ? { ...m, counters: [...m.counters, { round: event.round, counter: event.counter }], pending: true }
            : m
        )
      }

    case 'withdrawn':
      return {
        ...state,
        merchants: state.merchants.map(m =>
          m.id === event.merchant_id ? { ...m, withdrawn: event.reason, pending: false } : m
        )
      }

    case 'audit':
      // The replay path re-sends events we may already hold; key on id.
      return state.audit.some(e => e.id === event.event.id)
        ? state
        : { ...state, audit: [...state.audit, event.event] }

    case 'ranked':
      return {
        ...state,
        ranked: event.ranked,
        explanation: event.explanation,
        merchants: state.merchants.map(m => ({ ...m, pending: false }))
      }

    case 'error':
      return { ...state, error: event.message, finished: true }

    default:
      return state
  }
}
