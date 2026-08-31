'use client'

// Third-party Imports
import type { Table } from '@tanstack/react-table'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Hook Imports
import { usePagination } from '@/hooks/use-pagination'

const PAGE_SIZE_OPTIONS = [10, 20, 25, 30, 40, 50]

export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay: 5
  })

  const pageSizeItems = PAGE_SIZE_OPTIONS.map(size => ({ label: `${size}`, value: `${size}` }))

  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageSize = table.getState().pagination.pageSize
  const showingFrom = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const showingTo = Math.min(pageIndex * pageSize + pageSize, totalRows)

  return (
    <div className='flex flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row'>
      <p className='text-muted-foreground text-sm whitespace-nowrap' aria-live='polite'>
        Showing <span className='font-medium'>{showingFrom}</span> to <span className='font-medium'>{showingTo}</span>{' '}
        of <span className='font-medium'>{totalRows}</span> entries
      </p>

      <div className='flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8'>
        <div className='flex items-center gap-2'>
          <p className='text-sm font-medium'>Rows per page</p>
          <Select
            items={pageSizeItems}
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={value => value && table.setPageSize(Number(value))}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} side='top'>
              <SelectGroup>
                {pageSizeItems.map(item => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className='sr-only'>Previous page</span>
            <ChevronLeftIcon className='size-4' />
          </Button>

          {showLeftEllipsis && (
            <>
              <Button
                variant={currentPage === 1 ? 'outline' : 'ghost'}
                size='icon'
                className='size-8'
                onClick={() => table.setPageIndex(0)}
              >
                1
              </Button>
              <span className='text-muted-foreground px-1 text-sm'>…</span>
            </>
          )}

          {pages.map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'outline' : 'ghost'}
              size='icon'
              className='size-8'
              onClick={() => table.setPageIndex(page - 1)}
            >
              {page}
            </Button>
          ))}

          {showRightEllipsis && (
            <>
              <span className='text-muted-foreground px-1 text-sm'>…</span>
              <Button
                variant={currentPage === totalPages ? 'outline' : 'ghost'}
                size='icon'
                className='size-8'
                onClick={() => table.setPageIndex(totalPages - 1)}
              >
                {totalPages}
              </Button>
            </>
          )}

          <Button
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className='sr-only'>Next page</span>
            <ChevronRightIcon className='size-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
