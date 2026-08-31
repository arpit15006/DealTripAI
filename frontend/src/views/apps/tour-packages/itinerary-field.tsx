'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { ChevronDownIcon, PlusIcon, Trash2Icon } from 'lucide-react'

// Type Imports
import type { TourPackageItineraryDay } from '@/types/packages/tour-package-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import StringListField from './string-list-field'

// Utils Imports
import { cn } from '@/lib/utils'

type ItineraryFieldProps = {
  value: TourPackageItineraryDay[]
  onChange: (next: TourPackageItineraryDay[]) => void
}

const EMPTY_DAY: Omit<TourPackageItineraryDay, 'day'> = { title: '', summary: '', activities: [] }

const ItineraryField = ({ value, onChange }: ItineraryFieldProps) => {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set())

  const updateDay = (index: number, patch: Partial<TourPackageItineraryDay>) => {
    onChange(value.map((day, i) => (i === index ? { ...day, ...patch } : day)))
  }

  const toggleDay = (index: number, open: boolean) => {
    setOpenIndexes(prev => {
      const next = new Set(prev)

      if (open) next.add(index)
      else next.delete(index)

      return next
    })
  }

  const addDay = () => {
    const newIndex = value.length

    onChange([...value, { day: value.length + 1, ...EMPTY_DAY }])

    setOpenIndexes(prev => new Set(prev).add(newIndex))
  }

  const removeDay = (index: number) => {
    onChange(value.filter((_, i) => i !== index).map((day, i) => ({ ...day, day: i + 1 })))

    setOpenIndexes(prev => {
      const next = new Set<number>()

      prev.forEach(i => {
        if (i < index) next.add(i)
        else if (i > index) next.add(i - 1)
      })

      return next
    })
  }

  return (
    <div className='flex flex-col gap-4'>
      {value.length === 0 && (
        <p className='text-muted-foreground text-sm'>
          No custom itinerary yet — the public site auto-generates a day-by-day plan until you add one here.
        </p>
      )}

      {value.map((day, index) => {
        const isOpen = openIndexes.has(index)

        return (
          <Collapsible
            key={index}
            open={isOpen}
            onOpenChange={open => toggleDay(index, open)}
            className='rounded-lg border'
          >
            <div className='flex items-center justify-between gap-2 p-2 pl-4'>
              <CollapsibleTrigger
                render={
                  <Button
                    type='button'
                    variant='ghost'
                    className='h-auto flex-1 justify-start gap-2 px-0 py-1 font-normal hover:bg-transparent focus:bg-transparent!'
                  />
                }
              >
                <ChevronDownIcon className={cn('size-4 shrink-0 transition-transform', isOpen && 'rotate-180')} />
                <span className='text-sm font-semibold'>Day {day.day}</span>
                {day.title && <span className='text-muted-foreground truncate text-sm'>— {day.title}</span>}
              </CollapsibleTrigger>
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                onClick={() => removeDay(index)}
                aria-label={`Remove day ${day.day}`}
              >
                <Trash2Icon className='size-4' />
              </Button>
            </div>

            <CollapsibleContent className='flex flex-col gap-3 border-t p-4'>
              <Field>
                <FieldLabel htmlFor={`itinerary-title-${index}`}>Title</FieldLabel>
                <Input
                  id={`itinerary-title-${index}`}
                  placeholder='City Highlights Tour'
                  value={day.title}
                  onChange={e => updateDay(index, { title: e.target.value })}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`itinerary-summary-${index}`}>Summary</FieldLabel>
                <Textarea
                  id={`itinerary-summary-${index}`}
                  placeholder='Explore iconic landmarks and immerse yourself in the local city life.'
                  value={day.summary}
                  onChange={e => updateDay(index, { summary: e.target.value })}
                />
              </Field>

              <Field>
                <FieldLabel>Activities</FieldLabel>
                <StringListField
                  value={day.activities}
                  onChange={activities => updateDay(index, { activities })}
                  placeholder='Add an activity and press Enter'
                />
              </Field>
            </CollapsibleContent>
          </Collapsible>
        )
      })}

      <Button type='button' variant='outline' size='sm' className='w-fit gap-1.5' onClick={addDay}>
        <PlusIcon className='size-3.5' />
        Add Day
      </Button>
    </div>
  )
}

export default ItineraryField
