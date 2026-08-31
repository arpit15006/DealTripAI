'use client'

// React Imports
import { useId, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'

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
import type { Column, ColumnDef, ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

// Type Imports
import type { TourPackage } from '@/types/packages/tour-package-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination } from '@/views/apps/tour-packages/data-table-pagination'

type DataTableProps = {
  columns: ColumnDef<TourPackage>[]
  data: TourPackage[]
}

const FILTER_COLUMN_ORDER = ['category', 'packageType', 'status', 'price']

function Filter({ column }: { column: Column<TourPackage, unknown> }) {
  const id = useId()
  const filterValue = column.getFilterValue()
  const { filterVariant } = column.columnDef.meta ?? {}
  const columnHeader = typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id

  const sortedUniqueValues = useMemo(() => {
    if (filterVariant === 'range') return []

    const values = Array.from(column.getFacetedUniqueValues().keys())

    return Array.from(new Set(values.map(String))).sort()
  }, [column, filterVariant])

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

  if (filterVariant === 'range') {
    const [min, max] = (filterValue as [number, number]) ?? ['', '']

    return (
      <div className='flex w-full flex-col gap-2'>
        <Label htmlFor={`${id}-min`}>Price range</Label>
        <div className='flex items-center gap-2'>
          <Input
            id={`${id}-min`}
            type='number'
            value={min}
            onChange={e => column.setFilterValue((prev: [number, number]) => [e.target.value, prev?.[1]])}
            placeholder='Min'
            className='h-9'
          />
          <span className='text-muted-foreground text-sm'>–</span>
          <Input
            id={`${id}-max`}
            type='number'
            value={max}
            onChange={e => column.setFilterValue((prev: [number, number]) => [prev?.[0], e.target.value])}
            placeholder='Max'
            className='h-9'
          />
        </div>
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
          placeholder='Search packages...'
          className='h-9 pl-8'
        />
      </div>
    </div>
  )
}

const PREVIEW_CURSOR_OFFSET = 16

type HoverPreview = { pkg: TourPackage; x: number; y: number }

export function TourPackagesDataTable({ columns, data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [preview, setPreview] = useState<HoverPreview | null>(null)

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
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    enableSortingRemoval: false
  })

  const filterableColumns = table
    .getAllColumns()
    .filter(col => col.columnDef.meta?.filterVariant !== undefined && col.columnDef.meta.filterVariant !== 'text')
    .sort((a, b) => FILTER_COLUMN_ORDER.indexOf(a.id) - FILTER_COLUMN_ORDER.indexOf(b.id))

  const searchColumn = table.getColumn('title')

  return (
    <div className='w-full'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 p-6'>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-xl font-semibold'>Filter</span>
            <Button render={<Link href='/dashboard/tour-packages/create' />} nativeButton={false}>
              <PlusIcon className='size-4' />
              Add Package
            </Button>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4'>
            {filterableColumns.map(column => (
              <Filter key={column.id} column={column} />
            ))}
          </div>
          {searchColumn && <Filter column={searchColumn} />}
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
                <TableRow
                  key={row.id}
                  onMouseEnter={e => setPreview({ pkg: row.original, x: e.clientX, y: e.clientY })}
                  onMouseMove={e => setPreview({ pkg: row.original, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setPreview(null)}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className='h-16 first:pl-4 last:px-4'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No tour packages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div
            key={preview.pkg.id}
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className='ring-foreground/10 bg-popover pointer-events-none fixed z-50 w-56 rounded-lg p-1.5 shadow-md ring-1'
            style={{ top: preview.y + PREVIEW_CURSOR_OFFSET, left: preview.x, transform: 'translateX(-50%)' }}
          >
            <img
              src={preview.pkg.images[0]}
              alt={preview.pkg.title}
              className='aspect-video w-full rounded-md object-cover'
            />
            <p className='mt-2 px-1 text-sm font-medium'>{preview.pkg.title}</p>
            <p className='text-muted-foreground px-1 pb-1 text-xs'>{preview.pkg.location}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <DataTablePagination table={table} />
    </div>
  )
}
