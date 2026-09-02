'use client'

// Third-party Imports
import { ArrowLeftIcon, ArrowRightIcon, BanIcon, CheckIcon, XIcon } from 'lucide-react'

// Util Imports
import { cn } from '@/lib/utils'
import { formatINR } from '@/lib/dealtrip/pricing'
import { ATTRIBUTE_LABELS } from '@/lib/dealtrip/types'

import type { DeskMerchant } from '@/hooks/use-negotiation-stream'

type Turn =
  | { kind: 'offer'; round: number; price: number; authorized: boolean; reason: string | null; rationale: string; changes: string[] }
  | { kind: 'counter'; round: number; cap: number; message: string; preserve: string[] }
  | { kind: 'withdrawn'; reason: string }

/**
 * A negotiation, rendered as the exchange it actually is.
 *
 * The two sides were both recorded but presented very differently: the
 * merchant's offers were expanded on the card while the desk's counter-requests
 * sat collapsed behind a disclosure triangle. That made a two-sided negotiation
 * read as a system quietly evaluating merchants — which understates what is
 * happening and, on a track about agent-to-agent commerce, understates it in
 * exactly the wrong place.
 *
 * Interleaving them by round puts the argument on screen: what was proposed,
 * what the desk said back, what the merchant changed, and what the guard ruled
 * at each step.
 */
const Exchange = ({ merchant, className }: { merchant: DeskMerchant; className?: string }) => {
  const turns: Turn[] = []

  for (const { offer, verdict } of merchant.history) {
    turns.push({
      kind: 'offer',
      round: offer.round,
      price: offer.quote.total_price,
      authorized: verdict?.authorized ?? false,
      reason: verdict && !verdict.authorized ? (verdict.violations[0]?.detail ?? null) : null,
      rationale: offer.rationale,
      changes: offer.changes_from_previous
    })
  }

  for (const { round, counter } of merchant.counters) {
    turns.push({
      kind: 'counter',
      round,
      cap: counter.max_price,
      message: counter.message,
      preserve: counter.preserve.map(a => ATTRIBUTE_LABELS[a])
    })
  }

  // A counter for round N is the desk's reply to the offer of round N-1, so it
  // sorts after that offer and before the revision it provokes.
  turns.sort((a, b) => {
    const key = (t: Turn) => (t.kind === 'counter' ? t.round - 0.5 : t.kind === 'offer' ? t.round : 99)

    return key(a) - key(b)
  })

  if (merchant.withdrawn) turns.push({ kind: 'withdrawn', reason: merchant.withdrawn })
  if (turns.length === 0) return null

  return (
    <ol className={cn('flex flex-col gap-2.5', className)}>
      {turns.map((turn, index) => {
        if (turn.kind === 'counter')
          return (
            <li key={`c${index}`} className='flex gap-2.5'>
              <Party icon={<ArrowLeftIcon className='size-3' aria-hidden />} label='Desk' tone='desk' />
              <div className='min-w-0 flex-1'>
                <p className='text-xs leading-relaxed'>
                  <span className='font-medium'>Beat {formatINR(turn.cap)}.</span>{' '}
                  <span className='text-muted-foreground'>{turn.message}</span>
                </p>
                {turn.preserve.length > 0 && (
                  <p className='meta mt-0.5'>Must survive: {turn.preserve.join(', ')}</p>
                )}
              </div>
            </li>
          )

        if (turn.kind === 'withdrawn')
          return (
            <li key={`w${index}`} className='flex gap-2.5'>
              <Party icon={<BanIcon className='size-3' aria-hidden />} label={merchant.name} tone='out' />
              <p className='text-muted-foreground min-w-0 flex-1 text-xs leading-relaxed'>
                <span className='text-foreground font-medium'>Withdrew.</span> {turn.reason}
              </p>
            </li>
          )

        return (
          <li key={`o${index}`} className='flex gap-2.5'>
            <Party
              icon={<ArrowRightIcon className='size-3' aria-hidden />}
              label={merchant.name}
              tone={turn.authorized ? 'merchant' : 'blocked'}
            />
            <div className='min-w-0 flex-1'>
              <p className='flex flex-wrap items-baseline gap-x-2 text-xs'>
                <span className='price-sm'>{formatINR(turn.price)}</span>
                <span className='meta'>{turn.round === 0 ? 'opening offer' : `revision ${turn.round}`}</span>
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-xs font-medium',
                    turn.authorized ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                  )}
                >
                  {turn.authorized ? <CheckIcon className='size-3' aria-hidden /> : <XIcon className='size-3' aria-hidden />}
                  {turn.authorized ? 'authorized' : 'blocked'}
                </span>
              </p>

              {!turn.authorized && turn.reason && (
                <p className='text-destructive/90 mt-0.5 text-xs leading-relaxed'>{turn.reason}</p>
              )}

              {turn.rationale && (
                <p className='text-muted-foreground mt-0.5 text-xs leading-relaxed italic'>
                  &ldquo;{turn.rationale}&rdquo;
                </p>
              )}

              {turn.changes.length > 0 ? (
                <ul className='meta mt-1 flex flex-col gap-0.5'>
                  {turn.changes.map(change => (
                    <li key={change}>· {change}</li>
                  ))}
                </ul>
              ) : (
                turn.round > 0 && <p className='meta mt-1'>· Held its offer unchanged</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

const TONES = {
  desk: 'bg-primary/10 text-primary',
  merchant: 'bg-muted text-muted-foreground',
  blocked: 'bg-destructive/10 text-destructive',
  out: 'bg-muted text-muted-foreground opacity-60'
} as const

const Party = ({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: keyof typeof TONES }) => (
  <span className='flex w-20 shrink-0 flex-col items-start gap-1 pt-0.5'>
    <span className={cn('flex size-5 items-center justify-center rounded-full', TONES[tone])}>{icon}</span>
    <span className='meta leading-tight'>{label.split(' ').slice(0, 2).join(' ')}</span>
  </span>
)

export default Exchange
