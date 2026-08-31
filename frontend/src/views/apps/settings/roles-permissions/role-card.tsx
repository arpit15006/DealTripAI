'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { AppRoleWithUsers, PermissionAction } from '@/types/settings/roles-types'

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
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import RoleFormDialog from '@/views/apps/settings/roles-permissions/role-form-dialog'

// Store Imports
import { useRolesStore } from '@/store/use-roles-store'

type RoleCardProps = {
  role: AppRoleWithUsers
}

const ACTION_LABELS: { key: PermissionAction; label: string }[] = [
  { key: 'read', label: 'Read' },
  { key: 'write', label: 'Write' },
  { key: 'create', label: 'Create' },
  { key: 'delete', label: 'Delete' }
]

export const RoleCard = ({ role }: RoleCardProps) => {
  const deleteRole = useRolesStore(state => state.deleteRole)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const total = role.permissions.length

  const permCounts = ACTION_LABELS.map(({ key, label }) => ({
    label,
    count: role.permissions.filter(perm => perm[key]).length
  }))

  const memberCount = role.users.length

  const handleConfirmDelete = () => {
    deleteRole(role.id)
    setDeleteDialogOpen(false)
    toast.success(
      memberCount > 0
        ? `${role.name} role deleted along with ${memberCount} ${memberCount === 1 ? 'member' : 'members'}`
        : `${role.name} role deleted`
    )
  }

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-3'>
          <div className='flex justify-between gap-2'>
            <div className='min-w-0'>
              <h4 className='text-base leading-tight font-medium'>{role.name}</h4>
              <p className='text-muted-foreground mt-0.5 text-xs'>
                {role.users.length} {role.users.length === 1 ? 'user' : 'users'}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant='ghost' size='icon-sm' aria-label='More actions' />}>
                <EllipsisVerticalIcon className='size-4' />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <PencilIcon className='size-4' />
                  Edit Role
                </DropdownMenuItem>
                <DropdownMenuItem variant='destructive' onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2Icon className='size-4' />
                  Delete Role
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className='bg-muted/50 flex items-center justify-between rounded-md px-3 py-2'>
            {permCounts.map(({ label, count }) => (
              <div key={label} className='flex flex-col items-center gap-0.5'>
                <span className='text-foreground text-sm font-semibold'>{count}</span>
                <span className='text-muted-foreground text-[10px]'>{label}</span>
              </div>
            ))}
            <div className='bg-border h-6 w-px' />
            <div className='flex flex-col items-center gap-0.5'>
              <span className='text-foreground text-sm font-semibold'>{total}</span>
              <span className='text-muted-foreground text-[10px]'>Total</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoleFormDialog role={role} open={editDialogOpen} onOpenChange={setEditDialogOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this role?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the &ldquo;{role.name}&rdquo; role?{' '}
              {memberCount > 0 ? (
                <>
                  This will also permanently delete the {memberCount} {memberCount === 1 ? 'member' : 'members'}{' '}
                  currently assigned to this role. This action cannot be undone.
                </>
              ) : (
                'This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
