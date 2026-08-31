'use client'

// React Imports
import { useMemo, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import {
  IdCardLanyardIcon,
  InfoIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  PowerIcon,
  PowerOffIcon,
  TicketIcon,
  Trash2Icon,
  UserIcon,
  WalletIcon
} from 'lucide-react'
import { toast } from 'sonner'

// Type Imports
import type { Customer } from '@/types/apps/customer-types'
import { CUSTOMER_STATUS_STYLES } from '@/types/apps/customer-types'

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import EditCustomerDialog from '@/views/apps/customers/profile/edit-customer-dialog'
import type { EditCustomerFormValues } from '@/views/apps/customers/profile/edit-customer-schema'

// Store Imports
import { useBookingsStore } from '@/store/use-bookings-store'
import { useCustomersStore } from '@/store/use-customers-store'
import { useProfileStore } from '@/store/use-profile-store'

// Utils Imports
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

type ProfileHeaderCardProps = {
  customer: Customer
  isSynced: boolean
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')

const ProfileHeaderCard = ({ customer, isSynced }: ProfileHeaderCardProps) => {
  const router = useRouter()

  const updateCustomer = useCustomersStore(state => state.updateCustomer)
  const setCustomerStatus = useCustomersStore(state => state.setCustomerStatus)
  const deleteCustomer = useCustomersStore(state => state.deleteCustomer)
  const profileUser = useProfileStore(state => state.user)
  const updatePersonalInfo = useProfileStore(state => state.updatePersonalInfo)
  const bookings = useBookingsStore(state => state.bookings)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const style = CUSTOMER_STATUS_STYLES[customer.status]
  const nextStatus = customer.status === 'active' ? 'inactive' : 'active'

  const quickStats = useMemo(() => {
    const customerBookings = bookings.filter(booking => booking.contactEmail === customer.email)

    const totalSpent = customerBookings
      .filter(booking => booking.status !== 'cancelled')
      .reduce((sum, booking) => sum + booking.totalAmount, 0)

    return [
      { label: 'Total Bookings', value: customerBookings.length, icon: TicketIcon },
      { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: WalletIcon }
    ]
  }, [bookings, customer.email])

  const handleEditSubmit = (values: EditCustomerFormValues) => {
    if (isSynced) {
      const [firstName, ...rest] = values.name.trim().split(' ')

      updatePersonalInfo({
        firstName: firstName ?? '',
        lastName: rest.join(' '),
        email: values.email,
        phone: values.phone,
        gender: profileUser.gender,
        country: profileUser.address.country
      })
      setCustomerStatus(customer.id, values.status)
    } else {
      updateCustomer(customer.id, values)
    }

    toast.success('Customer updated')
  }

  const handleToggleStatus = () => {
    setCustomerStatus(customer.id, nextStatus)
    toast.success(nextStatus === 'active' ? `${customer.name} activated` : `${customer.name} deactivated`)
  }

  const handleDelete = () => {
    deleteCustomer(customer.id)
    setIsDeleteOpen(false)
    toast.success(`${customer.name} deleted`)
    router.push('/dashboard/customers')
  }

  return (
    <Card className='shadow-none'>
      <CardContent className='flex flex-col items-center gap-4 text-center'>
        <Avatar className='size-24'>
          <AvatarImage src={customer.avatar || undefined} alt={customer.name} />
          <AvatarFallback className='bg-primary/10 text-primary text-2xl font-semibold'>
            {getInitials(customer.name) || 'NA'}
          </AvatarFallback>
        </Avatar>

        <h2 className='text-lg font-semibold'>{customer.name}</h2>

        <div className='flex flex-wrap items-center justify-center gap-2'>
          <Badge className={cn('gap-1.5 capitalize', style.text, style.bg)}>
            <span className={cn('size-1.5 rounded-full', style.dot)} />
            {customer.status}
          </Badge>
        </div>

        <div className='grid w-full grid-cols-2 gap-3'>
          {quickStats.map(stat => (
            <div key={stat.label} className='bg-muted/40 flex flex-col items-center gap-2 rounded-lg border p-4'>
              <stat.icon />
              <p className='text-lg font-semibold'>{stat.value}</p>
              <p className='text-muted-foreground text-xs'>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className='w-full text-left'>
          <h3 className='text-sm font-semibold'>Details</h3>
          <Separator className='my-3' />
          <div className='mt-2 space-y-3'>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                <IdCardLanyardIcon className='size-3.5' />
                Customer ID
              </span>
              <span className='truncate text-sm font-medium'>{customer.id}</span>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                <UserIcon className='size-3.5' />
                Name
              </span>
              <span className='truncate text-sm font-medium'>{customer.name}</span>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                <MailIcon className='size-3.5' />
                Email
              </span>
              <span className='truncate text-sm font-medium'>{customer.email}</span>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                <PhoneIcon className='size-3.5' />
                Contact
              </span>
              <span className='text-sm font-medium'>{customer.phone}</span>
            </div>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-muted-foreground flex items-center gap-1.5 text-sm'>
                <InfoIcon className='size-3.5' />
                Status
              </span>
              <span className={cn('flex items-center gap-1.5 truncate text-sm font-medium capitalize', style.text)}>
                <span className={cn('size-1.5 shrink-0 rounded-full', style.dot)} />
                {customer.status}
              </span>
            </div>
          </div>
        </div>

        <div className='grid w-full grid-cols-2 gap-2'>
          <Button onClick={() => setIsEditOpen(true)}>
            <PencilIcon className='size-4' />
            <span className='max-sm:hidden'>Edit</span>
          </Button>

          <Button
            variant='outline'
            className='text-destructive hover:text-destructive'
            disabled={isSynced}
            title={isSynced ? "Linked to your signed-in profile — can't be deleted" : undefined}
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2Icon className='size-4' />
            <span className='max-sm:hidden'>Delete</span>
          </Button>
          <Button variant='secondary' className='col-span-2' onClick={handleToggleStatus}>
            {nextStatus === 'active' ? <PowerIcon className='size-4' /> : <PowerOffIcon className='size-4' />}
            <span className='max-sm:hidden'>{nextStatus === 'active' ? 'Activate' : 'Deactivate'}</span>
          </Button>
        </div>
      </CardContent>

      <EditCustomerDialog
        open={isEditOpen}
        customer={customer}
        isSynced={isSynced}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
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
    </Card>
  )
}

export default ProfileHeaderCard
