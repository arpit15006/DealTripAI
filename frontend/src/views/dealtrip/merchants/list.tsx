'use client'

// Next Imports
import { useState } from 'react'

import Link from 'next/link'

// Third-party Imports
import { CheckIcon, CopyIcon, ExternalLinkIcon, PlusIcon, ShieldCheckIcon, StarIcon } from 'lucide-react'
import { toast } from 'sonner'

// Component Imports
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import PropertyImage from '@/views/dealtrip/shared/property-image'

// Lib Imports
import { formatINR } from '@/lib/dealtrip/pricing'

import type { MerchantListItem } from '@/lib/dealtrip/client'

/**
 * The marketplace, from the operator's side.
 *
 * Each merchant's Agent Commerce Profile URL is shown and copyable, because
 * "this merchant is transactable by an AI buyer" is a claim that should be
 * verifiable with curl rather than taken on trust.
 */
const MerchantList = ({ merchants, baseUrl }: { merchants: MerchantListItem[]; baseUrl: string }) => {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(url)
      toast.success('Profile URL copied')
      setTimeout(() => setCopied(null), 1600)
    } catch {
      toast.error('Could not copy to the clipboard')
    }
  }

  const byDestination = merchants.reduce<Record<string, MerchantListItem[]>>((acc, merchant) => {
    ;(acc[merchant.destination] ??= []).push(merchant)

    return acc
  }, {})

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight'>Merchants</h1>
          <p className='text-muted-foreground text-sm'>
            {merchants.length} merchants publishing machine-readable catalogs that AI buyers can transact against.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href='/dashboard/merchants/onboard' />}>
          <PlusIcon />
          Onboard a merchant
        </Button>
      </div>

      <Alert>
        <ShieldCheckIcon />
        <AlertTitle>Every profile is public; every limit is not</AlertTitle>
        <AlertDescription>
          Catalogs, prices and what a merchant will negotiate over are published. Its discount ceiling, margin floor and
          cost base never leave the server — those are enforced by the Commerce Guard rather than advertised to buyers.
        </AlertDescription>
      </Alert>

      {Object.entries(byDestination).map(([destination, group]) => (
        <div key={destination} className='flex flex-col gap-3'>
          <h2 className='text-sm font-semibold'>
            {destination}
            <span className='text-muted-foreground ml-1.5 font-normal'>({group.length})</span>
          </h2>

          <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
            {group.map(merchant => {
              const url = `${baseUrl}/api/agent/${merchant.slug}/profile`
              const cheapest = Math.min(...merchant.rooms.map(r => r.base_price_per_night))

              return (
                <Card key={merchant.id} className='gap-0 overflow-hidden py-0'>
                  <PropertyImage
                    src={merchant.image}
                    alt={merchant.name}
                    fallbackLabel={merchant.name}
                    className='aspect-[16/9] w-full'
                    sizes='(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw'
                  />
                  <CardHeader className='flex items-start justify-between gap-2 px-4 py-3'>
                    <div className='min-w-0'>
                      <CardTitle className='truncate text-sm'>{merchant.name}</CardTitle>
                      <p className='text-muted-foreground truncate text-xs'>{merchant.tagline}</p>
                    </div>
                    <Badge variant='outline' className='h-5.5 shrink-0 gap-1 px-2 text-xs font-normal'>
                      <StarIcon className='size-3 fill-current' />
                      {merchant.rating.toFixed(1)}
                    </Badge>
                  </CardHeader>

                  <Separator />

                  <CardContent className='flex flex-col gap-3 px-4 py-3'>
                    <div className='text-muted-foreground grid grid-cols-3 gap-2 text-xs'>
                      <Metric label='Rooms' value={String(merchant.rooms.length)} />
                      <Metric label='Add-ons' value={String(merchant.addons.length)} />
                      <Metric label='From' value={`${formatINR(cheapest)}/n`} />
                    </div>

                    <div className='flex flex-wrap gap-1'>
                      {merchant.published.negotiable ? (
                        <Badge
                          variant='outline'
                          className='h-5 border-green-600/40 px-1.5 text-xs font-normal text-green-600 dark:border-green-400/40 dark:text-green-400'
                        >
                          negotiates · {merchant.published.max_counter_rounds} round
                          {merchant.published.max_counter_rounds === 1 ? '' : 's'}
                        </Badge>
                      ) : (
                        <Badge variant='outline' className='h-5.5 px-2 text-xs font-normal'>
                          fixed price
                        </Badge>
                      )}
                      {merchant.policy.objectives.slice(0, 2).map(objective => (
                        <Badge key={objective} variant='outline' className='h-5.5 px-2 text-xs font-normal'>
                          {objective.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>

                    <div className='flex items-center gap-1'>
                      <code className='bg-muted text-muted-foreground min-w-0 flex-1 truncate rounded px-2 py-1 text-xs'>
                        /api/agent/{merchant.slug}/profile
                      </code>
                      <Button
                        variant='ghost'
                        size='icon-xs'
                        onClick={() => copy(url)}
                        aria-label='Copy profile URL'
                      >
                        {copied === url ? <CheckIcon className='text-green-600' /> : <CopyIcon />}
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon-xs'
                        aria-label='Open profile'
                        nativeButton={false}
                        render={<a href={url} target='_blank' rel='noreferrer' />}
                      >
                        <ExternalLinkIcon />
                      </Button>
                    </div>

                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full'
                      nativeButton={false}
                      render={<Link href={`/dashboard/merchants/${merchant.slug}`} />}
                    >
                      <ShieldCheckIcon />
                      Policy Studio
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className='text-foreground text-sm font-medium'>{value}</p>
    <p className='text-xs'>{label}</p>
  </div>
)

export default MerchantList
