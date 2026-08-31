'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { ColumnDef, ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table'
import { SearchIcon } from 'lucide-react'

// Type Imports
import type { DestinationTableRow } from '@/views/apps/tour-packages/destinations/columns'

// Component Imports
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination } from '@/views/apps/tour-packages/data-table-pagination'

type DestinationsDataTableProps = {
  columns: ColumnDef<DestinationTableRow>[]
  data: DestinationTableRow[]
  toolbarAction?: React.ReactNode
}

export function DestinationsDataTable({ columns, data, toolbarAction }: DestinationsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
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
    enableSortingRemoval: false
  })

  const nameColumn = table.getColumn('name')

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between gap-2 border-b p-6 max-sm:flex-col'>
        <div className='relative max-w-sm flex-1 max-sm:w-full'>
          <SearchIcon className='text-muted-foreground absolute top-2.5 left-2.5 size-4' />
          <Input
            value={(nameColumn?.getFilterValue() as string) ?? ''}
            onChange={e => nameColumn?.setFilterValue(e.target.value)}
            placeholder='Search destinations...'
            className='h-9 pl-8'
          />
        </div>
        {toolbarAction}
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className='bg-muted h-14'>
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
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No destinations found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DataTablePagination table={table} />
    </div>
  )
}
