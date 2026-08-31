'use client'

// Third-party Imports
import { AlertCircleIcon, UploadIcon, XIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'

// Hook Imports
import { useFileUpload } from '@/hooks/use-file-upload'

const MAX_LOGO_SIZE = 2 * 1024 * 1024

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

type LogoUploadFieldProps = {
  value: string
  onChange: (logo: string) => void
}

const LogoUploadField = ({ value, onChange }: LogoUploadFieldProps) => {
  const [
    { isDragging, errors },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, getInputProps, clearFiles }
  ] = useFileUpload({
    maxFiles: 1,
    maxSize: MAX_LOGO_SIZE,
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
      <div className='group relative flex h-24 w-40 items-center justify-center overflow-hidden rounded-md border p-3'>
        <img src={value} alt='Company logo preview' className='size-full object-contain' />
        <Button
          type='button'
          variant='destructive'
          size='icon'
          className='absolute top-1 right-1 size-6 opacity-0 transition-opacity group-hover:opacity-100'
          onClick={() => onChange('')}
          aria-label='Remove logo'
        >
          <XIcon className='size-3.5' />
        </Button>
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
        className='border-input data-[dragging=true]:bg-accent/50 flex h-24 w-40 flex-col items-center justify-center gap-1.5 rounded-md border border-dashed text-center'
      >
        <input {...getInputProps()} className='sr-only' aria-label='Upload company logo' />
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

export default LogoUploadField
