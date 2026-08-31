'use client'

// React Imports
import { useState } from 'react'
import type { ReactElement } from 'react'

// Component Imports
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Utils Imports
import { cn } from '@/lib/utils'

type LanguageDropdownProps = {
  trigger: ReactElement
  align?: 'start' | 'center' | 'end'
}

const suggestedLanguages = ['English (India)', 'English (US)', 'हिन्दी']

const moreLanguages = [
  'English (International)',
  'Bahasa Indonesia',
  'Bahasa Malaysia',
  'Català',
  'Čeština',
  'Dansk',
  'Deutsch',
  'English (Australia)',
  'English (Canada)',
  'English (Hong Kong, SAR)',
  'English (Malaysia)',
  'English (New Zealand)',
  'English (Philippines)',
  'English (Singapore)',
  'English (UK)',
  'Español (España)',
  'Français',
  'Italiano',
  'Magyar',
  'Nederlands',
  'Norsk',
  'Polski',
  'Português (Brasil)',
  'Português (Portugal)',
  'Română',
  'Slovenčina',
  'Suomi',
  'Svenska',
  'Tagalog',
  'Tiếng Việt',
  '简体中文',
  '台灣繁體',
  '香港繁體',
  '日本語',
  '한국어',
  'ไทย',
  'Русский',
  'Ελληνικά',
  'Български',
  'বাংলা',
  'தமிழ்',
  'සිංහල',
  'English (UAE)'
]

const popularCurrencies = [
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'TWD', name: 'New Taiwan Dollar' },
  { code: 'USD', name: 'U.S. Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'KRW', name: 'Korean Won' },
  { code: 'ILS', name: 'Israeli Shekel' }
]

const moreCurrencies = [
  { code: 'AED', name: 'U.A.E Dirham' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'BHD', name: 'Bahraini Dinar' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'EUR', name: 'Euro' },
  { code: 'FJD', name: 'Fijian Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'ISK', name: 'Icelandic Krona' },
  { code: 'JOD', name: 'Jordanian Dinar' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'KHR', name: 'Cambodian Riel' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'LAK', name: 'Lao Kip' },
  { code: 'LKR', name: 'Sri Lankan Rupee' },
  { code: 'MAD', name: 'Moroccan Dirham' },
  { code: 'MGA', name: 'Malagasy Ariary' },
  { code: 'MOP', name: 'Macau Pataca' },
  { code: 'MUR', name: 'Mauritian Rupee' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'OMR', name: 'Omani Rial' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'QAR', name: 'Qatar Riyal' },
  { code: 'RON', name: 'Romanian Leu' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'ZAR', name: 'South African Rand' }
]

const LanguageDropdown = ({ trigger }: LanguageDropdownProps) => {
  // States
  const [language, setLanguage] = useState('English (International)')
  const [currency, setCurrency] = useState('INR')

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent
        showCloseButton
        className='flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-3xl flex-col gap-4 overflow-hidden p-6 sm:max-w-3xl'
      >
        <DialogTitle className='sr-only'>Language and currency settings</DialogTitle>
        <Tabs defaultValue='language' className='min-h-0 flex-1 gap-4'>
          <TabsList variant='line' className='w-fit'>
            <TabsTrigger value='language' className='text-base'>
              Language
            </TabsTrigger>
            <TabsTrigger value='currency' className='text-base'>
              Currency
            </TabsTrigger>
          </TabsList>

          <TabsContent value='language' className='flex flex-col gap-6 overflow-y-auto'>
            <div className='flex flex-col gap-3'>
              <h3 className='text-lg font-semibold'>Suggested languages</h3>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                {suggestedLanguages.map(item => (
                  <Button
                    key={item}
                    type='button'
                    variant='ghost'
                    onClick={() => setLanguage(item)}
                    className={cn(
                      'text-muted-foreground hover:text-primary h-auto justify-start p-0 text-sm font-normal hover:bg-transparent',
                      language === item && 'text-primary font-medium'
                    )}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>

            <div className='flex flex-col gap-3'>
              <h3 className='text-lg font-semibold'>More languages</h3>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                {moreLanguages.map(item => (
                  <Button
                    key={item}
                    type='button'
                    variant='ghost'
                    onClick={() => setLanguage(item)}
                    className={cn(
                      'text-muted-foreground hover:text-primary h-auto justify-start p-0 text-sm font-normal hover:bg-transparent',
                      language === item && 'text-primary font-medium'
                    )}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value='currency' className='flex flex-col gap-6 overflow-y-auto'>
            <div className='flex flex-col gap-3'>
              <h3 className='text-lg font-semibold'>Popular currencies</h3>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                {popularCurrencies.map(item => (
                  <Button
                    key={item.code}
                    type='button'
                    variant='ghost'
                    onClick={() => setCurrency(item.code)}
                    className={cn(
                      'text-muted-foreground h-auto justify-start gap-2 p-0 text-sm font-normal hover:bg-transparent',
                      currency === item.code && 'text-primary font-medium'
                    )}
                  >
                    <span className='text-muted-foreground w-8 shrink-0'>{item.code}</span>
                    <span>{item.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className='flex flex-col gap-3'>
              <h3 className='text-lg font-semibold'>More currencies</h3>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                {moreCurrencies.map(item => (
                  <Button
                    key={item.code}
                    type='button'
                    variant='ghost'
                    onClick={() => setCurrency(item.code)}
                    className={cn(
                      'text-muted-foreground h-auto justify-start gap-2 p-0 text-sm font-normal hover:bg-transparent',
                      currency === item.code && 'text-primary font-medium'
                    )}
                  >
                    <span className='text-muted-foreground w-8 shrink-0'>{item.code}</span>
                    <span>{item.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default LanguageDropdown
