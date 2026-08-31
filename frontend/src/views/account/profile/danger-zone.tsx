'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import { Trash2Icon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

const DangerZone = () => {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDeleteAccount = () => {
    localStorage.clear()
    sessionStorage.clear()
    setIsDialogOpen(false)
    router.push('/')
  }

  return (
    <Card className='border-destructive/30'>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <p className='text-sm font-medium'>Delete account</p>
          <p className='text-muted-foreground text-sm'>
            Delete your account permanently. This will remove all your bookings, favourites, and saved data.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            render={
              <Button
                type='button'
                variant='outline'
                className='border-destructive! text-destructive! hover:bg-destructive/10! shrink-0'
              />
            }
          >
            <Trash2Icon className='size-4' />
            Delete
          </DialogTrigger>
          <DialogContent className='sm:max-w-100'>
            <DialogHeader>
              <DialogTitle>Delete account</DialogTitle>
              <DialogDescription>
                This will permanently remove all your bookings, favourites, saved cards, and profile data. This action
                can&apos;t be undone.
              </DialogDescription>
            </DialogHeader>
            <div className='flex justify-end gap-2'>
              <DialogClose render={<Button variant='outline' />}>Cancel</DialogClose>
              <Button type='button' variant='destructive' onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default DangerZone
