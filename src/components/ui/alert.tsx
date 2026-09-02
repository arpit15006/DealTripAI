import * as React from 'react'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/*
 * Tone variants beyond shadcn's default/destructive pair.
 *
 * This theme defines no success/warning/info tokens (only `destructive`) so
 * these use Tailwind's green/amber ramps directly, with a dark-mode step up in
 * lightness. That matches the convention already used elsewhere in the
 * codebase (see the "Order Verified" badge in the timeline block) rather than
 * inventing a parallel set of CSS variables for four colours.
 *
 * `destructive` also gains a tinted border here so all five tones read as one
 * family; shadcn ships it borderless.
 */
const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'bg-card text-destructive border-destructive/30 *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current',
        success:
          'bg-card border-green-600/30 text-green-600 *:data-[slot=alert-description]:text-green-600/90 dark:border-green-400/30 dark:text-green-400 dark:*:data-[slot=alert-description]:text-green-400/90',
        warning:
          'bg-card border-amber-600/30 text-amber-600 *:data-[slot=alert-description]:text-amber-600/90 dark:border-amber-400/30 dark:text-amber-400 dark:*:data-[slot=alert-description]:text-amber-400/90',
        info: 'bg-card text-primary border-primary/30 *:data-[slot=alert-description]:text-primary/90'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot='alert' role='alert' className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-title'
      className={cn(
        '[&_a]:hover:text-foreground font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3',
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-description'
      className={cn(
        'text-muted-foreground [&_a]:hover:text-foreground text-sm text-balance md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4',
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='alert-action' className={cn('absolute top-2 right-2', className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
