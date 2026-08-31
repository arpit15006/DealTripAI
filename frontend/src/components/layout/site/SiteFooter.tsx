'use client'

// Next Imports
import Link from 'next/link'

// Component Imports
import { MailIcon } from 'lucide-react'

import LogoSvg from '@/assets/svg/logo'
import HoverText from '@/components/ui/hover-text'

// SVGs Imports
import InstagramIcon from '@/assets/svg/instagram-icon'
import FacebookIcon from '@/assets/svg/facebook-icon'
import TwitterIcon from '@/assets/svg/twitter-icon'
import { Separator } from '@/components/ui/separator'

// Store Imports
import { useCompanyProfile, useSocialLinks } from '@/store/use-store-information-store'

const SiteFooter = () => {
  const { companyProfile } = useCompanyProfile()
  const { socialLinks } = useSocialLinks()

  return (
    <footer className='bg-muted relative overflow-hidden border-t'>
      <div className='mx-auto flex max-w-360 flex-col gap-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8'>
        <div className='text-muted-foreground space-y-8'>
          <div className='flex justify-between gap-8 max-lg:flex-col'>
            <div className='space-y-3'>
              <Link href='/' className='text-foreground inline-flex items-center gap-4'>
                <LogoSvg className='size-10' />
                <span className='text-2xl font-semibold'>{companyProfile.name}</span>
              </Link>
              <p className='max-w-lg'>{companyProfile.description}</p>
            </div>

            <div className='flex gap-20 max-sm:flex-col max-sm:gap-8'>
              <div className='flex flex-col gap-5'>
                <h3 className='text-foreground text-lg font-medium'>Explore</h3>
                <div className='flex flex-col gap-3'>
                  <Link href='/#' className='hover:text-foreground transition-colors duration-300'>
                    Home
                  </Link>
                  <Link href='/tour-packages' className='hover:text-foreground transition-colors duration-300'>
                    Tour Packages
                  </Link>
                  <Link href='/my-dashboard/bookings' className='hover:text-foreground transition-colors duration-300'>
                    My Bookings
                  </Link>
                  <Link
                    href='/my-dashboard/favourites'
                    className='hover:text-foreground transition-colors duration-300'
                  >
                    My Favourites
                  </Link>
                  <Link href='/about-us' className='hover:text-foreground transition-colors duration-300'>
                    About Us
                  </Link>
                </div>
              </div>

              <div className='flex flex-col gap-5'>
                <h3 className='text-foreground text-lg font-medium'>Support</h3>
                <div className='flex flex-col gap-3'>
                  <Link
                    href='/my-dashboard/track-booking'
                    className='hover:text-foreground transition-colors duration-300'
                  >
                    Track Booking
                  </Link>
                  <Link href='/login' className='hover:text-foreground transition-colors duration-300'>
                    Login
                  </Link>
                  <Link href='/register' className='hover:text-foreground transition-colors duration-300'>
                    Register
                  </Link>
                  <Link href='#' className='hover:text-foreground transition-colors duration-300'>
                    Terms &amp; Conditions
                  </Link>
                  <Link href='#' className='hover:text-foreground transition-colors duration-300'>
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between gap-3 max-sm:flex-col'>
            <span className='text-sm'>
              © {new Date().getFullYear()}{' '}
              <Link href='/' className='hover:text-foreground transition-colors duration-300'>
                {companyProfile.name}
              </Link>
              , made for unforgettable journeys.
            </span>
            <div className='flex items-center gap-4'>
              {socialLinks.instagram && (
                <>
                  <Link
                    href='#'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-foreground transition-colors duration-300'
                    aria-label='Instagram'
                  >
                    <InstagramIcon className='size-5' />
                  </Link>
                  <Separator orientation='vertical' className='h-5' />
                </>
              )}
              {socialLinks.facebook && (
                <>
                  <Link
                    href='#'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-foreground transition-colors duration-300'
                    aria-label='Facebook'
                  >
                    <FacebookIcon className='size-5' />
                  </Link>
                  <Separator orientation='vertical' className='h-5' />
                </>
              )}
              {socialLinks.twitter && (
                <>
                  <Link
                    href='#'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-foreground transition-colors duration-300'
                    aria-label='Twitter'
                  >
                    <TwitterIcon className='size-5' />
                  </Link>
                  <Separator orientation='vertical' className='h-5' />
                </>
              )}
              <Link href='#' className='hover:text-foreground transition-colors duration-300' aria-label='Email'>
                <MailIcon className='size-5' />
              </Link>
            </div>
          </div>
        </div>

        <div className='-mb-10 pt-10 sm:px-16 md:-mb-25 lg:-mb-38 lg:px-24'>
          <HoverText text={companyProfile.name} />
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
