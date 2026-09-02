'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'

// Third-party Imports
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { CheckIcon, FlaskConicalIcon, InfoIcon, Loader2Icon, PlayIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'

// Component Imports
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// Lib Imports
import { formatINR } from '@/lib/dealtrip/pricing'

import { cn } from '@/lib/utils'

import type { SimulationResult, SimulationTick } from '@/lib/dealtrip/simulator'

const chartConfig = {
  static_selling: { label: 'Static selling', color: 'var(--chart-3)' },
  agentic: { label: 'DealTrip', color: 'var(--chart-1)' }
} satisfies ChartConfig

/**
 * Revenue simulator.
 *
 * Deliberately unglamorous about what this is: synthetic demand against
 * synthetic catalogs. It is evidence about a *mechanism*, not a measurement of
 * anyone's business, and the page says so above the numbers rather than in a
 * footnote — a chart that looks like real merchant performance and isn't would
 * be the least defensible thing in this whole product.
 */
const RevenueSimulator = ({ destinations }: { destinations: string[] }) => {
  const [intents, setIntents] = useState(200)
  const [seed, setSeed] = useState(42)
  const [destination, setDestination] = useState(destinations[0] ?? 'Goa')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<(SimulationResult & { runtime_ms: number }) | null>(null)
  const [ticks, setTicks] = useState<SimulationTick[]>([])
  const [contacted, setContacted] = useState<string[]>([])
  const source = useRef<EventSource | null>(null)
  const logEnd = useRef<HTMLDivElement | null>(null)

  // Close the stream if the operator navigates away mid-run.
  useEffect(() => () => source.current?.close(), [])

  useEffect(() => {
    logEnd.current?.scrollIntoView({ block: 'nearest' })
  }, [ticks.length])

  const run = () => {
    source.current?.close()
    setRunning(true)
    setResult(null)
    setTicks([])
    setContacted([])

    const params = new URLSearchParams({
      intents: String(intents),
      destination,
      seed: String(seed)
    })

    const es = new EventSource(`/api/simulate/stream?${params}`)

    source.current = es

    es.onmessage = event => {
      const payload = JSON.parse(event.data) as
        | { type: 'start'; merchants: string[] }
        | { type: 'tick'; tick: SimulationTick }
        | { type: 'done'; result: SimulationResult & { runtime_ms: number } }
        | { type: 'error'; message: string }

      if (payload.type === 'start') setContacted(payload.merchants)
      if (payload.type === 'tick') setTicks(current => [...current, payload.tick])

      if (payload.type === 'done') {
        setResult(payload.result)
        setRunning(false)
        es.close()
      }

      if (payload.type === 'error') {
        toast.error(payload.message)
        setRunning(false)
        es.close()
      }
    }

    es.onerror = () => {
      es.close()
      setRunning(false)
      setTicks(current => {
        if (current.length === 0) toast.error('Could not reach the simulator.')

        return current
      })
    }
  }

  const latest = ticks[ticks.length - 1]
  const progress = latest ? (latest.index / latest.total) * 100 : 0

  const chartData = result
    ? [
        { metric: 'Revenue', static_selling: result.static_selling.revenue, agentic: result.agentic.revenue },
        { metric: 'Margin', static_selling: result.static_selling.margin, agentic: result.agentic.margin },
        {
          metric: 'Avg order',
          static_selling: result.static_selling.aov,
          agentic: result.agentic.aov
        }
      ]
    : []

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='type-title text-2xl font-semibold'>Revenue simulator</h1>
        <p className='text-muted-foreground text-sm'>
          The same synthetic demand run twice: once where merchants can negotiate, once where they cannot.
        </p>
      </div>

      <Alert variant='warning'>
        <FlaskConicalIcon />
        <AlertTitle>These are synthetic evaluation results</AlertTitle>
        <AlertDescription>
          Synthetic travellers against synthetic catalogs. This is not a measurement of real merchant performance and
          must not be presented as one. Both arms use the same catalogs and the same ranking function — the only
          difference is whether structured negotiation is allowed. Runs are deterministic from the seed.
        </AlertDescription>
      </Alert>

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <Card>
        <CardContent className='flex flex-wrap items-end gap-4'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='intents'>Synthetic travellers</Label>
            <Input
              id='intents'
              type='number'
              min={10}
              max={1000}
              step={10}
              value={intents}
              onChange={event => setIntents(Number(event.target.value) || 200)}
              className='w-32'
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='seed'>Seed</Label>
            <Input
              id='seed'
              type='number'
              value={seed}
              onChange={event => setSeed(Number(event.target.value) || 0)}
              className='w-28'
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='destination'>Destination</Label>
            <Input
              id='destination'
              value={destination}
              onChange={event => setDestination(event.target.value)}
              className='w-36'
            />
          </div>
          <Button onClick={run} disabled={running}>
            {running ? <Loader2Icon className='animate-spin' /> : <PlayIcon />}
            {running ? 'Running…' : 'Run simulation'}
          </Button>
          {result && (
            <span className='text-muted-foreground text-xs'>
              {result.intents} intents in {result.runtime_ms}ms
            </span>
          )}
        </CardContent>
      </Card>

      {/* ── Live run ─────────────────────────────────────────────────── */}
      {(running || ticks.length > 0) && (
        <Card className='gap-0 py-0'>
          <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-2 px-4 py-3'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              {running ? <Loader2Icon className='size-4 animate-spin' /> : <CheckIcon className='size-4 text-green-600 dark:text-green-400' />}
              {running ? 'Negotiating' : 'Run complete'}
              {latest && (
                <span className='text-muted-foreground font-mono text-xs font-normal tabular-nums'>
                  {latest.index} / {latest.total}
                </span>
              )}
            </CardTitle>
            {contacted.length > 0 && (
              <span className='text-muted-foreground text-xs'>
                against {contacted.length} merchants in {destination}
              </span>
            )}
          </CardHeader>

          <div className='border-t px-4 py-3'>
            <Progress
              value={progress}
              className='h-1.5'
              aria-label={`Simulation progress: ${latest?.index ?? 0} of ${latest?.total ?? intents} travellers`}
            />

            {/* Coarse, so a screen reader is not read a line per traveller. */}
            <p aria-live='polite' aria-atomic='true' className='sr-only'>
              {running
                ? `Simulating. ${latest?.index ?? 0} of ${latest?.total ?? intents} travellers processed.`
                : result
                  ? `Simulation complete. Conversion moved from ${(result.static_selling.conversion_rate * 100).toFixed(0)} to ${(result.agentic.conversion_rate * 100).toFixed(0)} percent.`
                  : ''}
            </p>

            {latest && (
              <div className='mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4'>
                <Live label='Static booked' value={String(latest.running.static_bookings)} />
                <Live label='DealTrip booked' value={String(latest.running.agentic_bookings)} accent />
                <Live label='Static revenue' value={formatINR(latest.running.static_revenue)} />
                <Live label='DealTrip revenue' value={formatINR(latest.running.agentic_revenue)} accent />
              </div>
            )}
          </div>

          {/* One line per traveller, as their outcome is decided. */}
          <ScrollArea className='h-56 border-t'>
            <ul aria-hidden className='divide-border/50 divide-y font-mono text-xs'>
              {ticks.map(tick => (
                <li key={tick.index} className='flex flex-wrap items-center gap-x-2 gap-y-0.5 px-4 py-1.5'>
                  <span className='text-muted-foreground w-10 shrink-0 tabular-nums'>#{tick.index}</span>
                  <span className='text-muted-foreground w-28 shrink-0'>
                    {tick.travelers}p · {tick.nights}n · {formatINR(tick.budget)}
                  </span>

                  <span className='w-44 shrink-0 truncate'>
                    {tick.static_sale ? (
                      <span className='text-muted-foreground'>
                        static → {tick.static_sale.merchant} {formatINR(tick.static_sale.price)}
                      </span>
                    ) : (
                      <span className='text-muted-foreground/60'>static → no sale</span>
                    )}
                  </span>

                  <span className='min-w-0 flex-1 truncate'>
                    {tick.agentic_sale ? (
                      <span className='text-foreground'>
                        DealTrip → {tick.agentic_sale.merchant} {formatINR(tick.agentic_sale.price)}
                        <span className='text-muted-foreground'> r{tick.agentic_sale.rounds}</span>
                      </span>
                    ) : (
                      <span className='text-destructive/80'>DealTrip → no deal</span>
                    )}
                  </span>

                  {!tick.static_sale && tick.agentic_sale && (
                    <span className='shrink-0 rounded bg-green-600/10 px-1.5 py-0.5 text-green-700 dark:text-green-400'>
                      recovered
                    </span>
                  )}
                  {tick.blocked > 0 && (
                    <span className='text-muted-foreground shrink-0 inline-flex items-center gap-0.5'>
                      <XIcon className='size-3' />
                      {tick.blocked}
                    </span>
                  )}
                </li>
              ))}
              <div ref={logEnd} />
            </ul>
          </ScrollArea>

          <p className='text-muted-foreground border-t px-4 py-2 text-xs'>
            <span className='inline-flex items-center gap-0.5'>
              <XIcon className='size-3' />n
            </span>{' '}
            = offers the Commerce Guard refused for that traveller, before the desk countered.
          </p>
        </Card>
      )}

      {result && (
        <>
          {/* ── Headline deltas ────────────────────────────────────── */}
          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            <Delta
              label='Revenue'
              from={formatINR(result.static_selling.revenue)}
              to={formatINR(result.agentic.revenue)}
              change={`${result.delta.revenue_pct > 0 ? '+' : ''}${result.delta.revenue_pct}%`}
              positive={result.delta.revenue > 0}
            />
            <Delta
              label='Conversion'
              from={`${(result.static_selling.conversion_rate * 100).toFixed(1)}%`}
              to={`${(result.agentic.conversion_rate * 100).toFixed(1)}%`}
              change={`${result.delta.conversion_points > 0 ? '+' : ''}${result.delta.conversion_points} pts`}
              positive={result.delta.conversion_points > 0}
            />
            <Delta
              label='Average order value'
              from={formatINR(result.static_selling.aov)}
              to={formatINR(result.agentic.aov)}
              change={`${result.delta.aov > 0 ? '+' : ''}${formatINR(result.delta.aov)}`}
              positive={result.delta.aov > 0}
            />
            <Delta
              label='Revenue per traveller'
              from={formatINR(result.static_selling.revenue_per_intent)}
              to={formatINR(result.agentic.revenue_per_intent)}
              change={`${result.agentic.revenue_per_intent - result.static_selling.revenue_per_intent > 0 ? '+' : ''}${formatINR(result.agentic.revenue_per_intent - result.static_selling.revenue_per_intent)}`}
              positive={result.agentic.revenue_per_intent > result.static_selling.revenue_per_intent}
            />
            <Delta
              label='Deal fit score'
              from={String(result.static_selling.mean_score)}
              to={String(result.agentic.mean_score)}
              change={`${result.agentic.mean_score - result.static_selling.mean_score > 0 ? '+' : ''}${(result.agentic.mean_score - result.static_selling.mean_score).toFixed(1)}`}
              positive={result.agentic.mean_score > result.static_selling.mean_score}
            />
            <Delta
              label='Margin retained'
              from={`${result.static_selling.margin_pct}%`}
              to={`${result.agentic.margin_pct}%`}
              change={`${result.delta.margin_pct_points > 0 ? '+' : ''}${result.delta.margin_pct_points} pts`}
              positive={result.delta.margin_pct_points >= -1}
            />
          </div>

          <Alert variant='info'>
            <InfoIcon />
            <AlertTitle>What actually moved</AlertTitle>
            <AlertDescription>
              Negotiation recovered {result.negotiation.sales_recovered_from_no_deal} sale
              {result.negotiation.sales_recovered_from_no_deal === 1 ? '' : 's'} that the static shelf lost entirely,
              across {result.negotiation.total_counters} counter-requests. Mean deal-fit score rose from{' '}
              {result.static_selling.mean_score} to {result.agentic.mean_score} — travellers got better-matched
              packages, not merely cheaper ones. The Commerce Guard blocked{' '}
              {result.negotiation.offers_blocked_by_guard} offer
              {result.negotiation.offers_blocked_by_guard === 1 ? '' : 's'} that breached a merchant limit or the
              traveller&apos;s budget — and merchants still retained {result.agentic.margin_pct}% margin, against{' '}
              {result.static_selling.margin_pct}% on the static shelf.
            </AlertDescription>
          </Alert>

          {/* ── Chart ──────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Static selling vs DealTrip</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className='h-64 w-full'>
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey='metric' tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickFormatter={value => `₹${(Number(value) / 100000).toFixed(1)}L`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey='static_selling' fill='var(--color-static_selling)' radius={4} />
                  <Bar dataKey='agentic' fill='var(--color-agentic)' radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* ── Per merchant ───────────────────────────────────────── */}
          <Card className='gap-0 py-0'>
            <CardHeader className='px-4 py-3'>
              <CardTitle className='text-sm'>Where the bookings landed</CardTitle>
            </CardHeader>
            <div className='overflow-x-auto border-t'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead className='text-right'>Static bookings</TableHead>
                    <TableHead className='text-right'>DealTrip bookings</TableHead>
                    <TableHead className='text-right'>DealTrip revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.by_merchant
                    .filter(row => row.static_bookings > 0 || row.agentic_bookings > 0)
                    .map(row => (
                      <TableRow key={row.merchant}>
                        <TableCell className='font-medium'>{row.merchant}</TableCell>
                        <TableCell className='text-right tabular-nums'>{row.static_bookings}</TableCell>
                        <TableCell className='text-right tabular-nums'>
                          {row.agentic_bookings}
                          {row.agentic_bookings !== row.static_bookings && (
                            <Badge
                              variant='outline'
                              className='ml-2 h-5.5 px-2 text-xs font-normal'
                            >
                              {row.agentic_bookings > row.static_bookings ? '+' : ''}
                              {row.agentic_bookings - row.static_bookings}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='text-right tabular-nums'>{formatINR(row.agentic_revenue)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <p className='text-muted-foreground text-xs'>{result.disclosure}</p>
        </>
      )}
    </div>
  )
}

const Live = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div>
    <p className='eyebrow'>{label}</p>
    <p className={cn('price-sm', accent && 'text-primary')}>{value}</p>
  </div>
)

const Delta = ({
  label,
  from,
  to,
  change,
  positive
}: {
  label: string
  from: string
  to: string
  change: string
  positive: boolean
}) => (
  <Card className='gap-2 py-5'>
    <CardContent className='flex flex-col gap-1.5 px-4'>
      <p className='eyebrow'>{label}</p>
      {/* The agentic figure is the claim; the baseline is context for it. */}
      <p className='price'>{to}</p>
      <p className='meta'>
        from <span className='tabular'>{from}</span>
        <span className={`ml-2 font-semibold ${positive ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
          {change}
        </span>
      </p>
    </CardContent>
  </Card>
)

export default RevenueSimulator
