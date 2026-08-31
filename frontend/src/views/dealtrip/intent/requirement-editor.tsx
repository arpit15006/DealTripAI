'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { CheckIcon, PlusIcon, XIcon } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Util Imports
import { cn } from '@/lib/utils'
import { ATTRIBUTES, ATTRIBUTE_LABELS } from '@/lib/dealtrip/vocabulary'

import type { Attribute } from '@/lib/dealtrip/vocabulary'
import type { RequirementStrength } from '@/lib/dealtrip/types'

type Requirements = Partial<Record<Attribute, RequirementStrength>>

const STRENGTH_LABEL: Record<RequirementStrength, string> = {
  required: 'Must have',
  preferred: 'Nice to have',
  avoid: 'Rule out'
}

const STRENGTH_STYLE: Record<RequirementStrength, string> = {
  required: 'border-primary/40 bg-primary/10 text-primary',
  preferred: 'border-border bg-muted text-muted-foreground',
  avoid: 'border-destructive/40 bg-destructive/10 text-destructive'
}

type Props = {
  value: Requirements
  onChange: (next: Requirements) => void
}

/**
 * Editor for the traveller's constraints.
 *
 * The distinction between "must have" and "nice to have" is the single most
 * consequential thing the parse can get wrong — a must-have is a hard gate that
 * disqualifies an offer at any price — so it is surfaced as an explicit,
 * editable control rather than buried in prose the traveller has to re-read.
 */
const RequirementEditor = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false)

  const entries = Object.entries(value) as [Attribute, RequirementStrength][]
  const unused = ATTRIBUTES.filter(a => !(a in value))

  const setStrength = (attribute: Attribute, strength: RequirementStrength) =>
    onChange({ ...value, [attribute]: strength })

  const remove = (attribute: Attribute) => {
    const next = { ...value }

    delete next[attribute]
    onChange(next)
  }

  return (
    <div className='flex flex-col gap-3'>
      {entries.length === 0 && (
        <p className='text-muted-foreground text-sm'>
          No requirements yet. Every offer will be judged on price and package value alone.
        </p>
      )}

      <div className='flex flex-col gap-2'>
        {entries.map(([attribute, strength]) => (
          <div
            key={attribute}
            className={cn('flex items-center gap-2 rounded-lg border px-2.5 py-1.5', STRENGTH_STYLE[strength])}
          >
            <span className='flex-1 text-sm font-medium'>{ATTRIBUTE_LABELS[attribute]}</span>

            <Select value={strength} onValueChange={next => next && setStrength(attribute, next as RequirementStrength)}>
              <SelectTrigger size='sm' className='bg-background h-7 w-32 shrink-0 text-xs'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STRENGTH_LABEL) as RequirementStrength[]).map(s => (
                  <SelectItem key={s} value={s} className='text-xs'>
                    {STRENGTH_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant='ghost'
              size='icon-xs'
              onClick={() => remove(attribute)}
              aria-label={`Remove ${ATTRIBUTE_LABELS[attribute]}`}
            >
              <XIcon />
            </Button>
          </div>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant='outline' size='sm' className='w-fit' disabled={unused.length === 0} />
          }
        >
          <PlusIcon />
          Add a requirement
        </PopoverTrigger>
        <PopoverContent className='w-64 p-0' align='start'>
          <Command>
            <CommandInput placeholder='Search requirements…' className='h-9' />
            <CommandList>
              <CommandEmpty>Nothing matches.</CommandEmpty>
              <CommandGroup>
                {unused.map(attribute => (
                  <CommandItem
                    key={attribute}
                    value={ATTRIBUTE_LABELS[attribute]}
                    onSelect={() => {
                      setStrength(attribute, 'preferred')
                      setOpen(false)
                    }}
                  >
                    <CheckIcon className='opacity-0' />
                    {ATTRIBUTE_LABELS[attribute]}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <p className='text-muted-foreground text-xs'>
        A <Badge variant='outline' className='mx-0.5 h-5 px-1.5 text-[11px]'>must have</Badge> is a hard gate — an
        offer missing it is rejected at any price. A nice-to-have only affects the score.
      </p>
    </div>
  )
}

export default RequirementEditor
