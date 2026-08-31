'use client'

// Third-party Imports
import { DownloadIcon } from 'lucide-react'
import { createPortal } from 'react-dom'

// Type Imports
import type { ItineraryDay } from '@/types/packages/package-detail-types'

// Component Imports
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ItineraryAccordionView from '@/views/packages/package-details/itinerary/itinerary-accordion-view'
import ItineraryPrintView from '@/views/packages/package-details/itinerary/itinerary-print-view'
import ItinerarySummaryView from '@/views/packages/package-details/itinerary/itinerary-summary-view'

// Hook Imports
import { useMounted } from '@/hooks/use-mounted'

type PackageItineraryProps = {
  itinerary: ItineraryDay[]
  packageTitle: string
}

const PackageItinerary = ({ itinerary, packageTitle }: PackageItineraryProps) => {
  const mounted = useMounted()

  const handleDownloadPdf = () => {
    window.print()
  }

  return (
    <div id='itinerary' className='flex flex-col gap-4'>
      <Tabs defaultValue='accordion' className='gap-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <h2 className='text-lg font-semibold'>Itinerary</h2>
          <div className='flex flex-wrap items-center gap-2'>
            <TabsList>
              <TabsTrigger value='accordion'>Accordion View</TabsTrigger>
              <TabsTrigger value='summary'>Summary View</TabsTrigger>
            </TabsList>
            <Button variant='outline' size='sm' onClick={handleDownloadPdf}>
              <DownloadIcon />
              Download PDF
            </Button>
          </div>
        </div>
        <TabsContent value='accordion'>
          <ItineraryAccordionView itinerary={itinerary} />
        </TabsContent>
        <TabsContent value='summary'>
          <ItinerarySummaryView itinerary={itinerary} />
        </TabsContent>
      </Tabs>
      {mounted &&
        createPortal(
          <>
            <style>{`
              @media print {
                body > *:not(#itinerary-print-content) {
                  display: none !important;
                }
                #itinerary-print-content {
                  display: block !important;
                  padding: 1rem;
                }
              }
            `}</style>
            <div id='itinerary-print-content' className='hidden print:block'>
              <ItineraryPrintView packageTitle={packageTitle} itinerary={itinerary} />
            </div>
          </>,
          document.body
        )}
    </div>
  )
}

export default PackageItinerary
