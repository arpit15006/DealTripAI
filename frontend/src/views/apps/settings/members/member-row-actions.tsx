'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { EllipsisVerticalIcon, PencilIcon, ShieldCheckIcon, ShieldOffIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { Member } from '@/types/settings/members-types'

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
import MemberFormDialog from '@/views/apps/settings/members/member-form-dialog'

// Store Imports
import { useMembersStore } from '@/store/use-members-store'

type MemberRowActionsProps = {
  member: Member
}

const MemberRowActions = ({ member }: MemberRowActionsProps) => {
  const deleteMember = useMembersStore(state => state.deleteMember)
  const setMemberStatus = useMembersStore(state => state.setMemberStatus)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const isSuspended = member.status === 'suspended'

  const handleToggleStatus = () => {
    setMemberStatus(member.id, isSuspended ? 'active' : 'suspended')
    toast.success(isSuspended ? `${member.firstName} reactivated` : `${member.firstName} suspended`)
  }

  const handleDelete = () => {
    deleteMember(member.id)
    setDeleteDialogOpen(false)
    toast.success(`${member.firstName} ${member.lastName} removed`)
  }

  return (
    <div className='flex items-center justify-end'>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant='ghost' size='icon' aria-label='More actions' />}>
          <EllipsisVerticalIcon className='size-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              <PencilIcon className='mr-2 size-3.5' /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleStatus} disabled={member.status === 'invited'}>
              {isSuspended ? (
                <>
                  <ShieldCheckIcon className='mr-2 size-3.5' /> Reactivate
                </>
              ) : (
                <>
                  <ShieldOffIcon className='mr-2 size-3.5' /> Suspend
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem variant='destructive' onClick={() => setDeleteDialogOpen(true)}>
              <Trash2Icon className='mr-2 size-3.5' /> Remove
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <MemberFormDialog member={member} open={editDialogOpen} onOpenChange={setEditDialogOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &ldquo;{member.firstName} {member.lastName}&rdquo; from your team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default MemberRowActions
