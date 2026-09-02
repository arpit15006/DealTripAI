'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import { ArrowRightIcon, InfoIcon, Loader2Icon, SparklesIcon, TriangleAlertIcon } from 'lucide-react'
import { toast } from 'sonner'

// Component Imports
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import RequirementEditor from './requirement-editor'

// Lib Imports
import { ApiError, extractIntent, openNegotiation } from '@/lib/dealtrip/client'
import { formatStay, resolveCheckIns, weekdayName } from '@/lib/dealtrip/dates'
import { formatINR } from '@/lib/dealtrip/pricing'

import type { IntentResponse } from '@/lib/dealtrip/client'
import type { TravelIntent } from '@/lib/dealtrip/types'

const EXAMPLES = [
  'Goa for two, 3 nights, hard budget of ₹60,000. Beachfront is essential, breakfast would be nice. Flexible by a couple of days.',
  'Anniversary trip to Goa · 4 nights for 2. Up to ₹85,000. We want a sea view and a spa, and somewhere quiet. No nightlife please.',
  'Family of 4 to Goa for 3 nights, ₹70,000 max. Needs a pool and breakfast. Beachfront if we can get it.'
]

const IntentComposer = () => {
  const router = useRouter()

  const [raw, setRaw] = useState('')
  const [parsing, setParsing] = useState(false)
  const [starting, setStarting] = useState(false)
  const [parsed, setParsed] = useState<IntentResponse | null>(null)
  const [intent, setIntent] = useState<TravelIntent | null>(null)

  const parse = async (text: string) => {
    if (!text.trim()) return

    setParsing(true)

    try {
      const response = await extractIntent(text)

      setParsed(response)

      // Resolve the check-in now and show it. A stay has to happen on actual
      // dates, and the traveller should see which ones before agents start
      // pricing against them, not discover them on the confirmation screen.
      setIntent({
        ...response.intent,
        check_in: response.intent.check_in ?? resolveCheckIns(null, 0)[0] ?? null
      })
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not read that request.')
    } finally {
      setParsing(false)
    }
  }

  const start = async () => {
    if (!intent) return

    setStarting(true)

    try {
      const { negotiation_id } = await openNegotiation(intent, raw)

      router.push(`/desk/${negotiation_id}`)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not open the negotiation.')
      setStarting(false)
    }
  }

  const patch = (next: Partial<TravelIntent>) => setIntent(current => (current ? { ...current, ...next } : current))

  return (
    <div className='mx-auto w-full max-w-3xl px-4 pb-14 sm:px-6'>
      {/* ── Request ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>What kind of trip are you after?</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <Textarea
            value={raw}
            onChange={event => setRaw(event.target.value)}
            placeholder='Goa for two, 3 nights, hard budget of ₹60,000. Beachfront is essential…'
            rows={4}
            className='resize-none text-base'
            onKeyDown={event => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') parse(raw)
            }}
          />

          <div className='flex flex-wrap gap-2'>
            {EXAMPLES.map((example, index) => (
              <Button
                key={index}
                variant='outline'
                size='xs'
                className='h-auto max-w-full py-1 text-left font-normal whitespace-normal'
                onClick={() => {
                  setRaw(example)
                  parse(example)
                }}
              >
                {example.slice(0, 58)}…
              </Button>
            ))}
          </div>

          <div className='flex items-center justify-between gap-3'>
            <span className='text-muted-foreground text-xs'>⌘ + Enter to read it</span>
            <Button onClick={() => parse(raw)} disabled={parsing || !raw.trim()}>
              {parsing ? <Loader2Icon className='animate-spin' /> : <SparklesIcon />}
              {parsing ? 'Reading…' : 'Read my request'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Confirmation ─────────────────────────────────────────────── */}
      {parsed && intent && (
        <Card className='mt-6'>
          <CardHeader className='gap-1'>
            <CardTitle className='text-base'>Check we understood you</CardTitle>
            <p className='text-muted-foreground text-sm'>
              Nothing is negotiated until you confirm this. Edit anything that is wrong, these constraints are what
              merchants are actually held to.
            </p>
          </CardHeader>
          <CardContent className='flex flex-col gap-6'>
            <p className='bg-muted/50 rounded-lg border px-3 py-2 text-sm italic'>{parsed.restatement}</p>

            {parsed.extraction.source === 'fallback' && (
              <Alert variant='warning'>
                <TriangleAlertIcon />
                <AlertTitle>Read by the fallback parser</AlertTitle>
                <AlertDescription>{parsed.extraction.note ?? ''}</AlertDescription>
              </Alert>
            )}

            {parsed.ambiguities.length > 0 && (
              <Alert variant='info'>
                <InfoIcon />
                <AlertTitle>Worth double-checking</AlertTitle>
                <AlertDescription>
                  <ul className='list-inside list-disc'>
                    {parsed.ambiguities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Trip basics */}
            <div className='grid gap-4 sm:grid-cols-3'>
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='destination'>Destination</Label>
                <Select value={intent.destination} onValueChange={value => value && patch({ destination: value })}>
                  <SelectTrigger id='destination' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set([intent.destination, ...parsed.known_destinations])].map(d => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='travelers'>Travellers</Label>
                <Input
                  id='travelers'
                  type='number'
                  min={1}
                  max={20}
                  value={intent.travelers}
                  onChange={event => patch({ travelers: Math.max(1, Number(event.target.value) || 1) })}
                />
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='nights'>Nights</Label>
                <Input
                  id='nights'
                  type='number'
                  min={1}
                  max={30}
                  value={intent.duration_nights}
                  onChange={event => patch({ duration_nights: Math.max(1, Number(event.target.value) || 1) })}
                />
              </div>
            </div>

            <Separator />

            {/* Budget */}
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='budget'>Total budget</Label>
                <Input
                  id='budget'
                  type='number'
                  min={1000}
                  step={1000}
                  value={intent.budget.max}
                  onChange={event =>
                    patch({ budget: { ...intent.budget, max: Math.max(1, Number(event.target.value) || 0) } })
                  }
                />
                <span className='text-muted-foreground text-xs'>
                  {formatINR(intent.budget.max)} for the whole trip
                </span>
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='budget-type'>How firm is that?</Label>
                <Select
                  value={intent.budget.type}
                  onValueChange={value =>
                    value && patch({ budget: { ...intent.budget, type: value as TravelIntent['budget']['type'] } })
                  }
                >
                  <SelectTrigger id='budget-type' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='hard_constraint'>Hard limit, never exceed it</SelectItem>
                    <SelectItem value='soft_target'>A target. Some flexibility</SelectItem>
                  </SelectContent>
                </Select>
                <span className='text-muted-foreground text-xs'>
                  {intent.budget.type === 'hard_constraint'
                    ? 'Offers above this are blocked outright, not just ranked lower.'
                    : 'Offers above this are allowed but penalised in the score.'}
                </span>
              </div>
            </div>

            <Separator />

            {/* Requirements */}
            <div className='flex flex-col gap-3'>
              <Label>What matters to you</Label>
              <RequirementEditor value={intent.requirements} onChange={next => patch({ requirements: next })} />
            </div>

            <Separator />

            {/* Preferences */}
            <div className='grid gap-4 sm:grid-cols-3'>
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='priority'>When there is a trade-off, favour</Label>
                <Select
                  value={intent.priority}
                  onValueChange={value => value && patch({ priority: value as TravelIntent['priority'] })}
                >
                  <SelectTrigger id='priority' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='lowest_price'>The lowest price</SelectItem>
                    <SelectItem value='best_value'>The best value</SelectItem>
                    <SelectItem value='best_experience'>The best experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='check-in'>Check-in</Label>
                <Input
                  id='check-in'
                  type='date'
                  value={intent.check_in ?? ''}
                  onChange={event => patch({ check_in: event.target.value || null })}
                />
                {intent.check_in && (
                  <span className='text-muted-foreground text-xs'>
                    {formatStay(intent.check_in, intent.duration_nights)} · {weekdayName(intent.check_in)} check-in
                  </span>
                )}
              </div>

              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='flexibility'>Date flexibility (days)</Label>
                <Input
                  id='flexibility'
                  type='number'
                  min={0}
                  max={14}
                  value={intent.date_flexibility_days}
                  onChange={event =>
                    patch({ date_flexibility_days: Math.min(14, Math.max(0, Number(event.target.value) || 0)) })
                  }
                />
                <span className='text-muted-foreground text-xs'>
                  {intent.date_flexibility_days === 0
                    ? 'Fixed dates. Merchants cannot move your stay to a cheaper night.'
                    : `${resolveCheckIns(intent.check_in, intent.date_flexibility_days).length} check-in dates are on the table. Weekend nights cost more, so flexibility is worth real money.`}
                </span>
              </div>
            </div>

            <Button size='lg' className='w-full' onClick={start} disabled={starting}>
              {starting ? <Loader2Icon className='animate-spin' /> : null}
              {starting ? 'Opening the desk…' : 'Negotiate this trip'}
              {!starting && <ArrowRightIcon />}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default IntentComposer
