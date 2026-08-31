'use client'

// React Imports
import { useId, useState } from 'react'

// Third-party Imports
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { ColumnDef, ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table'
import { SearchIcon } from 'lucide-react'

// Type Imports
import type { Booking } from '@/types/account/booking-types'
import { BOOKING_STATUS_LIST } from '@/types/account/booking-types'

// Component Imports
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination } from '@/views/apps/bookings/table/data-table-pagination'

type BookingsDataTableProps = {
  columns: ColumnDef<Booking>[]
  data: Booking[]
}

const STATUS_FILTER_ITEMS = [
  { label: 'All Statuses', value: 'all' },
  ...BOOKING_STATUS_LIST.map(status => ({ label: status, value: status }))
]

export function BookingsDataTable({ columns, data }: BookingsDataTableProps) {
  const searchId = useId()
  const statusId = useId()

  const [sorting, setSorting] = useState<SortingState>([{ id: 'travelDate', desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableSortingRemoval: false
  })

  const contactColumn = table.getColumn('contact')
  const statusColumn = table.getColumn('status')

  return (
    <div className='w-full'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 p-6'>
          <span className='text-xl font-semibold'>Filter</span>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div className='flex flex-col gap-2 sm:col-span-2'>
              <Label htmlFor={searchId}>Search</Label>
              <div className='relative'>
                <SearchIcon className='text-muted-foreground absolute top-2.5 left-2.5 size-4' />
                <Input
                  id={searchId}
                  value={(contactColumn?.getFilterValue() as string) ?? ''}
                  onChange={e => contactColumn?.setFilterValue(e.target.value)}
                  placeholder='Search by customer, reference or package...'
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
            {table.getRowModel().rows?.length ? (
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
                <TableCell colSpan={columns.length} className='h-64'>
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle className='text-base'>No bookings found</EmptyTitle>
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
