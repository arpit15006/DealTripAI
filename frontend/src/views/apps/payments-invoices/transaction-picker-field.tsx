'use client'

// React Imports
import { useMemo, useState } from 'react'

// Third-party Imports
import { CalendarIcon, MapPinIcon } from 'lucide-react'
import { format } from 'date-fns'

// Type Imports
import type { Transaction } from '@/types/apps/transaction-types'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from '@/components/ui/combobox'
import { Separator } from '@/components/ui/separator'

export type TransactionPickerOption = {
  transaction: Transaction
  bookingTitle: string
  bookingLocation: string
  customerName: string
}

type TransactionPickerFieldProps = {
  id?: string
  options: TransactionPickerOption[]
  value: string
  onChange: (transactionId: string) => void
  disabled?: boolean
  placeholder?: string
}

const currency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const TransactionPickerField = ({
  id,
  options,
  value,
  onChange,
  disabled,
  placeholder
}: TransactionPickerFieldProps) => {
  const [search, setSearch] = useState('')

  const selected = options.find(item => item.transaction.id === value) ?? null

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return options

    return options.filter(
      item =>
        item.transaction.transactionRef.toLowerCase().includes(query) ||
        item.bookingTitle.toLowerCase().includes(query) ||
        item.customerName.toLowerCase().includes(query)
    )
  }, [options, search])

  return (
    <div className='flex flex-col gap-3'>
      <Combobox
        items={filteredOptions}
        value={selected}
        onValueChange={next => onChange(next ? next.transaction.id : '')}
        onInputValueChange={setSearch}
        itemToStringLabel={item => (item ? `${item.transaction.transactionRef} — ${item.bookingTitle}` : '')}
        isItemEqualToValue={(item, val) => item.transaction.id === val.transaction.id}
        disabled={disabled}
      >
        <ComboboxInput id={id} placeholder={placeholder ?? 'Search by transaction ref, booking, or customer...'} />
        <ComboboxContent>
          <ComboboxEmpty>No matching transactions found.</ComboboxEmpty>
          <ComboboxList>
            {(item: TransactionPickerOption) => (
              <ComboboxItem key={item.transaction.id} value={item}>
                <span className='flex min-w-0 flex-1 flex-col'>
                  <span className='truncate text-sm'>{item.bookingTitle}</span>
                  <span className='text-muted-foreground truncate text-xs'>
                    {item.transaction.transactionRef} · {item.customerName}
                  </span>
                </span>
                <span className='text-muted-foreground shrink-0 text-xs'>{currency(item.transaction.amount)}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {selected && (
        <Card className='shadow-none'>
          <CardContent className='flex flex-col gap-2'>
            <div className='flex items-center justify-between gap-4'>
              <p className='truncate text-sm font-semibold'>{selected.bookingTitle}</p>
              <p className='shrink-0 text-sm font-semibold'>{currency(selected.transaction.amount)}</p>
            </div>
            <div className='text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
              <span className='flex items-center gap-1'>
                <MapPinIcon className='size-3' />
                {selected.bookingLocation}
              </span>
              <Separator orientation='vertical' className='h-auto' />
              <span className='flex items-center gap-1'>
                <CalendarIcon className='size-3' />
                {format(new Date(selected.transaction.createdAt), 'dd MMM yyyy')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TransactionPickerField
