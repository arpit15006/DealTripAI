'use client'

// Third-party Imports
import { ArrowDownIcon, BanIcon, Loader2Icon, StarIcon } from 'lucide-react'

// Component Imports
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import AgentJudgment from './agent-judgment'
import Exchange from './exchange'
import GuardChecklist from './guard-checklist'
import PropertyImage from './property-image'

// Util Imports
import { cn } from '@/lib/utils'
import { formatStay, weekdayName } from '@/lib/dealtrip/dates'
import { formatINR } from '@/lib/dealtrip/pricing'
import { ATTRIBUTE_LABELS } from '@/lib/dealtrip/vocabulary'

import type { Attribute } from '@/lib/dealtrip/vocabulary'
import type { AuditEvent } from '@/lib/dealtrip/types'
import type { DeskMerchant } from '@/hooks/use-negotiation-stream'

type Props = {
  merchant: DeskMerchant

  /** The audit event behind the current offer, if it has arrived yet. */
  originEvent?: AuditEvent | null

  /** Property photograph. */
  image?: string

  /** Attributes the traveller marked as must-have, for highlighting. */
  required: Attribute[]
  className?: string
}

/**
 * One merchant's position in the negotiation, as it stands right now.
 *
 * Shows the live offer, what the last round changed, and the guard's ruling. A
 * merchant that withdrew gets a card too, an absent competitor tells the
 * traveller nothing, whereas "its only beachfront room cannot legally reach
 * your budget" tells them something real about the market.
 */
const OfferCard = ({ merchant, required, image, originEvent, className }: Props) => {
  const { offer, verdict } = merchant

  return (
    <Card className={cn('gap-0 overflow-hidden py-0', className)}>
      <PropertyImage
        src={image}
        alt={merchant.name}
        fallbackLabel={merchant.name}
        className={cn('aspect-[16/6] w-full', merchant.withdrawn && 'opacity-40 grayscale')}
        sizes='(max-width: 640px) 100vw, 50vw'
      />
      <CardHeader className='flex items-start justify-between gap-3 px-4 py-3'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold'>{merchant.name}</p>
          <p className='text-muted-foreground truncate text-xs'>{merchant.tagline}</p>
        </div>
        <span className='meta flex shrink-0 items-center gap-1 pt-0.5'>
          <StarIcon className='size-3 fill-current' aria-hidden />
          {merchant.rating.toFixed(1)}
        </span>
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
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='price'>{formatINR(offer.quote.total_price)}</p>
                {offer.quote.discount_pct > 0 && (
                  <p className='meta'>
                    <span className='line-through'>{formatINR(offer.quote.list_price)}</span>
                    <span className='ml-1.5'>−{offer.quote.discount_pct}%</span>
                  </p>
                )}
              </div>
              <div className='flex flex-col items-end gap-1'>
                <span className='meta'>round {offer.round}</span>
                <span className='text-muted-foreground text-xs'>
                  {formatStay(offer.quote.check_in, offer.quote.nights)} · {weekdayName(offer.quote.check_in)} in
                </span>
              </div>
            </div>

            <ul className='text-muted-foreground'>
              {offer.quote.lines.map(line => (
                <li key={line.ref_id} className='line-item'>
                  <span className='truncate'>{line.label}</span>
                  <span>{formatINR(line.amount)}</span>
                </li>
              ))}
            </ul>

            {/* Only the traveller's own must-haves are marked. Chipping every
                inclusion made the one that mattered impossible to find. */}
            <p className='text-xs leading-relaxed'>
              {offer.quote.attributes.slice(0, 6).map((attribute, index) => (
                <span key={attribute}>
                  {index > 0 && <span className='text-muted-foreground/50'> · </span>}
                  <span className={cn(required.includes(attribute) ? 'text-primary font-medium' : 'text-muted-foreground')}>
                    {ATTRIBUTE_LABELS[attribute]}
                  </span>
                </span>
              ))}
              {offer.quote.attributes.length > 6 && (
                <span className='text-muted-foreground/70'> +{offer.quote.attributes.length - 6} more</span>
              )}
            </p>

            {offer.rationale && <p className='text-muted-foreground text-xs italic'>“{offer.rationale}”</p>}

            {offer.changes_from_previous.length > 0 && (
              <div className='inset flex flex-col gap-1'>
                <p className='text-xs font-medium'>What changed this round</p>
                {offer.changes_from_previous.map((change, index) => (
                  <p key={index} className='text-muted-foreground flex items-start gap-1.5 text-xs'>
                    <ArrowDownIcon className='mt-0.5 size-3 shrink-0' />
                    {change}
                  </p>
                ))}
              </div>
            )}

            {merchant.withdrawn && (
              <p className='meta flex items-start gap-1.5'>
                <BanIcon className='mt-0.5 size-3 shrink-0' aria-hidden />
                <span>
                  <span className='text-foreground font-medium'>Stood firm.</span> {merchant.withdrawn}
                </span>
              </p>
            )}

            {(merchant.history.length > 1 || merchant.counters.length > 0) && (
              <div className='inset'>
                <p className='eyebrow mb-2'>The exchange</p>
                <Exchange merchant={merchant} />
              </div>
            )}

            {verdict && <GuardChecklist verdict={verdict} />}
            {originEvent && <AgentJudgment event={originEvent} />}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default OfferCard
