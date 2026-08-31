// Third-party Imports
import { LayoutGridIcon, ListIcon, SlidersHorizontalIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type ViewMode = 'grid' | 'list'

export type TourPackageSortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating-desc' | 'duration-asc'

export const SORT_OPTIONS: { label: string; value: TourPackageSortOption }[] = [
  { label: 'Most Relevant', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Rating: High to Low', value: 'rating-desc' },
  { label: 'Duration: Short to Long', value: 'duration-asc' }
]

type TourPackagesToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  sortBy: TourPackageSortOption
  onSortChange: (value: TourPackageSortOption) => void
  viewMode: ViewMode
  onViewModeChange: (value: ViewMode) => void
  onOpenFilters: () => void
}

const TourPackagesToolbar = ({
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onOpenFilters
}: TourPackagesToolbarProps) => {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='icon'
          className='shrink-0 lg:hidden'
          aria-label='Open filters'
          onClick={onOpenFilters}
        >
          <SlidersHorizontalIcon />
        </Button>
        <h2>
          <span className='text-lg font-semibold md:text-xl lg:text-3xl'>Tour Packages</span>
        </h2>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-muted-foreground hidden text-sm sm:inline'>Sort by:</span>
        <Select
          items={SORT_OPTIONS}
          value={sortBy}
          onValueChange={value => value && onSortChange(value as TourPackageSortOption)}
        >
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <ToggleGroup
          variant='outline'
          value={[viewMode]}
          spacing={0}
          onValueChange={value => value[0] && onViewModeChange(value[0] as ViewMode)}
        >
          <ToggleGroupItem value='grid' aria-label='Grid view'>
            <LayoutGridIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value='list' aria-label='List view'>
            <ListIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}

export default TourPackagesToolbar
