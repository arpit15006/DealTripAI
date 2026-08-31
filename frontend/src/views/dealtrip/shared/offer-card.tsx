'use client'

// Third-party Imports
import { ArrowDownIcon, BanIcon, Loader2Icon, StarIcon } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import GuardChecklist from './guard-checklist'

// Util Imports
import { cn } from '@/lib/utils'
import { formatStay, weekdayName } from '@/lib/dealtrip/dates'
import { formatINR } from '@/lib/dealtrip/pricing'
import { ATTRIBUTE_LABELS } from '@/lib/dealtrip/vocabulary'

import type { Attribute } from '@/lib/dealtrip/vocabulary'
import type { DeskMerchant } from '@/hooks/use-negotiation-stream'

type Props = {
  merchant: DeskMerchant
  /** Attributes the traveller marked as must-have, for highlighting. */
  required: Attribute[]
  className?: string
}

/**
 * One merchant's position in the negotiation, as it stands right now.
 *
 * Shows the live offer, what the last round changed, and the guard's ruling. A
 * merchant that withdrew gets a card too — an absent competitor tells the
 * traveller nothing, whereas "its only beachfront room cannot legally reach
 * your budget" tells them something real about the market.
 */
const OfferCard = ({ merchant, required, className }: Props) => {
  const { offer, verdict } = merchant

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <CardHeader className='flex items-start justify-between gap-3 px-4 py-3'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold'>{merchant.name}</p>
          <p className='text-muted-foreground truncate text-xs'>{merchant.tagline}</p>
        </div>
        <Badge variant='outline' className='h-5 shrink-0 gap-1 px-1.5 text-[11px] font-normal'>
          <StarIcon className='size-3 fill-current' />
          {merchant.rating.toFixed(1)}
        </Badge>
      </CardHeader>

      <Separator />

      <CardContent className='flex flex-col gap-3 px-4 py-3'>
        {merchant.withdrawn ? (
          <div className='text-muted-foreground flex items-start gap-2 text-xs'>
            <BanIcon className='mt-0.5 size-3.5 shrink-0' />
            <span>
              <span className='text-foreground font-medium'>Withdrew.</span> {merchant.withdrawn}
            </span>
          </div>
        ) : !offer ? (
          <div className='text-muted-foreground flex items-center gap-2 py-1 text-xs'>
            <Loader2Icon className='size-3.5 animate-spin' />
            Composing an offer…
          </div>
        ) : (
          <>
            <div className='flex items-end justify-between gap-2'>
              <div>
                <p className='text-xl font-semibold tabular-nums'>{formatINR(offer.quote.total_price)}</p>
                {offer.quote.discount_pct > 0 && (
                  <p className='text-muted-foreground text-xs'>
                    <span className='line-through'>{formatINR(offer.quote.list_price)}</span>
                    <span className='ml-1.5'>−{offer.quote.discount_pct}%</span>
                  </p>
                )}
              </div>
              <div className='flex flex-col items-end gap-1'>
                <Badge variant='outline' className='h-5 px-1.5 text-[11px] font-normal'>
                  round {offer.round}
                </Badge>
                <span className='text-muted-foreground text-[11px]'>
                  {formatStay(offer.quote.check_in, offer.quote.nights)} · {weekdayName(offer.quote.check_in)} in
                </span>
              </div>
            </div>

            <ul className='text-muted-foreground flex flex-col gap-0.5 text-xs'>
              {offer.quote.lines.map(line => (
                <li key={line.ref_id} className='flex justify-between gap-3'>
                  <span className='truncate'>{line.label}</span>
                  <span className='shrink-0 tabular-nums'>{formatINR(line.amount)}</span>
                </li>
              ))}
            </ul>

            <div className='flex flex-wrap gap-1'>
              {offer.quote.attributes.slice(0, 8).map(attribute => (
                <Badge
                  key={attribute}
                  variant='outline'
                  className={cn(
                    'h-5 px-1.5 text-[11px] font-normal',
                    required.includes(attribute) && 'border-primary/40 bg-primary/10 text-primary'
                  )}
                >
                  {ATTRIBUTE_LABELS[attribute]}
                </Badge>
              ))}
            </div>

            {offer.rationale && <p className='text-muted-foreground text-xs italic'>“{offer.rationale}”</p>}

            {offer.changes_from_previous.length > 0 && (
              <div className='bg-muted/50 flex flex-col gap-1 rounded-md border px-2.5 py-2'>
                <p className='text-[11px] font-medium'>What changed this round</p>
                {offer.changes_from_previous.map((change, index) => (
                  <p key={index} className='text-muted-foreground flex items-start gap-1.5 text-[11px]'>
                    <ArrowDownIcon className='mt-0.5 size-3 shrink-0' />
                    {change}
                  </p>
                ))}
              </div>
            )}

            {merchant.counters.length > 0 && (
              <details className='group'>
                <summary className='text-muted-foreground hover:text-foreground cursor-pointer text-[11px]'>
                  {merchant.counters.length} counter-request
                  {merchant.counters.length === 1 ? '' : 's'} sent by the desk
                </summary>
                <div className='mt-1.5 flex flex-col gap-1.5'>
                  {merchant.counters.map(({ round, counter }) => (
                    <p key={round} className='text-muted-foreground border-l-2 pl-2 text-[11px]'>
                      <span className='font-medium'>Round {round}, cap {formatINR(counter.max_price)}:</span>{' '}
                      {counter.message}
                    </p>
                  ))}
                </div>
              </details>
            )}

            {verdict && <GuardChecklist verdict={verdict} />}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default OfferCard
