'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { ChevronRightIcon } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Timeline, TimelineContent, TimelineDot, TimelineHeading, TimelineItem, TimelineLine } from '@/components/ui/timeline'

// Util Imports
import { cn } from '@/lib/utils'
import { ACTOR_LABELS } from '@/lib/dealtrip/vocabulary'

import type { AuditEvent } from '@/lib/dealtrip/types'

const ACTOR_STYLE: Record<string, string> = {
  user: 'border-primary/40 text-primary',
  orchestrator: 'border-primary/40 text-primary',
  merchant_agent: 'border-border text-muted-foreground',
  commerce_guard: 'border-amber-600/40 text-amber-700 dark:border-amber-400/40 dark:text-amber-400',
  razorpay: 'border-border text-muted-foreground',
  system: 'border-border text-muted-foreground'
}

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

type Props = {
  events: AuditEvent[]

  /** Show the raw detail payload behind a disclosure on each row. */
  expandable?: boolean
  className?: string
  emptyLabel?: string
}

/**
 * The Trust Timeline.
 *
 * Append-only, one row per audit event, colour-coded by the guard's ruling. The
 * raw detail behind each row is available rather than summarised away — an
 * audit trail nobody can inspect is decoration, so every row can be opened to
 * show exactly what was recorded.
 */
const EventFeed = ({ events, expandable = true, className, emptyLabel = 'Nothing has happened yet.' }: Props) => {
  if (events.length === 0) {
    return <p className={cn('text-muted-foreground py-6 text-center text-sm', className)}>{emptyLabel}</p>
  }

  return (
    <Timeline className={className}>
      {events.map((event, index) => (
        <EventRow key={event.id} event={event} isLast={index === events.length - 1} expandable={expandable} />
      ))}
    </Timeline>
  )
}

const EventRow = ({
  event,
  isLast,
  expandable
}: {
  event: AuditEvent
  isLast: boolean
  expandable: boolean
}) => {
  const [open, setOpen] = useState(false)
  const hasDetail = expandable && Object.keys(event.detail ?? {}).length > 0

  const dot =
    event.decision === 'pass' ? (
      <TimelineDot status='done' className='my-1 size-4 border-green-600 bg-green-600 [&>svg]:size-2.5' />
    ) : event.decision === 'fail' ? (
      <TimelineDot status='error' className='my-1 size-4 [&>svg]:size-2.5' />
    ) : (
      <TimelineDot
        status='custom'
        className='bg-muted my-1 flex size-4 shrink-0 items-center justify-center rounded-full'
      >
        <span className='bg-muted-foreground/50 size-1.5 rounded-full' />
      </TimelineDot>
    )

  return (
    <TimelineItem status='done' className='gap-x-0'>
      {dot}
      {!isLast && <TimelineLine done className='bg-border min-h-4' />}

      <TimelineHeading className='flex w-full items-start justify-between gap-3 pb-0.5 pl-3 text-sm font-normal text-wrap'>
        <span className={cn('flex-1', event.decision === 'fail' && 'text-destructive')}>{event.summary}</span>
        <span className='text-muted-foreground shrink-0 font-mono text-xs whitespace-nowrap'>{time(event.ts)}</span>
      </TimelineHeading>

      <TimelineContent className={cn('pl-3', isLast ? 'pb-1' : 'pb-4')}>
        <div className='flex flex-wrap items-center gap-1.5'>
          <Badge
            variant='outline'
            className={cn('h-5.5 px-2 text-xs font-normal', ACTOR_STYLE[event.actor] ?? 'border-border')}
          >
            {ACTOR_LABELS[event.actor] ?? event.actor}
          </Badge>
          <span className='text-muted-foreground/70 font-mono text-xs'>{event.action}</span>

          {hasDetail && (
            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleTrigger className='text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-xs transition-colors'>
                <ChevronRightIcon className={cn('size-3 transition-transform', open && 'rotate-90')} />
                {open ? 'hide' : 'detail'}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className='bg-muted/60 text-muted-foreground mt-1.5 max-h-64 overflow-auto rounded-md border p-2 text-xs leading-relaxed'>
                  {JSON.stringify(event.detail, null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </TimelineContent>
    </TimelineItem>
  )
}

export default EventFeed
