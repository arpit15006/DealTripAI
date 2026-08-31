'use client'

// React Imports
import { useEffect } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

// Component Imports
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { socialLinksSchema } from '@/views/apps/settings/store-information/social-links-schema'
import type { SocialLinksFormValues } from '@/views/apps/settings/store-information/social-links-schema'
import FacebookIcon from '@/assets/svg/facebook-icon'
import InstagramIcon from '@/assets/svg/instagram-icon'
import TwitterIcon from '@/assets/svg/twitter-icon'

// Store Imports
import { useSocialLinks } from '@/store/use-store-information-store'

const SocialLinksSection = () => {
  const { socialLinks, updateSocialLinks } = useSocialLinks()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: socialLinks
  })

  useEffect(() => {
    reset(socialLinks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socialLinks])

  const onSubmit = (values: SocialLinksFormValues) => {
    updateSocialLinks(values)
    toast.success('Social links updated')
  }

  return (
    <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
      <div className='flex flex-col space-y-1'>
        <h3 className='text-base font-semibold'>Social Links</h3>
        <p className='text-muted-foreground text-sm'>Connect your social profiles shown on the public site footer.</p>
      </div>

      <div className='lg:col-span-2'>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-5'>
          <FieldGroup>
            <Controller
              control={control}
              name='instagram'
              render={({ field }) => (
                <Field data-invalid={!!errors.instagram}>
                  <FieldLabel htmlFor='instagram'>Instagram</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <InstagramIcon className='size-4' />
                    </InputGroupAddon>
                    <InputGroupInput id='instagram' placeholder='https://instagram.com/yourbrand' {...field} />
                  </InputGroup>
                  <FieldError errors={[errors.instagram]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='facebook'
              render={({ field }) => (
                <Field data-invalid={!!errors.facebook}>
                  <FieldLabel htmlFor='facebook'>Facebook</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <FacebookIcon className='size-4' />
                    </InputGroupAddon>
                    <InputGroupInput id='facebook' placeholder='https://facebook.com/yourbrand' {...field} />
                  </InputGroup>
                  <FieldError errors={[errors.facebook]} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name='twitter'
              render={({ field }) => (
                <Field data-invalid={!!errors.twitter}>
                  <FieldLabel htmlFor='twitter'>Twitter / X</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <TwitterIcon className='size-4' />
                    </InputGroupAddon>
                    <InputGroupInput id='twitter' placeholder='https://twitter.com/yourbrand' {...field} />
                  </InputGroup>
                  <FieldError errors={[errors.twitter]} />
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
      </div>
    </div>
  )
}

export default SocialLinksSection
