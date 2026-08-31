'use client'

// React Imports
import { useEffect, useId, useState } from 'react'

// Third-party Imports
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState
} from '@tanstack/react-table'
import { SearchIcon, StarIcon, TicketPercentIcon } from 'lucide-react'

// Type Imports
import type { Coupon } from '@/types/apps/coupon-types'
import { COUPON_DISCOUNT_TYPE_LIST, COUPON_STATUS_LIST } from '@/types/apps/coupon-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination } from '@/views/apps/coupons-promotions/data-table-pagination'

// Store Imports
import { MAX_FEATURED_COUPONS } from '@/store/use-coupons-store'

type CouponsDataTableProps = {
  columns: ColumnDef<Coupon>[]
  data: Coupon[]
}

const INITIAL_LOAD_DELAY_MS = 300
const SKELETON_ROW_COUNT = 6

const STATUS_FILTER_ITEMS = [
  { label: 'All Statuses', value: 'all' },
  ...COUPON_STATUS_LIST.map(status => ({ label: status, value: status }))
]

const TYPE_FILTER_ITEMS = [
  { label: 'All Types', value: 'all' },
  ...COUPON_DISCOUNT_TYPE_LIST.map(type => ({ label: type, value: type }))
]

export function CouponsDataTable({ columns, data }: CouponsDataTableProps) {
  const searchId = useId()
  const statusId = useId()
  const typeId = useId()

  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const [columnVisibility] = useState<VisibilityState>({ discountType: false })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableSortingRemoval: false
  })

  const codeColumn = table.getColumn('code')
  const statusColumn = table.getColumn('status')
  const typeColumn = table.getColumn('discountType')

  const featuredCount = data.filter(item => item.isFeatured).length

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), INITIAL_LOAD_DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className='w-full'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 p-6'>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-xl font-semibold'>Filter</span>
            <Badge variant='outline' className='gap-1.5'>
              <StarIcon className='size-3.5' />
              {featuredCount}/{MAX_FEATURED_COUPONS} Featured on Landing Page
            </Badge>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
            <div className='flex flex-col gap-2 sm:col-span-2'>
              <Label htmlFor={searchId}>Search</Label>
              <div className='relative'>
                <SearchIcon className='text-muted-foreground absolute top-2.5 left-2.5 size-4' />
                <Input
                  id={searchId}
                  value={(codeColumn?.getFilterValue() as string) ?? ''}
                  onChange={e => codeColumn?.setFilterValue(e.target.value)}
                  placeholder='Search by code or title...'
                  className='h-9 pl-8'
                />
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor={statusId}>Status</Label>
              <Select
                items={STATUS_FILTER_ITEMS}
                value={(statusColumn?.getFilterValue() as string) ?? 'all'}
                onValueChange={value => statusColumn?.setFilterValue(value === 'all' ? undefined : value)}
              >
                <SelectTrigger id={statusId} className='h-9 w-full capitalize'>
                  <SelectValue placeholder='All statuses' />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    {STATUS_FILTER_ITEMS.map(item => (
                      <SelectItem key={item.value} value={item.value} className='capitalize'>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor={typeId}>Type</Label>
              <Select
                items={TYPE_FILTER_ITEMS}
                value={(typeColumn?.getFilterValue() as string) ?? 'all'}
                onValueChange={value => typeColumn?.setFilterValue(value === 'all' ? undefined : value)}
              >
                <SelectTrigger id={typeId} className='h-9 w-full capitalize'>
                  <SelectValue placeholder='All types' />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    {TYPE_FILTER_ITEMS.map(item => (
                      <SelectItem key={item.value} value={item.value} className='capitalize'>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className='bg-muted h-14 border-t'>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} style={{ width: header.getSize() }} className='first:pl-4 last:px-4'>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {table.getVisibleFlatColumns().map((_, cellIndex) => (
                    <TableCell key={cellIndex} className='h-16 first:pl-4 last:px-4'>
                      <Skeleton className='h-4 w-full max-w-32' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className='h-16 first:pl-4 last:px-4'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getVisibleFlatColumns().length} className='h-64'>
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant='icon'>
                        <TicketPercentIcon />
                      </EmptyMedia>
                      <EmptyTitle className='text-base'>No coupons found</EmptyTitle>
                      <EmptyDescription>Try adjusting your search or filter criteria.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
