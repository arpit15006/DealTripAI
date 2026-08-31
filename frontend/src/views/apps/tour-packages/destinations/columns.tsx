'use client'

// Third-party Imports
import type { ColumnDef, RowData } from '@tanstack/react-table'

// Type Imports
import type { Destination } from '@/types/packages/destination-types'

// Component Imports
import { Badge } from '@/components/ui/badge'
import DestinationRowActions from '@/views/apps/tour-packages/destinations/destination-row-actions'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

export type DestinationTableRow = Destination & {
  packageCount: number
  publishedCount: number
  minPrice: number | null
  maxPrice: number | null
}

export const columns: ColumnDef<DestinationTableRow>[] = [
  {
    accessorKey: 'name',
    header: 'Location',
    meta: { filterVariant: 'text' },
    filterFn: (row, columnId, filterValue) =>
      row.original.name.toLowerCase().includes(String(filterValue).toLowerCase()),
    cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>
  },
  {
    accessorKey: 'packageCount',
    header: 'Packages',
    cell: ({ row }) => (
      <Badge variant='secondary'>
        {row.original.packageCount} package{row.original.packageCount === 1 ? '' : 's'}
      </Badge>
    )
  },
  {
    accessorKey: 'publishedCount',
    header: 'Published',
    cell: ({ row }) => <Badge variant='outline'>{row.original.publishedCount} published</Badge>
  },
  {
    id: 'priceRange',
    header: 'Price Range',
    cell: ({ row }) =>
      row.original.minPrice !== null ? (
        <span className='text-muted-foreground text-sm'>
          ${row.original.minPrice.toLocaleString()} – ${row.original.maxPrice?.toLocaleString()}
        </span>
      ) : (
        <span className='text-muted-foreground text-sm'>—</span>
      )
  },
  {
    id: 'actions',
    size: 60,
    enableHiding: false,
    cell: ({ row }) => <DestinationRowActions destination={row.original} />
  }
]
