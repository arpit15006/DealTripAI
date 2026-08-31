'use client'

// Component Imports
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type BookingSortOption = 'recent' | 'price-desc' | 'price-asc'

export const BOOKING_SORT_OPTIONS: { label: string; value: BookingSortOption }[] = [
  { label: 'Recent Booking', value: 'recent' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Price: Low to High', value: 'price-asc' }
]

type BookingsToolbarProps = {
  sortBy: BookingSortOption
  onSortChange: (value: BookingSortOption) => void
}

const BookingsToolbar = ({ sortBy, onSortChange }: BookingsToolbarProps) => {
  return (
    <div className='flex items-center gap-2 self-end'>
      <span className='text-muted-foreground hidden text-sm sm:inline'>Sort by:</span>
      <Select
        items={BOOKING_SORT_OPTIONS}
        value={sortBy}
        onValueChange={value => value && onSortChange(value as BookingSortOption)}
      >
        <SelectTrigger className='w-48'>
          <SelectValue placeholder='Sort by' />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {BOOKING_SORT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export default BookingsToolbar
