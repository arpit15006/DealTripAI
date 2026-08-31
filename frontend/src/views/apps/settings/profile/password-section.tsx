'use client'

// React Imports
import { useMemo, useState } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import {
  PASSWORD_FORM_DEFAULT_VALUES,
  PASSWORD_REQUIREMENTS,
  passwordSchema
} from '@/views/apps/settings/profile/password-schema'
import type { PasswordFormValues } from '@/views/apps/settings/profile/password-schema'

// Store Imports
import { useAdminPasswordAction } from '@/store/use-admin-profile-store'

// Utils Imports
import { cn } from '@/lib/utils'

const getStrengthColor = (score: number) => {
  if (score === 0) return 'bg-border'
  if (score <= 1) return 'bg-destructive'
  if (score <= 2) return 'bg-orange-500'
  if (score <= 3) return 'bg-amber-500'
  if (score === 4) return 'bg-yellow-400'

  return 'bg-green-500'
}

const getStrengthText = (score: number) => {
  if (score === 0) return 'Enter a password'
  if (score <= 2) return 'Weak password'
  if (score <= 3) return 'Medium password'
  if (score === 4) return 'Strong password'

  return 'Very strong password'
}

const PasswordSection = () => {
  const { changePassword } = useAdminPasswordAction()

  const [isCurrentVisible, setIsCurrentVisible] = useState(false)
  const [isNewVisible, setIsNewVisible] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: PASSWORD_FORM_DEFAULT_VALUES
  })

  const newPassword = watch('newPassword')

  const requirementChecks = useMemo(
    () => PASSWORD_REQUIREMENTS.map(req => ({ met: req.regex.test(newPassword), text: req.text })),
    [newPassword]
  )

  const strengthScore = useMemo(() => requirementChecks.filter(req => req.met).length, [requirementChecks])

  const onSubmit = (values: PasswordFormValues) => {
    const result = changePassword(values)

    if (result === 'incorrect-current-password') {
      setError('currentPassword', { message: 'Current password is incorrect' })

      return
    }

    toast.success('Password updated')
    reset(PASSWORD_FORM_DEFAULT_VALUES)
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='text-base font-semibold'>Change Password</h3>
        <p className='text-muted-foreground text-sm'>Update your password to keep your account secure.</p>
      </div>

      <div className='lg:col-span-2'>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-5'>
          <FieldGroup>
            <Controller
              control={control}
              name='currentPassword'
              render={({ field }) => (
                <Field data-invalid={!!errors.currentPassword}>
                  <FieldLabel htmlFor='currentPassword'>Current Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id='currentPassword'
                      type={isCurrentVisible ? 'text' : 'password'}
                      placeholder='Enter current password'
                      {...field}
                    />
                    <InputGroupAddon align='inline-end' className='pr-1.5'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => setIsCurrentVisible(prev => !prev)}
                        className='text-muted-foreground focus-visible:ring-ring/50 rounded-l-none hover:bg-transparent'
                      >
                        {isCurrentVisible ? <EyeOffIcon /> : <EyeIcon />}
                        <span className='sr-only'>{isCurrentVisible ? 'Hide password' : 'Show password'}</span>
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
                      type={isNewVisible ? 'text' : 'password'}
                      placeholder='Enter new password'
                      {...field}
                    />
                    <InputGroupAddon align='inline-end' className='pr-1.5'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => setIsNewVisible(prev => !prev)}
                        className='text-muted-foreground focus-visible:ring-ring/50 rounded-l-none hover:bg-transparent'
                      >
                        {isNewVisible ? <EyeOffIcon /> : <EyeIcon />}
                        <span className='sr-only'>{isNewVisible ? 'Hide password' : 'Show password'}</span>
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>

                  <div className='mt-1 flex h-1 w-full gap-1'>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className={cn(
                          'h-full flex-1 rounded-full transition-all duration-500 ease-out',
                          index < strengthScore ? getStrengthColor(strengthScore) : 'bg-border'
                        )}
                      />
                    ))}
                  </div>
                  <p className='text-foreground text-sm font-medium'>{getStrengthText(strengthScore)}</p>

                  <ul className='flex flex-col gap-1.5'>
                    {requirementChecks.map((req, index) => (
                      <li key={index} className='flex items-center gap-2'>
                        {req.met ? (
                          <CheckIcon className='size-4 text-green-600 dark:text-green-400' />
                        ) : (
                          <XIcon className='text-muted-foreground size-4' />
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

                  <FieldError errors={[errors.newPassword]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name='confirmPassword'
              render={({ field }) => (
                <Field data-invalid={!!errors.confirmPassword}>
                  <FieldLabel htmlFor='confirmPassword'>Confirm New Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id='confirmPassword'
                      type={isNewVisible ? 'text' : 'password'}
                      placeholder='Re-enter new password'
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
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordSection
