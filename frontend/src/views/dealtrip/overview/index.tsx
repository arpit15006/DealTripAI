// Next Imports
import Link from 'next/link'

// Third-party Imports
import {
  ArrowRightIcon,
  CircleCheckIcon,
  CircleXIcon,
  DatabaseIcon,
  CpuIcon,
  CreditCardIcon,
  SparklesIcon,
  StoreIcon
} from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'

// Lib Imports
import { formatINR } from '@/lib/dealtrip/pricing'

import type { HealthResponse } from '@/lib/dealtrip/client'
import type { Negotiation } from '@/lib/dealtrip/types'

const STATUS_TONE: Record<string, string> = {
  booked: 'border-green-600/40 text-green-600 dark:border-green-400/40 dark:text-green-400',
  awaiting_approval: 'border-primary/40 text-primary',
  payment_failed: 'border-destructive/40 text-destructive',
  no_deal: 'border-destructive/40 text-destructive'
}

/**
 * Operator overview.
 *
 * Leads with what is actually wired up, because a demo that has quietly fallen
 * back to a deterministic planner or a simulated payment should say so on its
 * front page rather than let someone discover it in the middle of a pitch.
 */
const Overview = ({ health, negotiations }: { health: HealthResponse; negotiations: Negotiation[] }) => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-wrap items-start justify-between gap-3'>
      <div>
        <h1 className='text-xl font-semibold tracking-tight'>Overview</h1>
        <p className='text-muted-foreground text-sm'>The agentic deal desk for travel.</p>
      </div>
      <Button nativeButton={false} render={<Link href='/' />}>
        <SparklesIcon />
        Start a negotiation
      </Button>
    </div>

    {/* ── What is actually wired up ─────────────────────────────────── */}
    <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      <StatusCard
        icon={<DatabaseIcon />}
        label='Persistence'
        value={health.persistence.startsWith('postgres') ? 'Postgres' : 'In-memory'}
        ok={health.persistence.startsWith('postgres')}
        detail={health.persistence.startsWith('postgres') ? 'Neon, append-only audit' : health.persistence}
      />
      <StatusCard
        icon={<CpuIcon />}
        label='Agents'
        value={health.language_model.configured ? 'Live model' : 'Deterministic'}
        ok={health.language_model.configured}
        detail={health.language_model.model ?? health.language_model.note ?? ''}
      />
      <StatusCard
        icon={<CreditCardIcon />}
        label='Payments'
        value={health.payments.configured ? `Razorpay ${health.payments.mode}` : 'Simulated'}
        ok={health.payments.configured && health.payments.mode === 'test'}
        detail={
          health.payments.configured
            ? 'Server-side signature verification'
            : (health.payments.note ?? '')
        }
      />
      <StatusCard
        icon={<StoreIcon />}
        label='Marketplace'
        value={`${health.marketplace.merchants} merchants`}
        ok={health.marketplace.merchants > 0}
        detail={health.marketplace.destinations.join(', ')}
      />
    </div>

    {/* ── Recent negotiations ───────────────────────────────────────── */}
    <Card className='gap-0 py-0'>
      <CardHeader className='flex flex-row items-center justify-between gap-2 px-4 py-3'>
        <CardTitle className='text-sm'>Recent negotiations</CardTitle>
        <Badge variant='outline' className='h-5 px-1.5 text-[11px] font-normal'>
          {negotiations.length}
        </Badge>
      </CardHeader>
      <Separator />
      <CardContent className='p-0'>
        {negotiations.length === 0 ? (
          <Empty className='py-12'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <SparklesIcon />
              </EmptyMedia>
              <EmptyTitle>No negotiations yet</EmptyTitle>
              <EmptyDescription>
                Describe a trip and DealTrip will negotiate it with every eligible merchant.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className='divide-border divide-y'>
            {negotiations.map(negotiation => (
              <li key={negotiation.id}>
                <Link
                  href={
                    negotiation.status === 'extracting' || negotiation.status === 'discovering'
                      ? `/desk/${negotiation.id}`
                      : `/deal/${negotiation.id}`
                  }
                  className='hover:bg-muted/50 flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors'
                >
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>
                      {negotiation.intent.duration_nights} nights in {negotiation.intent.destination} for{' '}
                      {negotiation.intent.travelers}
                    </p>
                    <p className='text-muted-foreground truncate text-xs'>
                      {negotiation.raw_request || 'No original wording recorded'}
                    </p>
                  </div>
                  <span className='text-muted-foreground shrink-0 text-xs tabular-nums'>
                    {formatINR(negotiation.intent.budget.max)}
                  </span>
                  <Badge
                    variant='outline'
                    className={`h-5 shrink-0 px-1.5 text-[11px] font-normal ${STATUS_TONE[negotiation.status] ?? ''}`}
                  >
                    {negotiation.status.replace(/_/g, ' ')}
                  </Badge>
                  <ArrowRightIcon className='text-muted-foreground size-3.5 shrink-0' />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  </div>
)

const StatusCard = ({
  icon,
  label,
  value,
  ok,
  detail
}: {
  icon: React.ReactNode
  label: string
  value: string
  ok: boolean
  detail: string
}) => (
  <Card className='gap-2 py-4'>
    <CardContent className='flex flex-col gap-1.5 px-4'>
      <div className='text-muted-foreground flex items-center gap-1.5 text-xs [&>svg]:size-3.5'>
        {icon}
        {label}
      </div>
      <div className='flex items-center gap-1.5'>
        {ok ? (
          <CircleCheckIcon className='size-4 shrink-0 text-green-600 dark:text-green-400' />
        ) : (
          <CircleXIcon className='size-4 shrink-0 text-amber-600 dark:text-amber-400' />
        )}
        <span className='text-sm font-semibold'>{value}</span>
      </div>
      <p className='text-muted-foreground truncate text-xs'>{detail}</p>
    </CardContent>
  </Card>
)

export default Overview
