'use client'

// React Imports
import { useMemo, useState } from 'react'

// Next Imports
import { useEffect, useRef } from 'react'

import Link from 'next/link'

// Third-party Imports
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon
} from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import EventFeed from '@/views/dealtrip/shared/event-feed'
import GuardChecklist from '@/views/dealtrip/shared/guard-checklist'

// Util Imports
import { cn } from '@/lib/utils'
import { formatStay } from '@/lib/dealtrip/dates'
import { formatINR } from '@/lib/dealtrip/pricing'
import { ACTOR_LABELS } from '@/lib/dealtrip/vocabulary'

import type { NegotiationView } from '@/lib/dealtrip/negotiation-state'
import type { GuardVerdict, Offer } from '@/lib/dealtrip/types'

/**
 * Negotiation Replay.
 *
 * Steps through the recorded audit trail one event at a time and reconstructs
 * what each merchant had on the table at that moment. Nothing is re-run and
 * nothing is re-derived from a model — the state at step N is a fold over the
 * first N audit events, so what you see is what was actually recorded. If the
 * replay and the Trust Timeline ever disagreed, the replay would be wrong.
 */
const NegotiationReplay = ({ state, negotiationId }: { state: NegotiationView; negotiationId: string }) => {
  const { audit, offers, ranked, negotiation } = state

  const [step, setStep] = useState(audit.length)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!playing) return

    timer.current = setInterval(() => {
      setStep(current => {
        if (current >= audit.length) {
          setPlaying(false)

          return current
        }

        return current + 1
      })
    }, 900)

    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, audit.length])

  const offerById = useMemo(() => new Map(offers.map(o => [o.id, o])), [offers])

  const verdictById = useMemo(() => {
    const map = new Map<string, GuardVerdict>()

    for (const row of ranked) map.set(row.offer.id, row.verdict)

    return map
  }, [ranked])

  const merchantName = useMemo(() => new Map(state.merchants.map(m => [m.id, m.name])), [state.merchants])

  /** Fold the first `step` events into the position each merchant held. */
  const positions = useMemo(() => {
    const board = new Map<string, { offer: Offer | null; withdrawn: string | null; blocked: boolean }>()

    for (const event of audit.slice(0, step)) {
      if (!event.merchant_id) continue

      const entry = board.get(event.merchant_id) ?? { offer: null, withdrawn: null, blocked: false }

      if (event.action === 'opening_offer' || event.action === 'revised_offer') {
        const id = event.detail?.offer_id

        entry.offer = typeof id === 'string' ? (offerById.get(id) ?? entry.offer) : entry.offer
        entry.blocked = false
      }

      if (event.action === 'offer_rejected') entry.blocked = true
      if (event.action === 'offer_authorized') entry.blocked = false
      if (event.action === 'withdraw') entry.withdrawn = event.summary

      board.set(event.merchant_id, entry)
    }

    return board
  }, [audit, step, offerById])

  const current = step > 0 ? audit[step - 1] : null

  return (
    <div className='mx-auto w-full max-w-4xl px-4 py-8 sm:px-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight'>Negotiation replay</h1>
          <p className='text-muted-foreground text-sm'>
            Step through what every merchant had on the table, event by event.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' nativeButton={false} render={<Link href={`/deal/${negotiationId}/timeline`} />}>
            Trust Timeline
          </Button>
          <Button variant='outline' size='sm' nativeButton={false} render={<Link href={`/deal/${negotiationId}`} />}>
            <ArrowLeftIcon />
            Back
          </Button>
        </div>
      </div>

      {/* ── Transport ────────────────────────────────────────────────── */}
      <Card className='mt-5'>
        <CardContent className='flex flex-col gap-3'>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='icon-sm'
              onClick={() => {
                setPlaying(false)
                setStep(0)
              }}
              aria-label='Restart'
            >
              <RotateCcwIcon />
            </Button>
            <Button
              variant='outline'
              size='icon-sm'
              disabled={step === 0}
              onClick={() => {
                setPlaying(false)
                setStep(s => Math.max(0, s - 1))
              }}
              aria-label='Previous event'
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              size='icon-sm'
              onClick={() => {
                if (step >= audit.length) setStep(0)
                setPlaying(p => !p)
              }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </Button>
            <Button
              variant='outline'
              size='icon-sm'
              disabled={step >= audit.length}
              onClick={() => {
                setPlaying(false)
                setStep(s => Math.min(audit.length, s + 1))
              }}
              aria-label='Next event'
            >
              <ChevronRightIcon />
            </Button>

            <Slider
              value={[step]}
              min={0}
              max={audit.length}
              step={1}
              className='mx-2 flex-1'
              onValueChange={next => {
                setPlaying(false)
                setStep(Array.isArray(next) ? next[0] : next)
              }}
            />

            <span className='text-muted-foreground shrink-0 font-mono text-xs tabular-nums'>
              {step} / {audit.length}
            </span>
          </div>

          {current ? (
            <div className='bg-muted/50 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border px-3 py-2'>
              <Badge variant='outline' className='h-5.5 px-2 text-xs font-normal'>
                {ACTOR_LABELS[current.actor] ?? current.actor}
              </Badge>
              <span
                className={cn('flex-1 text-sm', current.decision === 'fail' && 'text-destructive')}
              >
                {current.summary}
              </span>
            </div>
          ) : (
            <p className='text-muted-foreground px-1 text-sm'>
              Before the first event — {negotiation.intent.duration_nights} nights in{' '}
              {negotiation.intent.destination}, up to {formatINR(negotiation.intent.budget.max)}.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── The board at this moment ─────────────────────────────────── */}
      <h2 className='mt-6 text-sm font-semibold'>On the table at step {step}</h2>
      <div className='mt-3 grid gap-3 sm:grid-cols-2'>
        {[...positions.entries()].map(([merchantId, position]) => (
          <Card key={merchantId} className={cn('gap-0 py-0', position.blocked && 'border-destructive/40')}>
            <CardHeader className='px-4 py-2.5'>
              <CardTitle className='text-sm'>{merchantName.get(merchantId) ?? merchantId}</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-2 border-t px-4 py-3'>
              {position.withdrawn ? (
                <p className='text-muted-foreground text-xs'>{position.withdrawn}</p>
              ) : position.offer ? (
                <>
                  <div className='flex items-baseline justify-between gap-2'>
                    <span className='text-lg font-semibold tabular-nums'>
                      {formatINR(position.offer.quote.total_price)}
                    </span>
                    <Badge
                      variant='outline'
                      className={cn(
                        'h-5.5 px-2 text-xs font-normal',
                        position.blocked && 'border-destructive/40 text-destructive'
                      )}
                    >
                      {position.blocked ? 'blocked' : `round ${position.offer.round}`}
                    </Badge>
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {formatStay(position.offer.quote.check_in, position.offer.quote.nights)}
                  </p>
                  {verdictById.get(position.offer.id) && step >= audit.length && (
                    <GuardChecklist verdict={verdictById.get(position.offer.id)!} />
                  )}
                </>
              ) : (
                <p className='text-muted-foreground text-xs'>No offer yet.</p>
              )}
            </CardContent>
          </Card>
        ))}
        {positions.size === 0 && (
          <p className='text-muted-foreground col-span-full py-6 text-center text-sm'>
            No merchant has acted yet.
          </p>
        )}
      </div>

      {/* ── Events up to here ────────────────────────────────────────── */}
      <Card className='mt-6 gap-0 py-0'>
        <CardHeader className='px-4 py-3'>
          <CardTitle className='text-sm'>Events so far</CardTitle>
        </CardHeader>
        <CardContent className='border-t px-4 py-4'>
          <EventFeed
            events={audit.slice(0, step)}
            expandable
            emptyLabel='Press play to walk through the negotiation.'
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default NegotiationReplay
