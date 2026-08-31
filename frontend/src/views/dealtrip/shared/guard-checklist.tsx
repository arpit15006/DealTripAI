'use client'

// Third-party Imports
import { CheckIcon, ShieldCheckIcon, ShieldXIcon, XIcon } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Util Imports
import { cn } from '@/lib/utils'

import type { GuardVerdict } from '@/lib/dealtrip/types'

type Props = {
  verdict: GuardVerdict
  /** Collapsed by default on the desk; open on the explanation screen. */
  defaultOpen?: boolean
  className?: string
}

/**
 * The Commerce Guard's ruling, shown in full.
 *
 * Every check is listed whether it passed or not. Showing only the failures
 * would make the guard look like an error handler; the point is that twelve
 * deterministic things are verified on every single offer, and the traveller
 * can read all of them.
 */
const GuardChecklist = ({ verdict, defaultOpen = false, className }: Props) => {
  const passed = verdict.checks.filter(c => c.passed).length
  const total = verdict.checks.length

  return (
    <Collapsible defaultOpen={defaultOpen} className={cn('rounded-lg border', className)}>
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
          verdict.authorized ? 'hover:bg-muted/60' : 'hover:bg-destructive/5'
        )}
      >
        {verdict.authorized ? (
          <ShieldCheckIcon className='size-4 shrink-0 text-green-600 dark:text-green-400' />
        ) : (
          <ShieldXIcon className='text-destructive size-4 shrink-0' />
        )}
        <span className='flex-1 font-medium'>
          {verdict.authorized ? 'Authorized by the Commerce Guard' : 'Blocked by the Commerce Guard'}
        </span>
        <Badge
          variant='outline'
          className={cn(
            'h-5 shrink-0 px-1.5 font-mono text-[11px]',
            verdict.authorized
              ? 'border-green-600/40 text-green-600 dark:border-green-400/40 dark:text-green-400'
              : 'border-destructive/40 text-destructive'
          )}
        >
          {passed}/{total}
        </Badge>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <ul className='divide-border/60 divide-y border-t'>
          {verdict.checks.map(check => (
            <li key={check.id + check.label} className='flex items-start gap-2.5 px-3 py-2'>
              {check.passed ? (
                <CheckIcon className='mt-0.5 size-3.5 shrink-0 text-green-600 dark:text-green-400' />
              ) : (
                <XIcon className={cn('mt-0.5 size-3.5 shrink-0', check.advisory ? 'text-amber-600' : 'text-destructive')} />
              )}
              <div className='min-w-0 flex-1'>
                <p
                  className={cn(
                    'text-xs font-medium',
                    !check.passed && !check.advisory && 'text-destructive',
                    !check.passed && check.advisory && 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {check.label}
                  {check.advisory && !check.passed && (
                    <span className='text-muted-foreground ml-1.5 font-normal'>(advisory)</span>
                  )}
                </p>
                <p className='text-muted-foreground text-xs'>{check.detail}</p>
                {check.expected && check.actual && (
                  <p className='text-muted-foreground/80 mt-0.5 font-mono text-[11px]'>
                    expected {check.expected} · actual {check.actual}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default GuardChecklist
