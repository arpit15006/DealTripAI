'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { EllipsisVerticalIcon, EyeIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { DestinationTableRow } from '@/views/apps/tour-packages/destinations/columns'

// Component Imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// Store Imports
import { useDestinationsStore } from '@/store/use-destinations-store'

type DestinationRowActionsProps = {
  destination: DestinationTableRow
}

const DestinationRowActions = ({ destination }: DestinationRowActionsProps) => {
  const deleteDestination = useDestinationsStore(state => state.deleteDestination)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    deleteDestination(destination.id)
    setDeleteDialogOpen(false)
    toast.success(`${destination.name} deleted`)
  }

  return (
    <div className='flex items-center justify-end'>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant='ghost' size='icon' aria-label='More actions' />}>
          <EllipsisVerticalIcon className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={<Link href={`/dashboard/tour-packages?country=${encodeURIComponent(destination.key)}`} />}
            >
              <EyeIcon className='mr-2 size-3.5' /> View
            </DropdownMenuItem>
            <DropdownMenuItem variant='destructive' onClick={() => setDeleteDialogOpen(true)}>
              <Trash2Icon className='mr-2 size-3.5' /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this destination?</AlertDialogTitle>
            <AlertDialogDescription>
              {destination.packageCount > 0
                ? `This will permanently remove "${destination.name}". ${destination.packageCount} package${destination.packageCount === 1 ? '' : 's'} assigned to it will no longer be grouped under a destination.`
                : `This will permanently remove "${destination.name}".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DestinationRowActions
