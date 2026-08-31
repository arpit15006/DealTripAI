'use client'

// React Imports
import { useMemo, useState } from 'react'

// Third-party Imports
import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react'

// Type Imports
import type { TourPackage } from '@/types/packages/tour-package-types'

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

// Utils Imports
import { getDiscountedPrice } from '@/utils/build-package-detail'
import { Separator } from '@/components/ui/separator'

type PackagePickerFieldProps = {
  id?: string
  packages: TourPackage[]
  value: string
  onChange: (packageId: string) => void
}

const PackagePickerField = ({ id, packages, value, onChange }: PackagePickerFieldProps) => {
  const [search, setSearch] = useState('')

  const selected = packages.find(item => item.id === value) ?? null

  const filteredPackages = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return packages

    return packages.filter(
      item => item.title.toLowerCase().includes(query) || item.location.toLowerCase().includes(query)
    )
  }, [packages, search])

  return (
    <div className='flex flex-col gap-3'>
      <Combobox
        items={filteredPackages}
        value={selected}
        onValueChange={next => onChange(next ? next.id : '')}
        onInputValueChange={setSearch}
        itemToStringLabel={item => (item ? `${item.title} — ${item.location}` : '')}
        isItemEqualToValue={(item, val) => item.id === val.id}
      >
        <ComboboxInput id={id} placeholder='Search tour packages' />
        <ComboboxContent>
          <ComboboxEmpty>No packages found.</ComboboxEmpty>
          <ComboboxList>
            {(item: TourPackage) => (
              <ComboboxItem key={item.id} value={item}>
                <img src={item.images[0]} alt={item.title} className='size-8 shrink-0 rounded object-cover' />
                <span className='flex min-w-0 flex-1 flex-col'>
                  <span className='truncate text-sm'>{item.title}</span>
                  <span className='text-muted-foreground truncate text-xs'>{item.location}</span>
                </span>
                <span className='text-muted-foreground shrink-0 text-xs'>${getDiscountedPrice(item)}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {selected && (
        <Card className='shadow-none'>
          <CardContent className='flex items-center gap-4'>
            <div className='size-16 shrink-0 overflow-hidden rounded-lg'>
              <img src={selected.images[0]} alt={selected.title} className='size-full object-cover' />
            </div>
            <div className='flex min-w-0 flex-1 flex-col gap-1'>
              <p className='truncate text-base font-semibold'>{selected.title}</p>
              <div className='text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
                <span className='flex items-center gap-1'>
                  <MapPinIcon className='size-3' />
                  {selected.location}
                </span>
                <Separator orientation='vertical' className='h-auto' />
                <span className='flex items-center gap-1'>
                  <CalendarIcon className='size-3' />
                  {selected.days}D / {selected.nights}N
                </span>
                <Separator orientation='vertical' className='h-auto' />
                <span className='flex items-center gap-1'>
                  <UsersIcon className='size-3' />
                  Max {selected.maxMembers ?? 30}
                </span>
              </div>
            </div>
            <div className='shrink-0 text-right'>
              {selected.discountPercent ? (
                <>
                  <p className='text-muted-foreground text-base line-through'>${selected.price}</p>
                  <p className='font-semibold'>${getDiscountedPrice(selected)}</p>
                </>
              ) : (
                <p className='text-base font-semibold'>${selected.price}</p>
              )}
              <p className='text-muted-foreground text-sm'>/ person</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PackagePickerField
