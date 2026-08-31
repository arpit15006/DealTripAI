'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { PlusIcon, XIcon } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type StringListFieldProps = {
  id?: string
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}

const StringListField = ({ id, value, onChange, placeholder }: StringListFieldProps) => {
  const [draft, setDraft] = useState('')

  const addEntry = () => {
    const trimmed = draft.trim()

    if (!trimmed || value.includes(trimmed)) return

    onChange([...value, trimmed])
    setDraft('')
  }

  const removeEntry = (index: number) => onChange(value.filter((_, i) => i !== index))

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
        <div className='flex flex-wrap gap-1.5'>
          {value.map((entry, index) => (
            <Badge key={`${entry}-${index}`} variant='secondary' className='gap-1 py-1 pr-1 pl-2.5'>
              {entry}
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-4 rounded-full'
                onClick={() => removeEntry(index)}
                aria-label={`Remove ${entry}`}
              >
                <XIcon className='size-3' />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export default StringListField
