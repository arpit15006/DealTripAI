'use client'

// React Imports
import { useState } from 'react'

import { CopyIcon, CheckIcon } from 'lucide-react'

// Third-party Imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'

// Component Imports
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'

// Store Imports
import { useProfileStore } from '@/store/use-profile-store'

const inviteSchema = z.object({
  email: z.string().email('Enter a valid email address')
})

type FormValues = z.infer<typeof inviteSchema>

const ReferFriendDialog = () => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const user = useProfileStore(state => state.user)

  const referralCode = `${user.firstName}400`.toUpperCase()

  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/register?ref=${referralCode}`
      : `/register?ref=${referralCode}`

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '' }
  })

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const onSubmitInvite = (values: FormValues) => {
    toast.success(`Invite sent to ${values.email}!`)
    reset()
  }

  const avatars = [
    {
      src: '/images/avatars/avatar-1.webp',
      fallback: 'OS',
      name: 'Olivia Sparks'
    },
    {
      src: '/images/avatars/avatar-6.webp',
      fallback: 'HL',
      name: 'Howard Lloyd'
    },
    {
      src: '/images/avatars/avatar-5.webp',
      fallback: 'HR',
      name: 'Hallie Richards'
    }
  ]

  return (
    <Dialog
      open={open}
      onOpenChange={value => {
        setOpen(value)
        if (!value) reset()
      }}
    >
      <DialogTrigger render={<Button className='w-full'>Claim It</Button>} />
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Refers & Earn Credits</DialogTitle>
          <DialogDescription className='text-base'>Get $400 for each successful referral!</DialogDescription>
        </DialogHeader>
        <form className='flex flex-col gap-4 pt-4'>
          <div className='grid grow gap-3'>
            <Label htmlFor='email'>Refer by email</Label>
            <InputGroup>
              <InputGroupInput readOnly value={referralLink} />
              <InputGroupAddon align='inline-end'>
                <InputGroupButton onClick={handleCopyLink} aria-label='Copy referral link'>
                  {copied ? <CheckIcon className='text-green-600' /> : <CopyIcon />}
                  {copied ? 'Copied' : 'Copy'}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <div className='flex items-center gap-2'>
              <Separator className='flex-1' />
              <span className='text-muted-foreground text-xs'>or invite via email</span>
              <Separator className='flex-1' />
            </div>
            <Input
              onSubmit={handleSubmit(onSubmitInvite)}
              type='text'
              id='email'
              name='email'
              placeholder='myfriend@example.com'
              required
            />
          </div>
          <div className='flex -space-x-2'>
            {avatars.map((avatar, index) => (
              <Avatar key={index} className='ring-background ring-2'>
                <AvatarImage src={avatar.src} alt={avatar.name} />
                <AvatarFallback className='text-xs'>{avatar.fallback}</AvatarFallback>
              </Avatar>
            ))}
            <Avatar className='ring-background ring-2'>
              <AvatarFallback className='text-xs'>+10</AvatarFallback>
            </Avatar>
          </div>
          <DialogFooter className='sm:justify-end'>
            <DialogClose render={<Button variant='outline' />}>Cancel</DialogClose>
            <Button type='submit' disabled={isSubmitting}>
              Refer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ReferFriendDialog
