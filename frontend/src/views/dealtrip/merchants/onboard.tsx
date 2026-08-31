'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { CheckCircle2Icon, ExternalLinkIcon, Loader2Icon, SparklesIcon, TriangleAlertIcon, UploadIcon } from 'lucide-react'
import { toast } from 'sonner'

// Component Imports
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

// Lib Imports
import { ApiError, onboardMerchant } from '@/lib/dealtrip/client'
import { formatINR } from '@/lib/dealtrip/pricing'
import { ATTRIBUTE_LABELS } from '@/lib/dealtrip/vocabulary'

import type { OnboardResponse } from '@/lib/dealtrip/client'

const SAMPLE = `Casuarina Sands, Benaulim, South Goa. A 34-room beachfront property with direct access to Benaulim beach, a large pool, and free Wi-Fi throughout.

Rooms:
- Garden View Room, sleeps 2, ₹7,800 a night, 10 available
- Sea View Room with balcony, sleeps 3, ₹11,400 a night, 6 available
- Beachfront Suite, sleeps 4, ₹16,900 a night, 3 available

Extras we sell:
- Breakfast buffet, ₹650 per person per night
- Half board (breakfast and dinner), ₹1,900 per person per night
- Return airport transfer, ₹2,800 for the stay
- Shared shuttle from the airport, ₹1,100
- Ayurvedic massage for two, ₹4,200

We include daily housekeeping in every stay and cannot remove it.`

/**
 * Merchant onboarding.
 *
 * The track's own framing is "make merchants sellable to AI buyers", and this
 * is the shortest honest path to it: paste whatever you already have — a rate
 * card, a website blurb — and get back a machine-readable Agent Commerce
 * Profile that an AI buyer can discover, quote against and negotiate with.
 *
 * The result is shown for review before anything is published, because a
 * generated catalog is a draft, not a fact about someone's business.
 */
const MerchantOnboarding = () => {
  const [text, setText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [result, setResult] = useState<OnboardResponse | null>(null)

  const generate = async (save: boolean) => {
    if (text.trim().length < 40) {
      toast.error('Give it a few sentences to work with.')

      return
    }

    save ? setPublishing(true) : setGenerating(true)

    try {
      const response = await onboardMerchant(text, save)

      setResult(response)
      if (save) toast.success(`${response.merchant.name} is now transactable by AI buyers.`)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not build a catalog from that.')
    } finally {
      setGenerating(false)
      setPublishing(false)
    }
  }

  const merchant = result?.merchant

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-xl font-semibold tracking-tight'>Onboard a merchant</h1>
        <p className='text-muted-foreground text-sm'>
          Paste what you already have. DealTrip turns it into an Agent Commerce Profile that AI buyers can transact
          against.
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        <Card className='h-fit'>
          <CardHeader className='flex flex-row items-center justify-between gap-2'>
            <CardTitle className='text-base'>Your property, in your own words</CardTitle>
            <Button variant='ghost' size='xs' onClick={() => setText(SAMPLE)}>
              Use a sample
            </Button>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            <Textarea
              value={text}
              onChange={event => setText(event.target.value)}
              rows={16}
              placeholder='Rooms, prices, what you include, what you sell as extras…'
              className='resize-none font-mono text-xs'
            />
            <Button onClick={() => generate(false)} disabled={generating || publishing}>
              {generating ? <Loader2Icon className='animate-spin' /> : <SparklesIcon />}
              {generating ? 'Building the catalog…' : 'Generate the profile'}
            </Button>
          </CardContent>
        </Card>

        <div className='flex flex-col gap-4'>
          {!result && (
            <Card className='py-16'>
              <CardContent className='text-muted-foreground flex flex-col items-center gap-2 text-center text-sm'>
                <UploadIcon className='size-5' />
                Your generated catalog will appear here for review.
              </CardContent>
            </Card>
          )}

          {result && merchant && (
            <>
              {result.saved ? (
                <Alert variant='success'>
                  <CheckCircle2Icon />
                  <AlertTitle>Published — {merchant.name} is now AI-transactable</AlertTitle>
                  <AlertDescription>
                    Any agent can now discover it, request a quote and negotiate against it.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant={result.extraction.source === 'fallback' ? 'warning' : 'info'}>
                  <TriangleAlertIcon />
                  <AlertTitle>Review before publishing</AlertTitle>
                  <AlertDescription>{result.extraction.note}</AlertDescription>
                </Alert>
              )}

              <Card className='gap-0 py-0'>
                <CardHeader className='flex flex-wrap items-start justify-between gap-2 px-4 py-3'>
                  <div>
                    <CardTitle className='text-sm'>{merchant.name}</CardTitle>
                    <p className='text-muted-foreground text-xs'>
                      {merchant.tagline} · {merchant.destination}
                    </p>
                  </div>
                  <Badge variant='outline' className='h-5 px-1.5 text-[11px] font-normal'>
                    {result.extraction.source === 'model' ? result.extraction.model : 'deterministic'} ·{' '}
                    {result.extraction.latency_ms}ms
                  </Badge>
                </CardHeader>

                <Separator />

                <CardContent className='flex flex-col gap-4 px-4 py-4'>
                  <div className='flex flex-wrap gap-1'>
                    {merchant.attributes.map(a => (
                      <Badge key={a} variant='outline' className='h-5 px-1.5 text-[11px] font-normal'>
                        {ATTRIBUTE_LABELS[a]}
                      </Badge>
                    ))}
                  </div>

                  <div>
                    <p className='mb-1.5 text-xs font-medium'>Rooms ({merchant.rooms.length})</p>
                    <ul className='flex flex-col gap-1 text-xs'>
                      {merchant.rooms.map(room => (
                        <li key={room.id} className='flex justify-between gap-3'>
                          <span className='truncate'>
                            {room.name}
                            <span className='text-muted-foreground'> · sleeps {room.max_occupancy}</span>
                          </span>
                          <span className='shrink-0 tabular-nums'>{formatINR(room.base_price_per_night)}/n</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {merchant.addons.length > 0 && (
                    <div>
                      <p className='mb-1.5 text-xs font-medium'>Add-ons ({merchant.addons.length})</p>
                      <ul className='flex flex-col gap-1 text-xs'>
                        {merchant.addons.map(addon => (
                          <li key={addon.id} className='flex justify-between gap-3'>
                            <span className='truncate'>
                              {addon.name}
                              {addon.group && <span className='text-muted-foreground'> · {addon.group}</span>}
                            </span>
                            <span className='shrink-0 tabular-nums'>{formatINR(addon.price)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className='bg-muted/50 rounded-md border px-3 py-2'>
                    <p className='mb-1 text-xs font-medium'>Starting policy</p>
                    <p className='text-muted-foreground text-xs'>
                      Max {merchant.policy.max_discount_pct}% discount · {merchant.policy.min_margin_pct}% margin floor ·{' '}
                      {merchant.policy.max_counter_rounds} negotiation round
                      {merchant.policy.max_counter_rounds === 1 ? '' : 's'}. Tune these in the Policy Studio.
                    </p>
                  </div>

                  {result.saved ? (
                    <div className='flex flex-col gap-2'>
                      <code className='bg-muted text-muted-foreground truncate rounded px-2 py-1.5 text-[11px]'>
                        {result.profile_url}
                      </code>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1'
                          nativeButton={false}
                          render={<a href={result.profile_url} target='_blank' rel='noreferrer' />}
                        >
                          <ExternalLinkIcon />
                          View the profile
                        </Button>
                        <Button
                          size='sm'
                          className='flex-1'
                          nativeButton={false}
                          render={<Link href={`/dashboard/merchants/${merchant.slug}`} />}
                        >
                          Tune the policy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => generate(true)} disabled={publishing}>
                      {publishing ? <Loader2Icon className='animate-spin' /> : <UploadIcon />}
                      Publish — make this merchant AI-transactable
                    </Button>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MerchantOnboarding
