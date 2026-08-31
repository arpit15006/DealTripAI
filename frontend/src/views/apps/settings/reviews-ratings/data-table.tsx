'use client'

// React Imports
import { useId, useMemo, useState } from 'react'

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
import type { Column, ColumnDef, ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table'
import { SearchIcon } from 'lucide-react'

// Type Imports
import type { Review } from '@/types/settings/reviews-types'

// Component Imports
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination } from '@/views/apps/settings/reviews-ratings/data-table-pagination'

type ReviewsDataTableProps = {
  columns: ColumnDef<Review>[]
  data: Review[]
}

const FILTER_COLUMN_ORDER = ['rating', 'status']

function Filter({ column }: { column: Column<Review, unknown> }) {
  const id = useId()
  const filterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnHeader = typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id

  const sortedUniqueValues = useMemo(() => {
    const values = Array.from(column.getFacetedUniqueValues().keys())

    return Array.from(new Set(values.map(String))).sort()
  }, [column])

  if (filterVariant === 'select') {
    const items = [{ label: 'All', value: 'all' }, ...sortedUniqueValues.map(value => ({ label: value, value }))]

    return (
      <div className='flex w-full flex-col gap-2'>
        <Label htmlFor={`${id}-select`}>{columnHeader}</Label>
        <Select
          items={items}
          value={(filterValue as string) ?? 'all'}
          onValueChange={value => column.setFilterValue(value === 'all' ? undefined : value)}
        >
          <SelectTrigger id={`${id}-select`} className='h-9 w-full capitalize'>
            <SelectValue placeholder={`All ${columnHeader.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {items.map(item => (
                <SelectItem key={item.value} value={item.value} className='capitalize'>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className='flex w-full flex-col gap-2'>
      <Label htmlFor={`${id}-input`}>Search</Label>
      <div className='relative'>
        <SearchIcon className='text-muted-foreground absolute top-2.5 left-2.5 size-4' />
        <Input
          id={`${id}-input`}
          value={(filterValue ?? '') as string}
          onChange={e => column.setFilterValue(e.target.value)}
          placeholder='Search by user, package or review...'
          className='h-9 pl-8'
        />
      </div>
    </div>
  )
}

export function ReviewsDataTable({ columns, data }: ReviewsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])
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

  const filterableColumns = table
    .getAllColumns()
    .filter(col => col.columnDef.meta?.filterVariant === 'select')
    .sort((a, b) => FILTER_COLUMN_ORDER.indexOf(a.id) - FILTER_COLUMN_ORDER.indexOf(b.id))

  const searchColumn = table.getColumn('user')

  return (
    <div className='w-full'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 p-6'>
          <span className='text-xl font-semibold'>Filter</span>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4'>
            {searchColumn && (
              <div className='sm:col-span-2'>
                <Filter column={searchColumn} />
              </div>
            )}
            {filterableColumns.map(column => (
              <Filter key={column.id} column={column} />
            ))}
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
                      <EmptyTitle className='text-base'>No reviews found</EmptyTitle>
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
