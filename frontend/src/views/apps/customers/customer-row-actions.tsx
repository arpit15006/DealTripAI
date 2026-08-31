'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import { EllipsisVerticalIcon, EyeIcon, MailIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { Customer } from '@/types/apps/customer-types'

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
import { useCustomersStore } from '@/store/use-customers-store'
import { useProfileStore } from '@/store/use-profile-store'

// Utils Imports
import { isSyncedCustomer } from '@/utils/customer-utils'

type CustomerRowActionsProps = {
  customer: Customer
}

const CustomerRowActions = ({ customer }: CustomerRowActionsProps) => {
  const deleteCustomer = useCustomersStore(state => state.deleteCustomer)
  const profileUser = useProfileStore(state => state.user)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const isSynced = isSyncedCustomer(customer, profileUser)

  const handleDelete = () => {
    deleteCustomer(customer.id)
    setDeleteDialogOpen(false)
    toast.success(`${customer.name} deleted`)
  }

  return (
    <div className='flex items-center justify-end gap-1'>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant='ghost'
              size='icon'
              aria-label='View customer profile'
              render={<Link href={`/dashboard/customers-list/profile?id=${customer.id}`} />}
              nativeButton={false}
            />
          }
        >
          <EyeIcon className='size-4' />
        </TooltipTrigger>
        <TooltipContent>
          <p>View Profile</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant='ghost' size='icon' aria-label='More actions' />}>
          <EllipsisVerticalIcon className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuItem render={<Link href={`mailto:${customer.email}`} />}>
              <MailIcon className='mr-2 size-3.5' /> Send Email
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              disabled={isSynced}
              title={isSynced ? "Linked to your signed-in profile — can't be deleted" : undefined}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2Icon className='mr-2 size-3.5' /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &ldquo;{customer.name}&rdquo; from the customer list.
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

export default CustomerRowActions
