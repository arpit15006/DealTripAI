'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { PlusIcon } from 'lucide-react'

// Type Imports
import type { AppRoleWithUsers } from '@/types/settings/roles-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import RoleFormDialog from '@/views/apps/settings/roles-permissions/role-form-dialog'
import { RoleCard } from '@/views/apps/settings/roles-permissions/role-card'

type RolesGridProps = {
  roles: AppRoleWithUsers[]
}

export const RolesGrid = ({ roles }: RolesGridProps) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  return (
    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3'>
      {roles.map(role => (
        <RoleCard key={role.id} role={role} />
      ))}

      <Card className='items-center justify-center'>
        <CardContent className='flex flex-col items-center justify-center gap-4'>
          <div className='text-center'>
            <p className='text-lg font-medium'>Add New Role</p>
            <p className='text-muted-foreground mt-1 text-sm'>Add a role, if it does not exist.</p>
          </div>
          <Button variant='outline' onClick={() => setAddDialogOpen(true)}>
            <PlusIcon className='size-4' />
            Add New Role
          </Button>
        </CardContent>
      </Card>

      <RoleFormDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  )
}
