'use client'

// React Imports
import type { HTMLAttributes } from 'react'

// Third-party Imports
import type { Column } from '@tanstack/react-table'

// Utils Imports
import { cn } from '@/lib/utils'

type DataTableColumnHeaderProps<TData, TValue> = HTMLAttributes<HTMLDivElement> & {
  column: Column<TData, TValue>
  title: string
}

const DataTableColumnHeader = <TData, TValue>({ title, className }: DataTableColumnHeaderProps<TData, TValue>) => {
  return <div className={cn(className)}>{title}</div>
}

export default DataTableColumnHeader
