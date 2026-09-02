'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Third-party Imports
import { ArrowLeftIcon, ArrowRightIcon, BanIcon, CheckIcon, GavelIcon, XIcon } from 'lucide-react'

// Component Imports
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import GuardChecklist from '@/views/dealtrip/shared/guard-checklist'

// Util Imports
import { cn } from '@/lib/utils'
import { formatINR } from '@/lib/dealtrip/pricing'

import type { DeskMerchant } from '@/hooks/use-negotiation-stream'
import type { AuditEvent, GuardVerdict } from '@/lib/dealtrip/types'

/**
 * The negotiation as one interleaved tape.
 *
 * Five merchants are negotiating at the same time, and a grid of per-merchant
 * cards hides that: it shows five separate outcomes rather than one concurrent
 * market. Ordering every turn by the moment it happened puts the simultaneity
 * back, and has the side effect of making the layout immune to a merchant that
 * says one line sitting beside one that says twenty.
 */

/** Only the turns that constitute the negotiation itself. */
const NEGOTIATION_ACTIONS = new Set([
  'opening_offer',
  'revised_offer',
  'counter_request',
  'offer_authorized',
  'offer_rejected',
  'withdraw',
  'revision_declined'
])

type Detail = {
  offer_id?: string
  total_price?: number
  round?: number
  changes?: string[]
  rationale?: string
  reason?: string
  counter?: { max_price: number; message: string }
  kept_price?: number
}

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

const Tape = ({
  audit,
  merchants,
  verdictFor,
  working,
  selected
}: {
  audit: AuditEvent[]
  merchants: DeskMerchant[]
  verdictFor: (offerId: string) => GuardVerdict | null
  working: boolean

  /** When set, show only this merchant's side of the negotiation. */
  selected: string | null
}) => {
  const end = useRef<HTMLDivElement>(null)

  const rows = audit
    .filter(e => NEGOTIATION_ACTIONS.has(e.action))

    // Counters and guard rulings both carry the merchant they concern, so one
    // filter isolates a complete thread rather than only that merchant's turns.
    .filter(e => !selected || e.merchant_id === selected)

  const nameOf = (id: string | null) => merchants.find(m => m.id === id)?.name ?? 'Merchant'

  // Follow the tape while it is still running, but leave the reader alone once
  // it has finished so they can scroll back without being yanked forward.
  useEffect(() => {
    if (working && !selected) end.current?.scrollIntoView({ block: 'nearest' })
  }, [rows.length, working, selected])

  if (rows.length === 0)
    return (
      <p className='text-muted-foreground px-1 py-8 text-center text-sm'>
        Nothing from this merchant yet.
      </p>
    )

  return (
    <ol className='divide-border/60 divide-y'>
      {rows.map(event => {
        const d = (event.detail ?? {}) as Detail
        const merchant = nameOf(event.merchant_id)

        /* ── The desk pushing back ── */
        if (event.action === 'counter_request')
          return (
            <Row key={event.id} at={event.ts} party='Desk' tone='desk' icon={<ArrowLeftIcon className='size-3' aria-hidden />}>
              <p className='text-xs leading-relaxed'>
                <span className='font-medium'>
                  {merchant}: beat {d.counter ? formatINR(d.counter.max_price) : 'the leader'}
                </span>
              </p>
              {d.counter?.message && <p className='meta mt-0.5'>{d.counter.message}</p>}
            </Row>
          )

        /* ── A merchant declining outright ── */
        if (event.action === 'withdraw')
          return (
            <Row key={event.id} at={event.ts} party={merchant} tone='out' icon={<BanIcon className='size-3' aria-hidden />}>
              <p className='text-xs leading-relaxed'>
                <span className='font-medium'>Withdrew.</span>{' '}
                <span className='text-muted-foreground'>{d.reason}</span>
              </p>
            </Row>
          )

        /* ── The desk keeping an earlier offer ── */
        if (event.action === 'revision_declined')
          return (
            <Row key={event.id} at={event.ts} party='Desk' tone='desk' icon={<GavelIcon className='size-3' aria-hidden />}>
              <p className='meta'>{event.summary}</p>
            </Row>
          )

        /* ── The guard's ruling, with the full checklist behind it ── */
        if (event.action === 'offer_authorized' || event.action === 'offer_rejected') {
          const passed = event.action === 'offer_authorized'
          const verdict = d.offer_id ? verdictFor(d.offer_id) : null

          return (
            <Row
              key={event.id}
              at={event.ts}
              party='Commerce Guard'
              tone={passed ? 'pass' : 'fail'}
              icon={passed ? <CheckIcon className='size-3' aria-hidden /> : <XIcon className='size-3' aria-hidden />}
            >
              {verdict ? (
                <Collapsible>
                  <CollapsibleTrigger className='hover:text-foreground w-full text-left text-xs leading-relaxed'>
                    <span className={cn('font-medium', passed ? 'text-green-600 dark:text-green-400' : 'text-destructive')}>
                      {passed ? 'Authorized' : 'Blocked'}
                    </span>{' '}
                    <span className='text-muted-foreground'>
                      {event.summary.replace(/^Offer (authorized|blocked)[\s.,:-]*/i, '')}
                    </span>
                    <span className='meta ml-1 underline underline-offset-2'>
                      {verdict.checks.length} checks
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className='mt-1.5'>
                    <GuardChecklist verdict={verdict} />
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <p className='text-xs leading-relaxed'>{event.summary}</p>
              )}
            </Row>
          )
        }

        /* ── A merchant's offer ── */
        const opening = event.action === 'opening_offer'

        return (
          <Row key={event.id} at={event.ts} party={merchant} tone='merchant' icon={<ArrowRightIcon className='size-3' aria-hidden />}>
            <p className='flex flex-wrap items-baseline gap-x-2'>
              <span className='price-sm'>{d.total_price ? formatINR(d.total_price) : '—'}</span>
              <span className='meta'>{opening ? 'opening offer' : `revision ${d.round ?? ''}`.trim()}</span>
            </p>
            {d.rationale && <p className='text-muted-foreground mt-0.5 text-xs leading-relaxed italic'>&ldquo;{d.rationale}&rdquo;</p>}
            {d.changes && d.changes.length > 0 && (
              <ul className='meta mt-1 flex flex-col gap-0.5'>
                {d.changes.map(c => (
                  <li key={c}>· {c}</li>
                ))}
              </ul>
            )}
          </Row>
        )
      })}
      <div ref={end} />
    </ol>
  )
}

const TONES = {
  desk: 'bg-primary/10 text-primary',
  merchant: 'bg-muted text-muted-foreground',
  pass: 'bg-green-600/10 text-green-700 dark:text-green-400',
  fail: 'bg-destructive/10 text-destructive',
  out: 'bg-muted text-muted-foreground opacity-70'
} as const

const Row = ({
  at,
  party,
  tone,
  icon,
  children
}: {
  at: string
  party: string
  tone: keyof typeof TONES
  icon: React.ReactNode
  children: React.ReactNode
}) => (
  <li className='flex items-start gap-3 py-2.5'>
    <span className='meta w-14 shrink-0 pt-0.5 font-mono tabular-nums'>{time(at)}</span>
    <span className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full', TONES[tone])}>{icon}</span>
    <span className='w-32 shrink-0 truncate pt-0.5 text-xs font-medium' title={party}>
      {party}
    </span>
    <div className='min-w-0 flex-1'>{children}</div>
  </li>
)

export default Tape
