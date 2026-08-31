'use client'

// Third-party Imports
import { AlertCircleIcon, UploadIcon, XIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'

// Hook Imports
import { useFileUpload } from '@/hooks/use-file-upload'

const MAX_IMAGES = 4
const MAX_IMAGE_SIZE = 3 * 1024 * 1024

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

type ImageUploadFieldProps = {
  value: string[]
  onChange: (images: string[]) => void
}

const ImageUploadField = ({ value, onChange }: ImageUploadFieldProps) => {
  const remainingSlots = Math.max(0, MAX_IMAGES - value.length)

  const [
    { isDragging, errors },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps, clearFiles }
  ] = useFileUpload({
    maxFiles: remainingSlots || 1,
    maxSize: MAX_IMAGE_SIZE,
    accept: 'image/*',
    multiple: true,
    onFilesAdded: async addedFiles => {
      const dataUrls = await Promise.all(addedFiles.map(item => readFileAsDataUrl(item.file as File)))

      onChange([...value, ...dataUrls])
      clearFiles()
    }
  })

  const handleRemove = (index: number) => onChange(value.filter((_, i) => i !== index))

  return (
    <div className='flex flex-col gap-3'>
      {value.length > 0 && (
        <div className='grid grid-cols-3 gap-3 sm:grid-cols-4'>
          {value.map((src, index) => (
            <div
              key={`${src.slice(0, 32)}-${index}`}
              className='group relative aspect-square overflow-hidden rounded-md border'
            >
              <img src={src} alt={`Package photo ${index + 1}`} className='size-full object-cover' />
              <Button
                type='button'
                variant='destructive'
                size='icon'
                className='absolute top-1 right-1 size-6 opacity-0 transition-opacity group-hover:opacity-100'
                onClick={() => handleRemove(index)}
                aria-label={`Remove photo ${index + 1}`}
              >
                <XIcon className='size-3.5' />
              </Button>
              {index === 0 && (
                <span className='bg-background/90 absolute bottom-1 left-1 rounded px-1.5 py-0.5 text-[0.65rem] font-medium'>
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {remainingSlots > 0 && (
        <div
          role='button'
          tabIndex={0}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className='border-input data-[dragging=true]:bg-accent/50 flex min-h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center'
        >
          <input {...getInputProps()} className='sr-only' aria-label='Upload package photos' />
          <UploadIcon className='size-6 stroke-1' />
          <p className='text-sm font-medium'>Drag & drop photos or click to upload</p>
          <p className='text-muted-foreground text-xs'>
            Up to {MAX_IMAGES} photos, 3MB each &mdash; first photo is the cover
          </p>
        </div>
      )}

      {errors.length > 0 && (
        <div className='text-destructive flex items-center gap-1 text-xs' role='alert'>
          <AlertCircleIcon className='size-3 shrink-0' />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  )
}

export default ImageUploadField
