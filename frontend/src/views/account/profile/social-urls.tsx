'use client'

// React Imports
import { useState } from 'react'

// Third-party Imports
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const DEFAULT_SOCIAL_URLS = ['', '', '']

const SocialUrls = () => {
  const [urls, setUrls] = useState<string[]>(DEFAULT_SOCIAL_URLS)

  const addUrl = () => setUrls(prev => [...prev, ''])

  const updateUrl = (index: number, value: string) => setUrls(prev => prev.map((url, i) => (i === index ? value : url)))

  const handleSave = () => {
    toast.success('Social profiles updated!')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Social Profiles</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='flex flex-col gap-3'>
          {urls.map((url, index) => (
            <Input
              key={index}
              type='text'
              placeholder='Link to social profile'
              value={url}
              onChange={e => updateUrl(index, e.target.value)}
            />
          ))}
        </div>
        <div className='flex items-center justify-between gap-4'>
          <Button type='button' variant='outline' onClick={addUrl}>
            <PlusIcon className='size-4' />
            Add URL
          </Button>
          <Button type='button' onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SocialUrls
