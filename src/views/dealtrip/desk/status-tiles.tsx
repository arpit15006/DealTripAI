'use client'

// Third-party Imports
import { BanIcon, CheckIcon, HandIcon, Loader2Icon, XIcon } from 'lucide-react'

// Component Imports
import PropertyImage from '@/views/dealtrip/shared/property-image'

// Util Imports
import { cn } from '@/lib/utils'
import { formatINR } from '@/lib/dealtrip/pricing'

import type { DeskMerchant } from '@/hooks/use-negotiation-stream'

/**
 * Every merchant's current position, and the filter for the tape below.
 *
 * Uniform height by construction, so a merchant that said one line cannot leave
 * a hole beside one that negotiated three rounds.
 */
const StatusTiles = ({
  merchants,
  images,
  selected,
  onSelect
}: {
  merchants: DeskMerchant[]
  images: Record<string, string>
  selected: string | null
  onSelect: (id: string | null) => void
}) => (
  <ul className='grid list-none grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'>
    {merchants.map(m => {
      const blocked = m.offer !== null && m.verdict !== null && !m.verdict.authorized

      /*
       * A merchant that declines to revise has NOT necessarily left the table:
       * its previous offer still stands and still competes. Only a merchant
       * with nothing on the table is actually out, and conflating the two told
       * the traveller a ranked, purchasable offer had been withdrawn.
       */
      const state = m.withdrawn
        ? m.offer
          ? 'final'
          : 'out'
        : blocked
          ? 'blocked'
          : m.offer
            ? 'live'
            : 'waiting'

      const isSelected = selected === m.id

      return (
        <li key={m.id}>
          <button
            type='button'
            onClick={() => onSelect(isSelected ? null : m.id)}
            aria-pressed={isSelected}
            className={cn(
              'flex h-full w-full flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors',
              'hover:bg-muted/50 focus-visible:outline-none',
              state === 'out' && 'opacity-55',
              state === 'blocked' && 'border-destructive/40',
              state === 'live' && 'border-primary/40',
              isSelected && 'border-primary ring-primary/30 ring-2'
            )}
          >
            <span className='flex items-center gap-2'>
              <PropertyImage
                src={images[m.id]}
                alt=''
                fallbackLabel={m.name}
                className={cn('size-7 shrink-0 rounded-md text-[10px]', state === 'out' && 'grayscale')}
                sizes='28px'
              />
              {/* Wraps to two lines rather than truncating: a merchant you
                  cannot name is a merchant you cannot compare. */}
              <span className='min-w-0 flex-1 text-xs leading-tight font-medium'>{m.name}</span>
            </span>

            {m.offer ? (
              <span className='price-sm'>{formatINR(m.offer.quote.total_price)}</span>
            ) : (
              <span className='text-muted-foreground text-sm'>no offer</span>
            )}

            <span className='meta flex items-center gap-1'>
              {state === 'waiting' && <Loader2Icon className='size-3 animate-spin' aria-hidden />}
              {state === 'live' && <CheckIcon className='size-3 text-green-600 dark:text-green-400' aria-hidden />}
              {state === 'final' && <HandIcon className='size-3' aria-hidden />}
              {state === 'blocked' && <XIcon className='text-destructive size-3' aria-hidden />}
              {state === 'out' && <BanIcon className='size-3' aria-hidden />}
              {state === 'waiting'
                ? 'thinking'
                : state === 'out'
                  ? 'withdrew'
                  : state === 'final'
                    ? 'stood firm'
                    : state === 'blocked'
                      ? 'blocked'
                      : `round ${m.offer?.round ?? 0}`}
            </span>
          </button>
        </li>
      )
    })}
  </ul>
)

export default StatusTiles
