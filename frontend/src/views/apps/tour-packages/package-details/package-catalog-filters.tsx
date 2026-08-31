'use client'

// Third-party Imports
import { ChevronDownIcon, FunnelIcon, RotateCcwIcon, SearchIcon } from 'lucide-react'

// Type Imports
import type { PackageCatalogStatusFilter, PackageCatalogTypeFilter } from '@/store/use-package-catalog-store'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

// Store Imports
import { usePackageCatalogStore } from '@/store/use-package-catalog-store'

const TYPE_OPTIONS: { label: string; value: PackageCatalogTypeFilter }[] = [
  { label: 'All types', value: 'all' },
  { label: 'Regular', value: 'regular' },
  { label: 'Premium', value: 'premium' }
]

const STATUS_OPTIONS: { label: string; value: PackageCatalogStatusFilter }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' }
]

type PackageCatalogFiltersProps = {
  priceBounds: [number, number]
}

const PackageCatalogFilters = ({ priceBounds }: PackageCatalogFiltersProps) => {
  const search = usePackageCatalogStore(state => state.search)
  const priceRange = usePackageCatalogStore(state => state.priceRange)
  const packageType = usePackageCatalogStore(state => state.packageType)
  const status = usePackageCatalogStore(state => state.status)
  const setSearch = usePackageCatalogStore(state => state.setSearch)
  const setPriceRange = usePackageCatalogStore(state => state.setPriceRange)
  const setPackageType = usePackageCatalogStore(state => state.setPackageType)
  const setStatus = usePackageCatalogStore(state => state.setStatus)
  const resetFilters = usePackageCatalogStore(state => state.resetFilters)

  const activeRange = priceRange ?? priceBounds

  return (
    <Card className='shadow-none'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <FunnelIcon className='size-5' />
          Filters
        </CardTitle>
        <Button variant='ghost' size='sm' onClick={resetFilters}>
          <RotateCcwIcon className='size-3.5' />
          Reset
        </Button>
      </CardHeader>
      <CardContent className='grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='catalog-search'>Package Name</Label>
          <div className='relative'>
            <SearchIcon className='text-muted-foreground absolute top-2.5 left-2.5 size-4' />
            <Input
              id='catalog-search'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search by package name'
              className='pl-8'
            />
          </div>
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label>Price Range</Label>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant='outline' className='w-full justify-between font-normal' />}>
              <span>
                ${activeRange[0].toLocaleString()} - ${activeRange[1].toLocaleString()}
              </span>
              <ChevronDownIcon className='opacity-60' size={16} aria-hidden='true' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-72 shadow-none'>
              <div className='flex flex-col gap-3 px-3 py-2'>
                <Slider
                  value={activeRange}
                  onValueChange={value =>
                    setPriceRange((Array.isArray(value) ? value : [value, value]) as [number, number])
                  }
                  min={priceBounds[0]}
                  max={priceBounds[1]}
                  step={50}
                  aria-label='Price range'
                />
                <div className='text-muted-foreground flex items-center justify-between text-sm'>
                  <span>${activeRange[0].toLocaleString()}</span>
                  <span>${activeRange[1].toLocaleString()}</span>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='catalog-type'>Package Type</Label>
          <Select
            items={TYPE_OPTIONS}
            value={packageType}
            onValueChange={value => value && setPackageType(value as PackageCatalogTypeFilter)}
          >
            <SelectTrigger id='catalog-type' className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='catalog-status'>Status</Label>
          <Select
            items={STATUS_OPTIONS}
            value={status}
            onValueChange={value => value && setStatus(value as PackageCatalogStatusFilter)}
          >
            <SelectTrigger id='catalog-status' className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

export default PackageCatalogFilters
