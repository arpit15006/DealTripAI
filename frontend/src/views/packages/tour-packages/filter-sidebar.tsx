// React Imports
import { useRef } from 'react'

// Type Imports
import { RotateCcwIcon, StarIcon } from 'lucide-react'

import type { TourPackageCategory } from '@/types/packages/tour-package-types'
import { TOUR_PACKAGE_CATEGORY_LIST } from '@/types/packages/tour-package-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList
} from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type FilterRangeOption = {
  id: string
  label: string
  min: number
  max: number | null
}

export const DURATION_RANGES: FilterRangeOption[] = [
  { id: '1-2', label: '1 - 2 Days', min: 1, max: 2 },
  { id: '3-4', label: '3 - 4 Days', min: 3, max: 4 },
  { id: '5-6', label: '5 - 6 Days', min: 5, max: 6 },
  { id: '7-9', label: '7 - 9 Days', min: 7, max: 9 },
  { id: '9-11', label: '9 - 11 Days', min: 9, max: 11 },
  { id: '12-plus', label: '12+ Days', min: 12, max: null }
]

export const RATING_MIN = 1
export const RATING_MAX = 5

export type PackageTypeFilter = 'all' | 'premium'

type FilterSidebarProps = {
  locations: string[]
  selectedLocations: string[]
  onLocationsChange: (locations: string[]) => void
  packageType: PackageTypeFilter
  onPackageTypeChange: (packageType: PackageTypeFilter) => void
  ratingRange: [number, number]
  onRatingRangeChange: (range: [number, number]) => void
  priceBounds: { min: number; max: number }
  priceRange: [number, number]
  onPriceRangeChange: (range: [number, number]) => void
  durationRangeId: string | null
  onDurationRangeChange: (id: string | null) => void
  selectedCategories: TourPackageCategory[]
  onCategoryToggle: (category: TourPackageCategory) => void
  onReset: () => void
}

const FilterSidebar = ({
  locations,
  selectedLocations,
  onLocationsChange,
  packageType,
  onPackageTypeChange,
  ratingRange,
  onRatingRangeChange,
  priceBounds,
  priceRange,
  onPriceRangeChange,
  durationRangeId,
  onDurationRangeChange,
  selectedCategories,
  onCategoryToggle,
  onReset
}: FilterSidebarProps) => {
  const locationAnchorRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <CardContent className='flex items-center justify-between gap-2'>
        <h2 className='text-lg font-semibold'>Filters</h2>
        <Button variant='ghost' size='sm' onClick={onReset}>
          <RotateCcwIcon />
        </Button>
      </CardContent>
      <Separator />

      {/* Locations */}
      <CardContent className='flex w-full flex-col gap-2'>
        <Label htmlFor='location'>Locations</Label>
        <Combobox
          items={locations}
          multiple
          autoHighlight
          value={selectedLocations}
          onValueChange={value => onLocationsChange(value as string[])}
        >
          <ComboboxChips ref={locationAnchorRef} className='w-full'>
            {selectedLocations.map(location => (
              <ComboboxChip key={location}>{location}</ComboboxChip>
            ))}
            <ComboboxChipsInput id='location' placeholder={selectedLocations.length ? '' : 'Search locations...'} />
          </ComboboxChips>
          <ComboboxContent anchor={locationAnchorRef} className='w-(--anchor-width)'>
            <ComboboxEmpty>No location found.</ComboboxEmpty>
            <ComboboxList>
              {location => (
                <ComboboxItem key={location} value={location}>
                  {location}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </CardContent>

      {/* Package Type */}
      <CardContent className='flex flex-col gap-2'>
        <Label>Package Type</Label>
        <Tabs value={packageType} onValueChange={value => value && onPackageTypeChange(value as PackageTypeFilter)}>
          <TabsList className='w-full'>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='premium'>Premium</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>

      {/* Rating */}
      <CardContent className='*:not-first:mt-3'>
        <Label>Rating</Label>
        <div className='flex flex-col gap-3'>
          <Slider
            className='grow'
            value={ratingRange}
            onValueChange={value => onRatingRangeChange((Array.isArray(value) ? value : [value]) as [number, number])}
            min={1}
            max={5}
            step={1}
            aria-label='Rating range'
          />
          <span className='mt-3 flex w-full items-center justify-between gap-1' aria-hidden='true'>
            <span className='flex items-start gap-1'>
              1 <StarIcon className='mb-1.25 size-4 text-amber-600 dark:text-amber-400' />
            </span>
            <span className='flex items-start gap-1'>
              2 <StarIcon className='mb-1.25 size-4 text-amber-600 dark:text-amber-400' />
            </span>
            <span className='flex items-start gap-1'>
              3 <StarIcon className='mb-1.25 size-4 text-amber-600 dark:text-amber-400' />
            </span>
            <span className='flex items-start gap-1'>
              4 <StarIcon className='mb-1.25 size-4 text-amber-600 dark:text-amber-400' />
            </span>
            <span className='flex items-start gap-1'>
              5 <StarIcon className='mb-1.25 size-4 text-amber-600 dark:text-amber-400' />
            </span>
          </span>
        </div>
      </CardContent>

      {/* Price Range */}
      <CardContent className='*:not-first:mt-3'>
        <Label>Price Range</Label>
        <div className='flex flex-col gap-3'>
          <Slider
            className='grow'
            value={priceRange}
            onValueChange={value => onPriceRangeChange((Array.isArray(value) ? value : [value]) as [number, number])}
            min={priceBounds.min}
            max={priceBounds.max}
            step={50}
            aria-label='Price range'
          />
          <div className='text-muted-foreground flex items-center justify-between text-sm'>
            <span>USD {priceRange[0]}</span>
            <span>USD {priceRange[1]}</span>
          </div>
        </div>
      </CardContent>

      {/* Duration */}
      <CardContent className='flex flex-col gap-3'>
        <Label>Duration</Label>
        <ToggleGroup
          variant='outline'
          className='grid w-full grid-cols-2 gap-2'
          value={durationRangeId ? [durationRangeId] : []}
          onValueChange={value => onDurationRangeChange(value[0] ?? null)}
        >
          {DURATION_RANGES.map(range => (
            <ToggleGroupItem
              key={range.id}
              value={range.id}
              className='data-pressed:bg-primary! data-pressed:text-primary-foreground w-full justify-start'
            >
              {range.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardContent>

      {/* Travel Themes */}
      <CardContent className='flex flex-col gap-2'>
        <Label>Travel Themes</Label>
        <div className='flex flex-wrap items-center gap-2'>
          {TOUR_PACKAGE_CATEGORY_LIST.map(category => (
            <Badge
              key={category}
              className='bg-primary/10 has-data-checked:bg-primary text-primary has-data-checked:text-primary-foreground relative h-6 gap-2 px-3 py-1 capitalize'
            >
              <Checkbox
                id={`theme-${category}`}
                className='sr-only absolute'
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => onCategoryToggle(category)}
              />
              <Label
                htmlFor={`theme-${category}`}
                className='cursor-pointer text-xs font-medium capitalize after:absolute after:inset-0'
              >
                {category}
              </Label>
            </Badge>
          ))}
        </div>
      </CardContent>
    </>
  )
}

export default FilterSidebar
