'use client'

// Third-party Imports
import { AlertCircleIcon, UploadIcon, XIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'

// Hook Imports
import { useFileUpload } from '@/hooks/use-file-upload'

const MAX_IMAGE_SIZE = 3 * 1024 * 1024

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

type CouponImageUploadFieldProps = {
  value: string
  onChange: (image: string) => void
}

const CouponImageUploadField = ({ value, onChange }: CouponImageUploadFieldProps) => {
  const [
    { isDragging, errors },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps, clearFiles }
  ] = useFileUpload({
    maxFiles: 1,
    maxSize: MAX_IMAGE_SIZE,
    accept: 'image/*',
    onFilesAdded: async addedFiles => {
      const [added] = addedFiles

      if (!added) return

      const dataUrl = await readFileAsDataUrl(added.file as File)

      onChange(dataUrl)
      clearFiles()
    }
  })

  if (value) {
    return (
      <div>
        <div className='group relative h-28 w-full overflow-hidden rounded-md border'>
          <img src={value} alt='Banner preview' className='size-full object-cover' />
          <Button
            type='button'
            variant='destructive'
            size='icon'
            className='absolute top-1 right-1 size-6 opacity-0 transition-opacity group-hover:opacity-100'
            onClick={() => onChange('')}
            aria-label='Remove banner image'
          >
            <XIcon className='size-3.5' />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-2'>
      <div
        role='button'
        tabIndex={0}
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        className='border-input data-[dragging=true]:bg-accent/50 flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed text-center'
      >
        <input {...getInputProps()} className='sr-only' aria-label='Upload banner image' />
        <UploadIcon className='size-5 stroke-1' />
        <p className='text-muted-foreground px-3 text-xs'>Click or drag to upload</p>
      </div>

      {errors.length > 0 && (
        <div className='text-destructive flex items-center gap-1 text-xs' role='alert'>
          <AlertCircleIcon className='size-3 shrink-0' />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
}

export default CouponImageUploadField
