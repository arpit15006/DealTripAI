'use client'

// Third-party Imports
import { TrashIcon, UploadCloudIcon } from 'lucide-react'

// Component Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

// Hook Imports
import { useFileUpload } from '@/hooks/use-file-upload'

const MAX_AVATAR_SIZE = 1024 * 1024

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

type ProfileAvatarUploadProps = {
  value: string
  fallback: string
  onChange: (avatar: string) => void
  onRemove: () => void
}

const ProfileAvatarUpload = ({ value, fallback, onChange, onRemove }: ProfileAvatarUploadProps) => {
  const [{ errors }, { openFileDialog, getInputProps, clearFiles }] = useFileUpload({
    maxFiles: 1,
    maxSize: MAX_AVATAR_SIZE,
    accept: 'image/*',
    onFilesAdded: async addedFiles => {
      const [added] = addedFiles

      if (!added) return

      const dataUrl = await readFileAsDataUrl(added.file as File)

      onChange(dataUrl)
      clearFiles()
    }
  })

  return (
    <div className='flex items-center gap-4'>
      <Avatar className='size-16'>
        <AvatarImage src={value || undefined} alt='Your avatar' />
        <AvatarFallback className='bg-primary/10 text-primary text-lg font-semibold'>{fallback}</AvatarFallback>
      </Avatar>

      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <input {...getInputProps()} className='sr-only' aria-label='Upload your avatar' />
          <Button type='button' variant='outline' onClick={openFileDialog}>
            <UploadCloudIcon className='size-4' />
            Upload avatar
          </Button>
          <Button
            type='button'
            variant='ghost'
            onClick={onRemove}
            disabled={!value}
            className='text-destructive!'
            aria-label='Remove avatar'
          >
            <TrashIcon className='size-4' />
          </Button>
        </div>
        <p className='text-muted-foreground text-xs'>Pick a photo up to 1MB.</p>
        {errors.length > 0 && (
          <p className='text-destructive text-xs' role='alert'>
            {errors[0]}
          </p>
        )}
      </div>
    </div>
  )
}

export default ProfileAvatarUpload
