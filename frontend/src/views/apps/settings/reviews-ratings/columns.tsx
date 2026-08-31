'use client'

// Third-party Imports
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { format } from 'date-fns'
import { StarIcon } from 'lucide-react'

// Type Imports
import type { Review } from '@/types/settings/reviews-types'
import { REVIEW_STATUS_STYLES } from '@/types/settings/reviews-types'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import ReviewRowActions from '@/views/apps/settings/reviews-ratings/review-row-actions'

// Utils Imports
import { cn } from '@/lib/utils'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

const RATING_MAX = 5

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const reviewColumns: ColumnDef<Review>[] = [
  {
    id: 'user',
    accessorFn: row => `${row.userName} ${row.tourPackageTitle} ${row.review}`,
    header: 'User',
    meta: { filterVariant: 'text' },
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Avatar className='size-9'>
          <AvatarImage src={row.original.userAvatar} alt={row.original.userName} />
          <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
            {getInitials(row.original.userName)}
          </AvatarFallback>
        </Avatar>
        <p className='truncate text-sm font-medium'>{row.original.userName}</p>
      </div>
    )
  },
  {
    accessorKey: 'tourPackageTitle',
    header: 'Tour Package',
    cell: ({ row }) => <span className='text-sm font-medium'>{row.original.tourPackageTitle}</span>
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    meta: { filterVariant: 'select' },
    filterFn: (row, columnId, filterValue) => String(row.getValue(columnId)) === filterValue,
    cell: ({ row }) => (
      <div className='flex items-center gap-0.5'>
        {Array.from({ length: RATING_MAX }).map((_, index) => (
          <StarIcon
            key={index}
            className={cn(
              'size-3.5',
              index < row.original.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
    )
  },
  {
    accessorKey: 'review',
    header: 'Review',
    enableSorting: false,
    cell: ({ row }) => <p className='max-w-72 truncate text-sm'>{row.original.review}</p>
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className='text-sm whitespace-nowrap'>{format(new Date(row.original.date), 'dd MMM yyyy')}</span>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { filterVariant: 'select' },
    filterFn: 'equalsString',
    cell: ({ row }) => {
      const style = REVIEW_STATUS_STYLES[row.original.status]

      return (
        <Badge className={cn('gap-1.5 capitalize', style.text, style.bg)}>
          <span className={cn('size-1.5 rounded-full', style.dot)} />
          {row.original.status}
        </Badge>
      )
    }
  },
  {
    id: 'actions',
    size: 60,
    enableHiding: false,
    cell: ({ row }) => <ReviewRowActions review={row.original} />
  }
]
