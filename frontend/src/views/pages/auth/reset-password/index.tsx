import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import MarqueeGallery from '@/components/ui/marquee-gallery'
import { Card, CardContent } from '@/components/ui/card'

import ResetPasswordForm from '@/views/pages/auth/reset-password/reset-password-form'

const ResetPasswordPage = () => {
  return (
    <div className='h-dvh lg:grid lg:grid-cols-2'>
      <div className='bg-background h-screen p-5 max-lg:hidden'>
        <Card className='bg-primary relative h-full justify-end overflow-hidden border-none pt-0'>
          <CardContent className='relative z-1 flex h-full flex-col justify-end overflow-hidden rounded-2xl px-0 pb-10 xl:pb-16'>
            <MarqueeGallery className='absolute inset-0' overlayBlurColor='var(--primary)' />
            <div
              className='pointer-events-none absolute inset-x-0 bottom-0 z-5'
              style={{ height: '95%', background: 'linear-gradient(to top, var(--primary), transparent)' }}
            />
            <div className='text-primary-foreground relative z-10 px-10 xl:px-16'>
              <h1 className='mb-3 text-3xl leading-[1.2] font-bold uppercase xl:mb-6 xl:text-6xl'>
                New
                <br />
                Password, New
                <br />
                Journey!
              </h1>
              <p className='text-lg xl:text-xl'>
                Your account will allow you to securely save your progress, customize your preferences, and stay
                connected across all your devices.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className='flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8'>
        <div className='flex w-full max-w-lg flex-col gap-6 p-6'>
          <Link href='/' className='text-muted-foreground group mb-6 flex items-center gap-2'>
            <ChevronLeftIcon className='transition-transform duration-200 group-hover:-translate-x-0.5' />
            <p>Back to the website</p>
          </Link>
          <div className='space-y-3'>
            <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Set new password </h2>
            <p className='text-muted-foreground'>Must be at last 8 characters.</p>
          </div>

          <div className='space-y-4'>
            {/* Form */}
            <ResetPasswordForm />

            <Button variant='ghost' className='group w-full' render={<Link href='/login' />} nativeButton={false}>
              <ChevronLeftIcon className='size-5 transition-transform duration-200 group-hover:-translate-x-0.5' />
              Back to login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
