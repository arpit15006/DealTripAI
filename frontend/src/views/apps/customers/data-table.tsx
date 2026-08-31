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
import type { ColumnDef, ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table'
import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon, SearchIcon, UploadIcon } from 'lucide-react'

// Type Imports
import type { CreateCustomerInput, Customer } from '@/types/apps/customer-types'
import { CUSTOMER_STATUS_LIST } from '@/types/apps/customer-types'

// Component Imports
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DataTablePagination } from '@/views/apps/customers/data-table-pagination'
import ImportCustomersDialog from '@/views/apps/customers/import-customers-dialog'

// Store Imports
import { useCustomersStore } from '@/store/use-customers-store'

// Utils Imports
import { exportCustomersToCSV, exportCustomersToExcel, exportCustomersToJSON } from '@/utils/export-customers-utils'

type CustomersDataTableProps = {
  columns: ColumnDef<Customer>[]
  data: Customer[]
}

const INITIAL_LOAD_DELAY_MS = 300
const SKELETON_ROW_COUNT = 6

const STATUS_FILTER_ITEMS = [
  { label: 'All Statuses', value: 'all' },
  ...CUSTOMER_STATUS_LIST.map(status => ({ label: status, value: status }))
]

export function CustomersDataTable({ columns, data }: CustomersDataTableProps) {
  const searchId = useId()
  const statusId = useId()

  const importCustomers = useCustomersStore(state => state.importCustomers)

  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

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

  const nameColumn = table.getColumn('name')
  const statusColumn = table.getColumn('status')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), INITIAL_LOAD_DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  const getExportCustomers = () => table.getFilteredRowModel().rows.map(row => row.original)

  const handleExportCsv = () => exportCustomersToCSV(getExportCustomers())
  const handleExportExcel = () => exportCustomersToExcel(getExportCustomers())
  const handleExportJson = () => exportCustomersToJSON(getExportCustomers())

  const handleImport = (customers: CreateCustomerInput[]) => importCustomers(customers)

  return (
    <div className='w-full'>
      <div className='border-b'>
        <div className='flex flex-col gap-4 p-6'>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-xl font-semibold'>Filter</span>
            <div className='flex items-center gap-2'>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant='outline' />}>
                  <UploadIcon className='size-4' />
                  <span className='max-lg:hidden'>Export</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-auto'>
                  <DropdownMenuItem onClick={handleExportCsv}>
                    <FileTextIcon className='size-4' />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheetIcon className='size-4' />
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportJson}>
                    <FileTextIcon className='size-4' />
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant='outline' onClick={() => setIsImportDialogOpen(true)}>
                <DownloadIcon className='size-4' />
                <span className='max-lg:hidden'>Import</span>
              </Button>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div className='flex flex-col gap-2 sm:col-span-2'>
              <Label htmlFor={searchId}>Search</Label>
              <div className='relative'>
                <SearchIcon className='text-muted-foreground absolute top-2.5 left-2.5 size-4' />
                <Input
                  id={searchId}
                  value={(nameColumn?.getFilterValue() as string) ?? ''}
                  onChange={e => nameColumn?.setFilterValue(e.target.value)}
                  placeholder='Mitchell Johnson'
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
            {isLoading ? (
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, cellIndex) => (
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
                <TableCell colSpan={columns.length} className='h-64'>
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle className='text-base'>No customers found</EmptyTitle>
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

      <ImportCustomersDialog
        open={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImport}
      />
    </div>
  )
}
