'use client'

// Third-party Imports
import { BanIcon, CheckIcon, Loader2Icon, XIcon } from 'lucide-react'

// Util Imports
import { cn } from '@/lib/utils'
import { formatINR } from '@/lib/dealtrip/pricing'

import PropertyImage from '@/views/dealtrip/shared/property-image'

import type { DeskMerchant } from '@/hooks/use-negotiation-stream'

/**
 * Every merchant's current position, at a glance.
 *
 * The tape below says what happened and when; these say where things stand
 * right now. Uniform height by construction, so a merchant that withdrew in one
 * line cannot leave a hole beside one that negotiated three rounds.
 */
const StatusTiles = ({ merchants, images }: { merchants: DeskMerchant[]; images: Record<string, string> }) => (
  <ul className='grid list-none grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'>
    {merchants.map(m => {
      const blocked = m.offer !== null && m.verdict !== null && !m.verdict.authorized
      const state = m.withdrawn ? 'out' : blocked ? 'blocked' : m.offer ? 'live' : 'waiting'

      return (
        <li key={m.id}>
          <div
            className={cn(
              'flex h-full flex-col gap-1 rounded-lg border px-3 py-2.5 transition-colors',
              state === 'out' && 'opacity-55',
              state === 'blocked' && 'border-destructive/40',
              state === 'live' && m.offer && 'border-primary/40'
            )}
          >
            <div className='flex items-center gap-2'>
              <PropertyImage
                src={images[m.id]}
                alt=''
                fallbackLabel={m.name}
                className={cn('size-7 shrink-0 rounded-md text-[10px]', state === 'out' && 'grayscale')}
                sizes='28px'
              />
              <p className='min-w-0 flex-1 truncate text-xs font-medium' title={m.name}>
                {m.name}
              </p>
            </div>

            {m.offer ? (
              <p className='price-sm'>{formatINR(m.offer.quote.total_price)}</p>
            ) : (
              <p className='text-muted-foreground text-sm'>{m.withdrawn ? 'no offer' : '…'}</p>
            )}

            <p className='meta flex items-center gap-1'>
              {state === 'waiting' && <Loader2Icon className='size-3 animate-spin' aria-hidden />}
              {state === 'live' && <CheckIcon className='size-3 text-green-600 dark:text-green-400' aria-hidden />}
              {state === 'blocked' && <XIcon className='text-destructive size-3' aria-hidden />}
              {state === 'out' && <BanIcon className='size-3' aria-hidden />}
              {state === 'waiting'
                ? 'thinking'
                : state === 'out'
                  ? 'withdrew'
                  : state === 'blocked'
                    ? 'blocked'
                    : `round ${m.offer?.round ?? 0}`}
            </p>
          </div>
        </li>
      )
    })}
  </ul>
)

export default StatusTiles
