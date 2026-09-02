'use client'

// Third-party Imports
import { GitCompareArrowsIcon } from 'lucide-react'

// Component Imports
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Util Imports
import { cn } from '@/lib/utils'
import { formatINR } from '@/lib/dealtrip/pricing'

import type { AuditEvent } from '@/lib/dealtrip/types'

type Choice = { room: string | null; addons: string[]; total_price: number }

/**
 * What the model added, shown rather than argued.
 *
 * Both sides of every merchant turn are recorded: the package the deterministic
 * planner would have chosen, and the one the agent actually proposed. When they
 * differ, the difference *is* the answer to "why is there a model here at all" -
 * the planner maximises a scalar objective over a closed vocabulary; it has no
 * way to read "anniversary trip" and keep the couples spa.
 *
 * When they agree, this says so too. A comparison that only ever appears when
 * it flatters the model would not be evidence of anything.
 */
const AgentJudgment = ({ event, className }: { event: AuditEvent; className?: string }) => {
  const detail = event.detail as {
    planner_would_have_chosen?: Choice | null
    agent_chose?: Choice
    agent_diverged_from_planner?: boolean
    agent_source?: string
  }

  const planner = detail.planner_would_have_chosen
  const agent = detail.agent_chose

  if (!planner || !agent || detail.agent_source !== 'model') return null

  const diverged = detail.agent_diverged_from_planner === true
  const delta = agent.total_price - planner.total_price

  return (
    <Collapsible className={cn('rounded-lg border', className)}>
      <CollapsibleTrigger className='hover:bg-muted/60 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors'>
        <GitCompareArrowsIcon className='text-muted-foreground size-3.5 shrink-0' aria-hidden />
        <span className='flex-1 font-medium'>
          {diverged ? 'The agent chose differently to the planner' : 'The agent and the planner agreed'}
        </span>
        <span className='text-muted-foreground shrink-0'>
          {diverged ? (delta === 0 ? 'same price' : `${delta > 0 ? '+' : ''}${formatINR(delta)}`) : '-'}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className='space-y-2 border-t px-3 py-2.5'>
          <Side label='Deterministic planner' choice={planner} muted />
          <Side label='Merchant agent' choice={agent} />

          <p className='type-caption text-muted-foreground pt-1 text-xs'>
            {diverged
              ? 'The planner optimises the merchant’s stated objectives over a closed vocabulary. Anything the traveller said that the vocabulary cannot express (an occasion, a mood) is only available to the model.'
              : 'On this turn the model reached the same package the planner did. Both were then priced by the same code and checked by the same guard.'}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

const Side = ({ label, choice, muted }: { label: string; choice: Choice; muted?: boolean }) => (
  <div className={cn('flex flex-col gap-0.5', muted && 'opacity-70')}>
    <div className='flex items-baseline justify-between gap-3'>
      <span className='text-xs font-medium'>{label}</span>
      <span className='tabular shrink-0 text-xs'>{formatINR(choice.total_price)}</span>
    </div>
    <p className='type-caption text-muted-foreground text-xs'>
      {choice.room ?? 'no room'}
      {choice.addons.length > 0 ? ` · ${choice.addons.join(', ').toLowerCase()}` : ' · no extras'}
    </p>
  </div>
)

export default AgentJudgment
