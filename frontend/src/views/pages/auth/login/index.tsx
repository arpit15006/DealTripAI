'use client'

// Next Imports
import Link from 'next/link'

// Component Imports
import { ChevronLeftIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import MarqueeGallery from '@/components/ui/marquee-gallery'
import { Card, CardContent } from '@/components/ui/card'

import LoginForm from '@/views/pages/auth/login/login-form'

const LoginPage = () => {
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
                YOUR
                <br />
                NEXT ADVENTURE
                <br />
                AWAITS!
              </h1>
              <p className='text-lg xl:text-xl'>
                Thank you for registering! Please check your inbox and click the verification link to activate your
                account.
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
            <h2 className='text-2xl font-semibold md:text-3xl lg:text-4xl'>Welcome Back 👋</h2>
            <p className='text-muted-foreground'>Lets get started with your 30 days free trial</p>
          </div>

          {/* Quick Login Buttons */}
          <div className='flex flex-col gap-3'>
            <Button variant='outline' className='grow' render={<a href='#' />} nativeButton={false}>
              Login with Google
            </Button>
            <Button variant='outline' className='grow' render={<a href='#' />} nativeButton={false}>
              Login with Facebook
            </Button>
          </div>

          <div className='flex items-center gap-4'>
            <Separator className='flex-1' />
            <p>Or</p>
            <Separator className='flex-1' />
          </div>

          <div className='space-y-4'>
            {/* Form */}
            <LoginForm />

            <p className='text-muted-foreground text-center'>
              Don&apos;t have an account yet?{' '}
              <Link href='/register' className='text-foreground hover:underline'>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
