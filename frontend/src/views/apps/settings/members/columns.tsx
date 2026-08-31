'use client'

// Third-party Imports
import type { ColumnDef, RowData } from '@tanstack/react-table'
import { format } from 'date-fns'

// Type Imports
import type { Member } from '@/types/settings/members-types'
import { MEMBER_STATUS_STYLES } from '@/types/settings/members-types'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import DataTableColumnHeader from '@/views/apps/settings/members/data-table-column-header'
import MemberRowActions from '@/views/apps/settings/members/member-row-actions'

// Utils Imports
import { cn } from '@/lib/utils'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

const getInitials = (firstName: string, lastName: string) => `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()

export const columns: ColumnDef<Member>[] = [
  {
    id: 'name',
    accessorFn: row => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
    meta: { filterVariant: 'text' },
    filterFn: (row, _columnId, filterValue) =>
      `${row.original.firstName} ${row.original.lastName} ${row.original.email} ${row.original.jobTitle}`
        .toLowerCase()
        .includes(String(filterValue).toLowerCase()),
    cell: ({ row }) => (
      <div className='flex items-center gap-3'>
        <Avatar className='size-9'>
          <AvatarImage
            src={row.original.avatar || undefined}
            alt={`${row.original.firstName} ${row.original.lastName}`}
          />
          <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
            {getInitials(row.original.firstName, row.original.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>
            {row.original.firstName} {row.original.lastName}
          </p>
          <p className='text-muted-foreground truncate text-xs'>{row.original.jobTitle}</p>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
    cell: ({ row }) => <span className='text-muted-foreground text-sm'>{row.original.email}</span>
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    enableSorting: false,
    cell: ({ row }) => <span className='text-muted-foreground text-sm whitespace-nowrap'>{row.original.phone}</span>
  },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: { filterVariant: 'select' },
    filterFn: 'equalsString',
    cell: ({ row }) => <Badge variant='outline'>{row.original.role}</Badge>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { filterVariant: 'select' },
    filterFn: 'equalsString',
    cell: ({ row }) => {
      const style = MEMBER_STATUS_STYLES[row.original.status]

      return (
        <Badge className={cn('gap-1.5 capitalize', style.text, style.bg)}>
          <span className={cn('size-1.5 rounded-full', style.dot)} />
          {row.original.status}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'joinedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Joined' />,
    cell: ({ row }) => (
      <span className='text-sm whitespace-nowrap'>{format(new Date(row.original.joinedAt), 'dd MMM yyyy')}</span>
    )
  },
  {
    id: 'actions',
    size: 60,
    enableHiding: false,
    cell: ({ row }) => <MemberRowActions member={row.original} />
  }
]
