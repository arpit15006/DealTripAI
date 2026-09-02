'use client'

// React Imports
import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent, ComponentPropsWithRef, DragEvent } from 'react'

export type FileMetadata = {
  id: string
  name: string
  size: number
  type: string
  url: string
}

export type FileWithPreview = {
  id: string
  file: File | FileMetadata
  preview?: string
}

type UseFileUploadOptions = {
  maxFiles?: number
  maxSize?: number
  accept?: string
  multiple?: boolean
  initialFiles?: FileMetadata[]
  onFilesChange?: (files: FileWithPreview[]) => void
  onFilesAdded?: (addedFiles: FileWithPreview[]) => void
}

type UseFileUploadState = {
  files: FileWithPreview[]
  isDragging: boolean
  errors: string[]
}

const createId = () => crypto.randomUUID()

const isFileMetadata = (file: File | FileMetadata): file is FileMetadata => 'url' in file

export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes'

  const units = ['Bytes', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)

  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

export function useFileUpload({
  maxFiles = 1,
  maxSize = Number.POSITIVE_INFINITY,
  accept = '*',
  multiple = false,
  initialFiles = [],
  onFilesChange,
  onFilesAdded
}: UseFileUploadOptions = {}) {
  const [state, setState] = useState<UseFileUploadState>({
    files: initialFiles.map(fileMetadata => ({ id: fileMetadata.id, file: fileMetadata, preview: fileMetadata.url })),
    isDragging: false,
    errors: []
  })

  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        return `"${file.name}" exceeds the ${formatBytes(maxSize)} size limit.`
      }

      return null
    },
    [maxSize]
  )

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList)

      setState(prevState => {
        const availableSlots = maxFiles - prevState.files.length
        const errors: string[] = []

        if (availableSlots <= 0) {
          return { ...prevState, errors: [`You can only upload up to ${maxFiles} file(s).`] }
        }

        const accepted: FileWithPreview[] = []

        for (const file of incoming.slice(0, availableSlots)) {
          const validationError = validateFile(file)

          if (validationError) {
            errors.push(validationError)
            continue
          }

          accepted.push({
            id: createId(),
            file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
          })
        }

        if (incoming.length > availableSlots) {
          errors.push(`Only ${availableSlots} more file(s) can be added (max ${maxFiles}).`)
        }

        const nextFiles = [...prevState.files, ...accepted]

        onFilesAdded?.(accepted)
        onFilesChange?.(nextFiles)

        return { ...prevState, files: nextFiles, errors }
      })
    },
    [maxFiles, onFilesAdded, onFilesChange, validateFile]
  )

  const removeFile = useCallback(
    (id: string) => {
      setState(prevState => {
        const target = prevState.files.find(file => file.id === id)

        if (target?.preview && !isFileMetadata(target.file)) {
          URL.revokeObjectURL(target.preview)
        }

        const nextFiles = prevState.files.filter(file => file.id !== id)

        onFilesChange?.(nextFiles)

        return { ...prevState, files: nextFiles }
      })
    },
    [onFilesChange]
  )

  const clearFiles = useCallback(() => {
    setState(prevState => {
      prevState.files.forEach(file => {
        if (file.preview && !isFileMetadata(file.file)) {
          URL.revokeObjectURL(file.preview)
        }
      })

      onFilesChange?.([])

      return { ...prevState, files: [] }
    })
  }, [onFilesChange])

  const clearErrors = useCallback(() => {
    setState(prevState => ({ ...prevState, errors: [] }))
  }, [])

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setState(prevState => ({ ...prevState, isDragging: true }))
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setState(prevState => ({ ...prevState, isDragging: false }))
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setState(prevState => ({ ...prevState, isDragging: false }))

      if (e.dataTransfer.files?.length) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles]
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        addFiles(e.target.files)
      }

      e.target.value = ''
    },
    [addFiles]
  )

  const openFileDialog = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const getInputProps = useCallback(
    (props: ComponentPropsWithRef<'input'> = {}): ComponentPropsWithRef<'input'> => ({
      ...props,
      type: 'file',
      accept,
      multiple,
      ref: inputRef,
      onChange: handleFileChange
    }),
    [accept, multiple, handleFileChange]
  )

  return [
    state,
    {
      addFiles,
      removeFile,
      clearFiles,
      clearErrors,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      openFileDialog,
      getInputProps
    }
  ] as const
}
