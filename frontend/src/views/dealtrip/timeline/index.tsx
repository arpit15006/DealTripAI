// Next Imports
import Link from 'next/link'

// Third-party Imports
import { ArrowLeftIcon, PlayIcon, ShieldCheckIcon } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EventFeed from '@/views/dealtrip/shared/event-feed'

// Lib Imports
import { formatINR } from '@/lib/dealtrip/pricing'

import type { NegotiationView } from '@/lib/dealtrip/negotiation-state'

const STATUS_LABEL: Record<string, string> = {
  extracting: 'Intent confirmed',
  discovering: 'Discovering merchants',
  negotiating: 'Negotiating',
  ranked: 'Ranked',
  awaiting_approval: 'Awaiting your approval',
  payment_pending: 'Payment pending',
  booked: 'Booked',
  payment_failed: 'Payment failed',
  no_deal: 'Closed without a deal'
}

/**
 * The Trust Timeline.
 *
 * Every actor, action and ruling in the order it happened, with the raw record
 * behind each row. This is not a debugging view bolted on afterwards — it is
 * the artefact that makes an autonomous negotiation checkable, so it gets its
 * own page rather than a panel.
 */
const TrustTimeline = ({ state, negotiationId }: { state: NegotiationView; negotiationId: string }) => {
  const { audit, negotiation, payments } = state

  const guardEvents = audit.filter(e => e.actor === 'commerce_guard')
  const blocked = guardEvents.filter(e => e.decision === 'fail').length

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 sm:px-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold tracking-tight'>Trust Timeline</h1>
          <p className='text-muted-foreground text-sm'>
            Every decision taken on your behalf, in the order it happened.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' nativeButton={false} render={<Link href={`/deal/${negotiationId}/replay`} />}>
            <PlayIcon />
            Replay it
          </Button>
          <Button variant='outline' size='sm' nativeButton={false} render={<Link href={`/deal/${negotiationId}`} />}>
            <ArrowLeftIcon />
            Back to the deals
          </Button>
        </div>
      </div>

      <div className='mt-5 grid gap-3 sm:grid-cols-4'>
        <Stat label='Events recorded' value={String(audit.length)} />
        <Stat label='Guard rulings' value={String(guardEvents.length)} />
        <Stat
          label='Offers blocked'
          value={String(blocked)}
          tone={blocked > 0 ? 'text-destructive' : undefined}
        />
        <Stat label='Status' value={STATUS_LABEL[negotiation.status] ?? negotiation.status} />
      </div>

      <Card className='mt-6 gap-0 py-0'>
        <CardHeader className='flex flex-row items-center justify-between gap-2 px-4 py-3'>
          <CardTitle className='flex items-center gap-2 text-sm'>
            <ShieldCheckIcon className='size-4' />
            Append-only record
          </CardTitle>
          <Badge variant='outline' className='h-5 px-1.5 text-[11px] font-normal'>
            negotiation {negotiationId}
          </Badge>
        </CardHeader>
        <CardContent className='border-t px-4 py-4'>
          <EventFeed events={audit} emptyLabel='No events recorded for this negotiation.' />
        </CardContent>
      </Card>

      {payments.length > 0 && (
        <Card className='mt-4 gap-0 py-0'>
          <CardHeader className='px-4 py-3'>
            <CardTitle className='text-sm'>Payments</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-2 border-t px-4 py-3'>
            {payments.map(payment => (
              <div key={payment.id} className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
                <Badge
                  variant='outline'
                  className={
                    payment.status === 'paid'
                      ? 'h-5 border-green-600/40 px-1.5 text-[11px] text-green-600 dark:border-green-400/40 dark:text-green-400'
                      : 'border-destructive/40 text-destructive h-5 px-1.5 text-[11px]'
                  }
                >
                  {payment.status}
                </Badge>
                <span className='font-mono'>{payment.razorpay_order_id}</span>
                <span className='tabular-nums'>{formatINR(payment.amount)}</span>
                {payment.failure_reason && (
                  <span className='text-muted-foreground'>{payment.failure_reason}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className='text-muted-foreground mt-4 text-xs'>
        Audit rows are written append-only — nothing in this codebase issues an update or delete against them.
      </p>
    </div>
  )
}

const Stat = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
  <Card className='gap-1 py-3'>
    <CardContent className='px-4'>
      <p className={`text-lg font-semibold ${tone ?? ''}`}>{value}</p>
      <p className='text-muted-foreground text-xs'>{label}</p>
    </CardContent>
  </Card>
)

export default TrustTimeline
