'use client'

// Third-party Imports
import {
  CalendarCheckIcon,
  CreditCardIcon,
  EyeIcon,
  IdCardIcon,
  LayoutDashboardIcon,
  MessageCircleQuestionIcon,
  PackageIcon,
  PencilLineIcon,
  PlusIcon,
  StarIcon,
  TicketPercentIcon,
  Trash2Icon,
  UsersIcon
} from 'lucide-react'

// Type Imports
import type { AppRoleWithUsers, PermissionAction, PermissionResourceKey } from '@/types/settings/roles-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// Utils Imports
import { cn } from '@/lib/utils'

type PermissionsTableProps = {
  roles: AppRoleWithUsers[]
  resources: { key: PermissionResourceKey; label: string }[]
  onPermissionChange: (
    roleId: string,
    resource: PermissionResourceKey,
    action: PermissionAction,
    value: boolean
  ) => void
}

const RESOURCE_ICONS: Record<PermissionResourceKey, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboardIcon,
  inquiries: MessageCircleQuestionIcon,
  bookings: CalendarCheckIcon,
  customers: UsersIcon,
  'tour-packages': PackageIcon,
  'coupons-promotions': TicketPercentIcon,
  'payments-invoices': CreditCardIcon,
  'documents-visa': IdCardIcon,
  'reviews-ratings': StarIcon
}

const ACTIONS: { key: PermissionAction; Icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { key: 'read', Icon: EyeIcon, label: 'Read' },
  { key: 'write', Icon: PencilLineIcon, label: 'Write' },
  { key: 'create', Icon: PlusIcon, label: 'Create' },
  { key: 'delete', Icon: Trash2Icon, label: 'Delete' }
]

type PermissionChipProps = {
  Icon: React.ComponentType<{ className?: string }>
  label: string
  allowed: boolean
  onChange: (value: boolean) => void
}

const PermissionChip = ({ Icon, label, allowed, onChange }: PermissionChipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type='button'
            onClick={() => onChange(!allowed)}
            aria-label={`Toggle ${label}`}
            variant={allowed ? 'default' : 'outline'}
            size='icon-sm'
            className={cn(
              'text-muted-foreground hover:text-foreground',
              allowed && 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
          />
        }
      >
        <Icon className='size-3' />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export const PermissionsTable = ({ roles, resources, onPermissionChange }: PermissionsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className='p-4 font-semibold'>Resource</TableHead>
          {roles.map(role => (
            <TableHead key={role.id} className='p-4'>
              <span className='block font-semibold'>{role.name}</span>
              <span className='text-muted-foreground block text-xs font-normal'>
                {role.users.length} {role.users.length === 1 ? 'user' : 'users'}
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.map(resource => {
          const ResourceIcon = RESOURCE_ICONS[resource.key]

          return (
            <TableRow key={resource.key}>
              <TableCell className='p-4 font-medium'>
                <div className='flex items-center gap-2'>
                  <ResourceIcon className='text-muted-foreground size-4' />
                  {resource.label}
                </div>
              </TableCell>
              {roles.map(role => {
                const perm = role.permissions.find(p => p.resource === resource.key)

                return (
                  <TableCell key={role.id} className='px-4'>
                    <div className='flex gap-1'>
                      {ACTIONS.map(({ key, Icon, label }) => (
                        <PermissionChip
                          key={key}
                          Icon={Icon}
                          label={label}
                          allowed={perm?.[key] ?? false}
                          onChange={val => onPermissionChange(role.id, resource.key, key, val)}
                        />
                      ))}
                    </div>
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
