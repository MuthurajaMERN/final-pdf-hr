import React, { FC } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { Invoice } from '../data/types'

import InvoicePage from './InvoicePage'

interface Props {
  data: Invoice
  setData(data: Invoice): void
}

const Download: FC<Props> = ({ data }) => {
  const title = data.invoiceTitle ? data.invoiceTitle.toLowerCase() : 'invoice'

  console.log("download data",data)

  return (
    <PDFDownloadLink
      document={<InvoicePage data={data} pdfMode={true} />}
      fileName={`${title}.pdf`}
      key={JSON.stringify(data)} // This ensures the component updates when `data` changes
    >
      {({ loading }) =>
        loading ? 'Generating PDF...' : <button>Download Invoice</button>
      }
    </PDFDownloadLink>
  )
}

export default Download
