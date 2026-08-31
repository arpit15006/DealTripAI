'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { EllipsisVerticalIcon, EyeIcon, PencilIcon, RadioIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { TourPackage } from '@/types/packages/tour-package-types'

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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// Store Imports
import { useTourPackagesStore } from '@/store/use-tour-packages-store'

type PackageRowActionsProps = {
  tourPackage: TourPackage
}

const PackageRowActions = ({ tourPackage }: PackageRowActionsProps) => {
  const togglePublish = useTourPackagesStore(state => state.togglePublish)
  const deletePackage = useTourPackagesStore(state => state.deletePackage)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const isPublished = tourPackage.isPublished !== false

  const handleTogglePublish = () => {
    togglePublish(tourPackage.id)
    toast.success(isPublished ? `${tourPackage.title} unpublished` : `${tourPackage.title} published`)
  }

  const handleDelete = () => {
    deletePackage(tourPackage.id)
    setDeleteDialogOpen(false)
    toast.success(`${tourPackage.title} deleted`)
  }

  return (
    <div className='flex items-center justify-end gap-1'>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant='ghost'
              size='icon'
              aria-label='View package'
              render={<Link href={`/dashboard/tour-packages/${tourPackage.id}`} />}
              nativeButton={false}
            />
          }
        >
          <EyeIcon className='size-4' />
        </TooltipTrigger>
        <TooltipContent>
          <p>View</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant='ghost'
              size='icon'
              aria-label='Edit package'
              render={<Link href={`/dashboard/tour-packages/${tourPackage.id}/edit`} />}
              nativeButton={false}
            />
          }
        >
          <PencilIcon className='size-4' />
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant='ghost' size='icon' aria-label='More actions' />}>
          <EllipsisVerticalIcon className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleTogglePublish}>
              <RadioIcon className='mr-2 size-3.5' /> {isPublished ? 'Unpublish' : 'Publish'}
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
            <AlertDialogTitle>Delete this package?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &ldquo;{tourPackage.title}&rdquo; from the tour packages list.
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

export default PackageRowActions
