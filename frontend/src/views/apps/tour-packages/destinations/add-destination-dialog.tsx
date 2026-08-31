'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

// Type Imports
import type { TourPackage } from '@/types/packages/tour-package-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

// Store Imports
import { useDestinationsStore } from '@/store/use-destinations-store'

const destinationSchema = z.object({
  name: z.string().min(2, 'Destination name must be at least 2 characters'),
  assignPackageIds: z.array(z.string())
})

type FormValues = z.infer<typeof destinationSchema>

type AddDestinationDialogProps = {
  packages: TourPackage[]
}

const AddDestinationDialog = ({ packages }: AddDestinationDialogProps) => {
  const createDestination = useDestinationsStore(state => state.createDestination)
  const [open, setOpen] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(destinationSchema),
    defaultValues: { name: '', assignPackageIds: [] }
  })

  const onSubmit = (values: FormValues) => {
    createDestination({ name: values.name, assignPackageIds: values.assignPackageIds })
    toast.success(`${values.name} added as a destination`)
    reset()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen)
        if (!nextOpen) reset()
      }}
    >
      <DialogTrigger className='max-sm:w-full' render={<Button />} nativeButton={false}>
        <PlusIcon className='size-4' />
        Add Destination
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add Destination</DialogTitle>
          <DialogDescription>
            Create a new country/destination and optionally migrate existing packages to it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col gap-4'>
          <FieldGroup>
            <Controller
              control={control}
              name='name'
              render={({ field }) => (
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor='destination-name'>Destination Name</FieldLabel>
                  <Input id='destination-name' placeholder='Santorini' {...field} />
                  <FieldError errors={[errors.name]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name='assignPackageIds'
              render={({ field }) => (
                <FieldSet>
                  <FieldLegend variant='label'>Assign existing packages (optional)</FieldLegend>
                  <ScrollArea className='h-48 rounded-md border'>
                    <div className='flex flex-col gap-1 p-2'>
                      {packages.length === 0 ? (
                        <p className='text-muted-foreground p-2 text-sm'>No packages available yet.</p>
                      ) : (
                        packages.map(tourPackage => {
                          const checked = field.value.includes(tourPackage.id)
                          const checkboxId = `assign-package-${tourPackage.id}`

                          return (
                            <div
                              key={tourPackage.id}
                              className='hover:bg-muted flex flex-wrap items-center gap-2 rounded-md p-2 text-sm'
                            >
                              <Checkbox
                                id={checkboxId}
                                checked={checked}
                                onCheckedChange={value => {
                                  field.onChange(
                                    value
                                      ? [...field.value, tourPackage.id]
                                      : field.value.filter(id => id !== tourPackage.id)
                                  )
                                }}
                              />
                              <Label htmlFor={checkboxId} className='min-w-0 flex-1 cursor-pointer font-normal'>
                                <span className='block truncate'>{tourPackage.title}</span>
                              </Label>
                              <span className='text-muted-foreground shrink-0 text-xs'>{tourPackage.location}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </ScrollArea>
                </FieldSet>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              Create Destination
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddDestinationDialog
