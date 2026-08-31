'use client'

// Type Imports
import { PERMISSION_RESOURCES } from '@/types/settings/roles-types'

// Component Imports
import { Card, CardContent } from '@/components/ui/card'
import { PermissionsTable } from '@/views/apps/settings/roles-permissions/permissions-table'
import { RolesGrid } from '@/views/apps/settings/roles-permissions/roles-grid'

// Hook Imports
import { useRolesApp } from '@/hooks/use-roles-app'

const RolesPermissionsView = () => {
  const { rolesWithUsers, handlePermissionChange } = useRolesApp()

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Roles & Permissions</h1>
        <p className='text-muted-foreground text-sm'>
          Control what each team role can see and do across bookings, packages, finances and support.
        </p>
      </div>

      <RolesGrid roles={rolesWithUsers} />

      <Card className='min-w-0 gap-0 p-0'>
        <CardContent className='max-h-[60vh] overflow-y-auto p-0'>
          <PermissionsTable
            roles={rolesWithUsers}
            resources={PERMISSION_RESOURCES}
            onPermissionChange={handlePermissionChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default RolesPermissionsView
