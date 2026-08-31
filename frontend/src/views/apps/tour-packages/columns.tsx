'use client'

// Third-party Imports
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { SparklesIcon } from 'lucide-react'

// Type Imports
import type { TourPackage } from '@/types/packages/tour-package-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import PackageRowActions from '@/views/apps/tour-packages/package-row-actions'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

export const columns: ColumnDef<TourPackage>[] = [
  {
    accessorKey: 'title',
    header: 'Package',
    meta: { filterVariant: 'text' },
    filterFn: (row, columnId, filterValue) =>
      `${row.original.title} ${row.original.location}`.toLowerCase().includes(String(filterValue).toLowerCase()),
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <img
          src={row.original.images[0]}
          alt={row.original.title}
          className='size-10 shrink-0 rounded-md object-cover'
        />
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>{row.original.title}</p>
          <p className='text-muted-foreground truncate text-xs'>{row.original.location}</p>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'category',
    header: 'Category',
    meta: { filterVariant: 'select' },
    cell: ({ row }) => (
      <Badge variant='outline' className='capitalize'>
        {row.original.category}
      </Badge>
    )
  },
  {
    accessorKey: 'packageType',
    header: 'Type',
    meta: { filterVariant: 'select' },
    cell: ({ row }) =>
      row.original.packageType === 'premium' ? (
        <Badge className='gap-1 border-none bg-amber-500 text-white'>
          <SparklesIcon className='size-3' />
          Premium
        </Badge>
      ) : (
        <Badge variant='secondary' className='capitalize'>
          Regular
        </Badge>
      )
  },
  {
    id: 'duration',
    header: 'Duration',
    enableSorting: false,
    cell: ({ row }) => `${row.original.days}D / ${row.original.nights}N`
  },
  {
    accessorKey: 'price',
    header: () => <div>Price</div>,
    meta: { filterVariant: 'range' },
    filterFn: 'inNumberRange',
    cell: ({ row }) => <div className='font-medium'>${row.original.price.toLocaleString()}</div>
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => (row.original.rating > 0 ? row.original.rating.toFixed(1) : '—')
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: row => (row.isPublished === false ? 'draft' : 'published'),
    meta: { filterVariant: 'select' },
    cell: ({ row }) => (
      <Badge variant={row.original.isPublished === false ? 'outline' : 'secondary'} className='capitalize'>
        {row.original.isPublished === false ? 'Draft' : 'Published'}
      </Badge>
    )
  },
  {
    id: 'actions',
    size: 60,
    enableHiding: false,
    cell: ({ row }) => <PackageRowActions tourPackage={row.original} />
  }
]
