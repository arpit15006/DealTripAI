'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { ArrowRightIcon, CircleAlertIcon, Loader2Icon } from 'lucide-react'

// Component Imports
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import Stepper from '@/views/dealtrip/shared/checkout-stepper'
import EventFeed from '@/views/dealtrip/shared/event-feed'
import OfferCard from '@/views/dealtrip/shared/offer-card'

// Hook Imports
import { useNegotiationStream } from '@/hooks/use-negotiation-stream'

// Lib Imports
import { getNegotiation, listMerchants } from '@/lib/dealtrip/client'
import { formatINR } from '@/lib/dealtrip/pricing'
import { ATTRIBUTE_LABELS } from '@/lib/dealtrip/vocabulary'

import type { Attribute } from '@/lib/dealtrip/vocabulary'
import type { TravelIntent } from '@/lib/dealtrip/types'

const PHASES = [
  { id: 'discovering', label: 'Discover' },
  { id: 'negotiating', label: 'Negotiate' },
  { id: 'ranked', label: 'Rank' },
  { id: 'awaiting_approval', label: 'Approve' }
]

const phaseFor = (status: string) => {
  if (status === 'connecting' || status === 'extracting' || status === 'discovering') return 'discovering'
  if (status === 'negotiating') return 'negotiating'
  if (status === 'ranked') return 'ranked'

  return 'awaiting_approval'
}

const DealDesk = ({ negotiationId }: { negotiationId: string }) => {
  const desk = useNegotiationStream(negotiationId)
  const [intent, setIntent] = useState<TravelIntent | null>(null)
  /** merchantId -> property photograph. */
  const [images, setImages] = useState<Record<string, string>>({})

  // The stream carries the negotiation's events but not the intent itself, and
  // the header needs to state the constraints the whole run is being held to.
  useEffect(() => {
    let cancelled = false

    getNegotiation(negotiationId)
      .then(state => {
        if (!cancelled) setIntent(state.negotiation.intent)
      })
      .catch(() => undefined)

    listMerchants()
      .then(({ merchants }) => {
        if (cancelled) return

        setImages(Object.fromEntries(merchants.map(m => [m.id, m.image])))
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [negotiationId])

  const required = useMemo(
    () =>
      intent
        ? (Object.entries(intent.requirements) as [Attribute, string][])
            .filter(([, strength]) => strength === 'required')
            .map(([attribute]) => attribute)
        : [],
    [intent]
  )

  const settled = desk.ranked.length > 0
  const eligible = desk.ranked.filter(r => r.score.eligible)
  const working = desk.merchants.some(m => m.pending) && !settled

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6'>
      {/* ── Constraints this run is held to ──────────────────────────── */}
      <div className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h1 className='text-xl font-semibold tracking-tight'>Live Deal Desk</h1>
            <p className='text-muted-foreground text-sm'>
              {intent
                ? `${intent.duration_nights} nights in ${intent.destination} for ${intent.travelers}, up to ${formatINR(intent.budget.max)}`
                : 'Loading your constraints…'}
            </p>
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {intent?.budget.type === 'hard_constraint' && (
              <Badge variant='outline' className='border-primary/40 text-primary h-6 px-2 font-normal'>
                Hard budget {formatINR(intent.budget.max)}
              </Badge>
            )}
            {required.map(attribute => (
              <Badge key={attribute} variant='outline' className='border-primary/40 text-primary h-6 px-2 font-normal'>
                {ATTRIBUTE_LABELS[attribute]} required
              </Badge>
            ))}
          </div>
        </div>

        <Card className='py-4'>
          <Stepper steps={PHASES} currentStep={phaseFor(desk.status)} />
        </Card>
      </div>

      {desk.error && (
        <Alert variant='destructive' className='mt-4'>
          <CircleAlertIcon />
          <AlertTitle>The negotiation stopped early</AlertTitle>
          <AlertDescription>{desk.error}</AlertDescription>
        </Alert>
      )}

      {/* ── Outcome banner ───────────────────────────────────────────── */}
      {settled && (
        <Alert variant={eligible.length > 0 ? 'success' : 'warning'} className='mt-4'>
          <AlertTitle>
            {eligible.length > 0
              ? `${eligible.length} offer${eligible.length === 1 ? '' : 's'} cleared every hard constraint`
              : 'No offer cleared every hard constraint'}
          </AlertTitle>
          <AlertDescription>{desk.explanation}</AlertDescription>
        </Alert>
      )}

      {/* The call to action sits outside the alert. Inside it, the button
          inherited the description's link underline and had nowhere to breathe. */}
      {settled && eligible.length > 0 && (
        <div className='mt-4 flex justify-end'>
          <Button
            size='lg'
            className='no-underline'
            nativeButton={false}
            render={<Link href={`/deal/${negotiationId}`} />}
          >
            Compare the deals
            <ArrowRightIcon />
          </Button>
        </div>
      )}

      {/* ── Desk ─────────────────────────────────────────────────────── */}
      <div className='mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-2'>
            <h2 className='text-sm font-semibold'>
              Merchants contacted
              {desk.merchants.length > 0 && (
                <span className='text-muted-foreground ml-1.5 font-normal'>({desk.merchants.length})</span>
              )}
            </h2>
            {working && <Loader2Icon className='text-muted-foreground size-3.5 animate-spin' />}
          </div>

          {desk.merchants.length === 0 ? (
            <Card className='py-10'>
              <CardContent className='text-muted-foreground flex flex-col items-center gap-2 text-sm'>
                <Loader2Icon className='size-5 animate-spin' />
                Discovering merchants in your destination…
              </CardContent>
            </Card>
          ) : (
            <div className='grid gap-3 sm:grid-cols-2'>
              {desk.merchants.map(merchant => (
                <OfferCard
                  key={merchant.id}
                  merchant={merchant}
                  required={required}
                  image={images[merchant.id]}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Trust Timeline, live ───────────────────────────────────── */}
        <Card className='h-fit gap-0 py-0 lg:sticky lg:top-20'>
          <CardHeader className='px-4 py-3'>
            <CardTitle className='text-sm'>
              Trust Timeline
              <span className='text-muted-foreground ml-1.5 text-xs font-normal'>{desk.audit.length} events</span>
            </CardTitle>
          </CardHeader>
          <ScrollArea className='h-[32rem] border-t'>
            <div className='px-4 py-3'>
              <EventFeed events={desk.audit} emptyLabel='Waiting for the first event…' />
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}

export default DealDesk
