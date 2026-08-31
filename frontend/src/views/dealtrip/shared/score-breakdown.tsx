'use client'

// Component Imports
import { Progress } from '@/components/ui/progress'

// Util Imports
import { cn } from '@/lib/utils'

import type { DealScore } from '@/lib/dealtrip/types'

/**
 * Why a deal scored what it scored, term by term.
 *
 * Each row carries the sentence that justifies its points, because a number
 * without its reason is exactly the opaque score this product exists to avoid.
 */
const ScoreBreakdown = ({ score, className }: { score: DealScore; className?: string }) => (
  <div className={cn('flex flex-col gap-3', className)}>
    {score.components.map(component => (
      <div key={component.id} className='flex flex-col gap-1'>
        <div className='flex items-baseline justify-between gap-3'>
          <span className='text-sm font-medium'>{component.label}</span>
          <span className='text-muted-foreground shrink-0 font-mono text-xs tabular-nums'>
            {component.points} / {component.max_points}
          </span>
        </div>
        <Progress
          value={component.max_points > 0 ? (component.points / component.max_points) * 100 : 0}
          className='h-1.5'
        />
        <p className='text-muted-foreground text-xs'>{component.detail}</p>
      </div>
    ))}
  </div>
)

export default ScoreBreakdown
