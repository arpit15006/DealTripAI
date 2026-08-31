'use client'

// React Imports
import { useMemo, useState } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from 'lucide-react'
import { z } from 'zod'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

// Utils Imports
import { cn } from '@/lib/utils'

const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
  { regex: /[0-9]/, text: 'At least 1 number' }
]

const STRENGTH_COLORS = ['bg-border', 'bg-destructive', 'bg-amber-500', 'bg-yellow-400', 'bg-green-500']

const STRENGTH_LABELS = [
  'Enter a password',
  'Weak password',
  'Medium password',
  'Strong password',
  'Very strong password'
]

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password')
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

type FormValues = z.infer<typeof passwordSchema>

const Password = () => {
  const [isVisible, setIsVisible] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  })

  const newPassword = watch('newPassword')

  const requirementChecks = useMemo(
    () => PASSWORD_REQUIREMENTS.map(req => ({ met: req.regex.test(newPassword), text: req.text })),
    [newPassword]
  )

  const strengthScore = requirementChecks.filter(req => req.met).length

  const onSubmit = async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 800))
    toast.success('Password changed successfully')
    reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-5'>
          <FieldGroup className='gap-4'>
            <Controller
              control={control}
              name='currentPassword'
              render={({ field }) => (
                <Field data-invalid={!!errors.currentPassword}>
                  <FieldLabel htmlFor='currentPassword'>Current Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id='currentPassword'
                      type={isVisible ? 'text' : 'password'}
                      autoComplete='current-password'
                      {...field}
                    />
                    <InputGroupAddon align='inline-end'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => setIsVisible(prev => !prev)}
                        aria-label={isVisible ? 'Hide password' : 'Show password'}
                      >
                        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[errors.currentPassword]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='newPassword'
              render={({ field }) => (
                <Field data-invalid={!!errors.newPassword}>
                  <FieldLabel htmlFor='newPassword'>New Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id='newPassword'
                      type={isVisible ? 'text' : 'password'}
                      autoComplete='new-password'
                      {...field}
                    />
                    <InputGroupAddon align='inline-end'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon-sm'
                        onClick={() => setIsVisible(prev => !prev)}
                        aria-label={isVisible ? 'Hide password' : 'Show password'}
                      >
                        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[errors.newPassword]} />

                  <div className='mt-2 flex h-1 w-full gap-1'>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <span
                        key={index}
                        className={cn(
                          'h-full flex-1 rounded-full transition-all duration-500 ease-out',
                          index < strengthScore ? STRENGTH_COLORS[strengthScore] : 'bg-border'
                        )}
                      />
                    ))}
                  </div>
                  <p className='text-muted-foreground mt-2 text-sm'>{STRENGTH_LABELS[strengthScore]}</p>
                  <ul className='mt-1 flex flex-col gap-1'>
                    {requirementChecks.map(req => (
                      <li key={req.text} className='flex items-center gap-2'>
                        {req.met ? (
                          <CheckIcon className='size-3.5 text-green-600 dark:text-green-400' />
                        ) : (
                          <XIcon className='text-muted-foreground size-3.5' />
                        )}
                        <span
                          className={cn(
                            'text-xs',
                            req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                          )}
                        >
                          {req.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Field>
              )}
            />
            <Controller
              control={control}
              name='confirmPassword'
              render={({ field }) => (
                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor='confirmPassword'>Confirm Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id='confirmPassword'
                      type={isVisible ? 'text' : 'password'}
                      autoComplete='new-password'
                      {...field}
                    />
                  </InputGroup>
                  <FieldError errors={[errors.confirmPassword]} />
                </Field>
              )}
            />
          </FieldGroup>
          <div className='flex justify-end'>
            <Button type='submit' disabled={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default Password
