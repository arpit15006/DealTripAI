'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { ArrowRightIcon, BanIcon, CircleAlertIcon, Loader2Icon, PlayIcon, ScrollTextIcon, StarIcon, TrophyIcon } from 'lucide-react'

// Component Imports
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AgentJudgment from '@/views/dealtrip/shared/agent-judgment'
import GuardChecklist from '@/views/dealtrip/shared/guard-checklist'
import PropertyImage from '@/views/dealtrip/shared/property-image'
import ScoreBreakdown from '@/views/dealtrip/shared/score-breakdown'

// Util Imports
import { cn } from '@/lib/utils'

// Lib Imports
import { ApiError, getNegotiation } from '@/lib/dealtrip/client'
import { formatStay } from '@/lib/dealtrip/dates'
import { formatINR } from '@/lib/dealtrip/pricing'
import { ATTRIBUTE_LABELS } from '@/lib/dealtrip/vocabulary'

import type { NegotiationState } from '@/lib/dealtrip/client'
import type { Attribute } from '@/lib/dealtrip/vocabulary'

type Props = {
  negotiationId: string

  /**
   * Rendered on the server so the page arrives with the deals already in it.
   * The client refetch below only matters if the user lands here while a
   * negotiation is still finishing.
   */
  initialState: NegotiationState
}

const DealComparison = ({ negotiationId, initialState }: Props) => {
  const [state, setState] = useState<NegotiationState | null>(initialState)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialState.negotiation.status !== 'ranked') return

    getNegotiation(negotiationId)
      .then(setState)
      .catch(e => setError(e instanceof ApiError ? e.message : 'Could not load this negotiation.'))
  }, [negotiationId, initialState.negotiation.status])

  if (error) {
    return (
      <div className='mx-auto w-full max-w-5xl px-4 py-10 sm:px-6'>
        <Alert variant='destructive'>
          <CircleAlertIcon />
          <AlertTitle>Could not load this negotiation</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!state) {
    return (
      <div className='text-muted-foreground flex flex-col items-center gap-2 py-24 text-sm'>
        <Loader2Icon className='size-5 animate-spin' />
        Loading the deals…
      </div>
    )
  }

  const { ranked, explanation, negotiation } = state
  const eligible = ranked.filter(r => r.score.eligible)
  const rejected = ranked.filter(r => !r.score.eligible)
  const winner = eligible[0] ?? null

  const required = (Object.entries(negotiation.intent.requirements) as [Attribute, string][])
    .filter(([, s]) => s === 'required')
    .map(([a]) => a)

  const preferred = (Object.entries(negotiation.intent.requirements) as [Attribute, string][])
    .filter(([, s]) => s === 'preferred')
    .map(([a]) => a)

  const imageFor = (merchantId: string) => state.merchants.find(m => m.id === merchantId)?.image ?? ''

  /** The audit event that produced a given offer, for the agent-vs-planner view. */
  const originOf = (offerId: string) =>
    state.audit.find(
      e =>
        (e.action === 'opening_offer' || e.action === 'revised_offer') &&
        (e.detail as { offer_id?: string }).offer_id === offerId
    ) ?? null

  const openingOf = (merchantId: string) =>
    state.offers.filter(o => o.merchant_id === merchantId).sort((a, b) => a.round - b.round)[0] ?? null

  return (
    <div className='mx-auto w-full max-w-5xl px-4 py-8 sm:px-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight'>The deals on the table</h1>
          <p className='text-muted-foreground text-sm'>
            {negotiation.intent.duration_nights} nights in {negotiation.intent.destination} for{' '}
            {negotiation.intent.travelers}, up to {formatINR(negotiation.intent.budget.max)}
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' nativeButton={false} render={<Link href={`/deal/${negotiationId}/replay`} />}>
            <PlayIcon />
            Replay
          </Button>
          <Button variant='outline' size='sm' nativeButton={false} render={<Link href={`/deal/${negotiationId}/timeline`} />}>
            <ScrollTextIcon />
            Trust Timeline
          </Button>
          <Button variant='outline' size='sm' nativeButton={false} render={<Link href={`/desk/${negotiationId}`} />}>
            Back to the desk
          </Button>
        </div>
      </div>

      {/* ── Why this one ─────────────────────────────────────────────── */}
      {winner ? (
        <Alert variant='success' className='mt-5'>
          <TrophyIcon />
          <AlertTitle>DealTrip recommends {winner.merchant.name}</AlertTitle>
          <AlertDescription>{explanation}</AlertDescription>
        </Alert>
      ) : (
        <Alert variant='warning' className='mt-5'>
          <BanIcon />
          <AlertTitle>Nothing cleared every hard constraint</AlertTitle>
          <AlertDescription>
            No merchant could deliver your must-haves within budget, so nothing is recommended and nothing was charged.
            Loosening one constraint would open the market up.
          </AlertDescription>
        </Alert>
      )}

      {/* ── At a glance ──────────────────────────────────────────────── */}
      <Card className='mt-6 gap-0 py-0'>
        <CardHeader className='px-4 py-3'>
          <CardTitle className='text-sm'>At a glance</CardTitle>
        </CardHeader>
        <div className='overflow-x-auto border-t'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='min-w-40'>Merchant</TableHead>
                <TableHead className='whitespace-nowrap'>Stay</TableHead>
                <TableHead className='text-right'>Price</TableHead>
                {required.map(a => (
                  <TableHead key={a} className='text-center whitespace-nowrap'>
                    {ATTRIBUTE_LABELS[a]}
                    <span className='text-primary ml-1'>*</span>
                  </TableHead>
                ))}
                {preferred.map(a => (
                  <TableHead key={a} className='text-center whitespace-nowrap'>
                    {ATTRIBUTE_LABELS[a]}
                  </TableHead>
                ))}
                <TableHead className='text-right'>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranked.map(row => (
                <TableRow key={row.offer.id} className={cnRow(row.rank === 1 && row.score.eligible)}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <PropertyImage
                        src={imageFor(row.merchant.id)}
                        alt={row.merchant.name}
                        fallbackLabel={row.merchant.name}
                        className='size-9 shrink-0 rounded-md text-xs'
                        sizes='36px'
                      />
                      {row.rank === 1 && row.score.eligible && <TrophyIcon className='text-primary size-3.5' />}
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium'>{row.merchant.name}</p>
                        <p className='text-muted-foreground truncate text-xs'>{row.merchant.tagline}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-muted-foreground text-xs whitespace-nowrap'>
                    {formatStay(row.offer.quote.check_in, row.offer.quote.nights)}
                    {row.offer.quote.weekend_nights > 0 && (
                      <span className='ml-1'>· {row.offer.quote.weekend_nights} wknd</span>
                    )}
                  </TableCell>
                  <TableCell className='text-right font-medium tabular-nums'>
                    {formatINR(row.offer.quote.total_price)}
                  </TableCell>
                  {[...required, ...preferred].map(a => (
                    <TableCell key={a} className='text-center'>
                      {row.offer.quote.attributes.includes(a) ? (
                        <span className='text-green-600 dark:text-green-400'>✓</span>
                      ) : (
                        <span className='text-muted-foreground/50'>—</span>
                      )}
                    </TableCell>
                  ))}
                  <TableCell className='text-right'>
                    {row.score.eligible ? (
                      <span className='font-mono text-sm font-medium tabular-nums'>{row.score.total}</span>
                    ) : (
                      <Badge variant='outline' className='border-destructive/40 text-destructive h-5.5 px-2 text-xs'>
                        out
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {required.length > 0 && (
          <p className='text-muted-foreground border-t px-4 py-2 text-xs'>
            <span className='text-primary'>*</span> must-have — an offer missing it is disqualified at any price.
          </p>
        )}
      </Card>

      {/* ── Each deal in full ────────────────────────────────────────── */}
      <h2 className='mt-8 text-sm font-semibold'>Why each deal scored what it did</h2>
      <div className='mt-3 flex flex-col gap-4'>
        {eligible.map(row => {
          const opening = openingOf(row.merchant.id)
          const negotiated = opening && opening.id !== row.offer.id

          return (
            <Card
              key={row.offer.id}
              className={cn('gap-0 overflow-hidden py-0', row.rank === 1 && 'border-primary/50')}
            >
              <PropertyImage
                src={imageFor(row.merchant.id)}
                alt={`${row.merchant.name} — ${row.offer.quote.lines[0]?.label ?? 'room'}`}
                fallbackLabel={row.merchant.name}
                className='aspect-[21/9] w-full'
                sizes='(max-width: 1024px) 100vw, 900px'
                priority={row.rank === 1}
              />
              <CardHeader className='flex flex-wrap items-start justify-between gap-3 px-6 pt-5'>
                <div>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    {row.merchant.name}
                    {row.rank === 1 && (
                      <Badge className='h-5.5 gap-1 px-2 text-xs'>
                        <TrophyIcon className='size-3' />
                        Recommended
                      </Badge>
                    )}
                  </CardTitle>
                  <p className='text-muted-foreground text-xs'>{row.merchant.tagline}</p>
                </div>
                <div className='text-right'>
                  <p className='price'>{formatINR(row.offer.quote.total_price)}</p>
                  <p className='meta flex items-center justify-end gap-1'>
                    <StarIcon className='size-3 fill-current' aria-hidden />
                    {row.merchant.rating.toFixed(1)} · score {row.score.total}
                  </p>
                </div>
              </CardHeader>

              <CardContent className='flex flex-col gap-4 pb-6'>
                {negotiated && (
                  <div className='inset flex flex-wrap items-center gap-x-2 gap-y-1 text-xs'>
                    <span className='font-medium'>Negotiation won you</span>
                    <span className='font-mono tabular-nums'>
                      {formatINR(opening.quote.total_price - row.offer.quote.total_price)}
                    </span>
                    <span className='text-muted-foreground'>
                      — opened at {formatINR(opening.quote.total_price)}, settled at{' '}
                      {formatINR(row.offer.quote.total_price)} after {row.offer.round} round
                      {row.offer.round === 1 ? '' : 's'}
                      {opening.quote.check_in !== row.offer.quote.check_in
                        ? `, moving the stay from ${formatStay(opening.quote.check_in, opening.quote.nights)} to ${formatStay(row.offer.quote.check_in, row.offer.quote.nights)}.`
                        : '.'}
                    </span>
                  </div>
                )}

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='flex flex-col gap-2'>
                    <p className='text-xs font-medium'>What you get</p>
                    <ul className='text-muted-foreground'>
                      {row.offer.quote.lines.map(line => (
                        <li key={line.ref_id} className='line-item'>
                          <span>{line.label}</span>
                          <span>{formatINR(line.amount)}</span>
                        </li>
                      ))}
                      {row.offer.quote.discount_amount > 0 && (
                        <li className='line-item text-foreground mt-1 font-medium'>
                          <span>Negotiated discount ({row.offer.quote.discount_pct}%)</span>
                          <span>−{formatINR(row.offer.quote.discount_amount)}</span>
                        </li>
                      )}
                    </ul>
                    <p className='text-muted-foreground text-xs leading-relaxed'>
                      {row.offer.quote.attributes.slice(0, 8).map((a, i) => (
                        <span key={a}>
                          {i > 0 && <span className='opacity-50'> · </span>}
                          {ATTRIBUTE_LABELS[a]}
                        </span>
                      ))}
                      {row.offer.quote.attributes.length > 8 && (
                        <span className='opacity-70'> +{row.offer.quote.attributes.length - 8} more</span>
                      )}
                    </p>
                  </div>

                  <ScoreBreakdown score={row.score} />
                </div>

                <GuardChecklist verdict={row.verdict} />

                {(() => {
                  const origin = originOf(row.offer.id)

                  return origin ? <AgentJudgment event={origin} /> : null
                })()}

                <Separator />

                <Button
                  className='w-full'
                  variant={row.rank === 1 ? 'default' : 'outline'}
                  nativeButton={false}
                  render={<Link href={`/deal/${negotiationId}/checkout?offer=${row.offer.id}`} />}
                >
                  Approve and pay {formatINR(row.offer.quote.total_price)}
                  <ArrowRightIcon />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Ruled out ────────────────────────────────────────────────── */}
      {rejected.length > 0 && (
        <>
          <h2 className='mt-8 text-sm font-semibold'>Ruled out</h2>
          <div className='mt-3 flex flex-col gap-2'>
            {rejected.map(row => (
              <Card key={row.offer.id} className='gap-0 py-3'>
                <CardContent className='flex flex-wrap items-center gap-x-3 gap-y-1 px-4'>
                  <BanIcon className='text-muted-foreground size-3.5 shrink-0' />
                  <span className='text-sm font-medium'>{row.merchant.name}</span>
                  <span className='text-muted-foreground text-sm tabular-nums'>
                    {formatINR(row.offer.quote.total_price)}
                  </span>
                  <span className='text-muted-foreground flex-1 text-xs'>{row.score.ineligible_reason}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const cnRow = (highlight: boolean) => (highlight ? 'bg-primary/5' : undefined)

export default DealComparison
