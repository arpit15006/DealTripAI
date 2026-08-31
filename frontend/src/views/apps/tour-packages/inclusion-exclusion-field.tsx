'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { CircleCheckIcon, CircleXIcon, PlusIcon, XIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

// Utils Imports
import { cn } from '@/lib/utils'

type InclusionExclusionFieldProps = {
  id?: string
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  variant: 'included' | 'excluded'
}

const InclusionExclusionField = ({ id, value, onChange, placeholder, variant }: InclusionExclusionFieldProps) => {
  const [draft, setDraft] = useState('')

  const addEntry = () => {
    const trimmed = draft.trim()

    if (!trimmed || value.includes(trimmed)) return

    onChange([...value, trimmed])
    setDraft('')
  }

  const removeEntry = (index: number) => onChange(value.filter((_, i) => i !== index))

  const Icon = variant === 'included' ? CircleCheckIcon : CircleXIcon

  return (
    <div className='flex flex-col gap-2.5'>
      <div className='flex gap-2'>
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            addEntry()
          }}
        />
        <Button type='button' variant='outline' size='icon' onClick={addEntry} aria-label='Add item'>
          <PlusIcon className='size-4' />
        </Button>
      </div>

      {value.length > 0 && (
        <div className='overflow-hidden rounded-lg border'>
          <Table>
            <TableBody>
              {value.map((entry, index) => (
                <TableRow key={`${entry}-${index}`}>
                  <TableCell className='w-0'>
                    <Icon
                      className={cn(
                        'size-4 shrink-0',
                        variant === 'included' ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                      )}
                    />
                  </TableCell>
                  <TableCell className='w-full'>{entry}</TableCell>
                  <TableCell className='w-0'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      onClick={() => removeEntry(index)}
                      aria-label={`Remove ${entry}`}
                    >
                      <XIcon className='size-3.5' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default InclusionExclusionField
