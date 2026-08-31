'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'

const ForgotPasswordForm = () => {
  return (
    <form onSubmit={e => e.preventDefault()}>
      <Field className='gap-4'>
        {/* Email */}
        <Input type='email' placeholder='Enter your email address' />

        <Button className='w-full' type='submit'>
          Send Reset Link
        </Button>
      </Field>
    </form>
  )
}

export default ForgotPasswordForm
