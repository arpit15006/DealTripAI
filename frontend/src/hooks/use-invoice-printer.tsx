'use client'

// React Imports
import { useEffect, useState } from 'react'

// Third-party Imports
import { createPortal } from 'react-dom'

// Type Imports
import type { Invoice } from '@/types/apps/invoice-types'

// Component Imports
import InvoicePrintView from '@/views/apps/payments-invoices/invoices/invoice-print-view'

// Hook Imports
import { useMounted } from '@/hooks/use-mounted'

export const useInvoicePrinter = () => {
  const mounted = useMounted()
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    if (!printInvoice) return

    window.print()

    const clearInvoice = () => setPrintInvoice(null)

    window.addEventListener('afterprint', clearInvoice, { once: true })

    return () => window.removeEventListener('afterprint', clearInvoice)
  }, [printInvoice])

  const invoicePrintPortal =
    mounted && printInvoice
      ? createPortal(
          <>
            <style>{`
              @media print {
                body > *:not(#invoice-print-content) {
                  display: none !important;
                }
                #invoice-print-content {
                  display: block !important;
                  padding: 1rem;
                }
              }
            `}</style>
            <div id='invoice-print-content' className='hidden print:block'>
              <InvoicePrintView invoice={printInvoice} />
            </div>
          </>,
          document.body
        )
      : null

  return { downloadInvoice: setPrintInvoice, invoicePrintPortal }
}
