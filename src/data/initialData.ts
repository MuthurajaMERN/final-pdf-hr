import { ProductLine, Invoice } from './types'

export const initialProductLine: ProductLine = {
  description: '',
  HSN_SAC: "",
  quantity: '',
  CGST: "",
  SGST: "",
  rate: '',
}

export const initialInvoice: Invoice = {
  logo: '',
  logoWidth: 100,
  title: '',
  companyName: 'Ultrafly Solution',
  name: '',
  companyAddress: 'Puliyamkulam',
  companyAddress2: 'Coimbatore',
  companyAddress3: 'tamilnadu',
  GSTNO: 'GSTNO:33AABCU9602H1ZI',
  companyCountry: 'India State',
  billTo: 'Bill To:',
  clientName: 'varun',
  clientAddress: '',
  clientAddress2: '',
  clientCountry: 'india',
  invoiceTitleLabel: 'Invoice#',
  invoiceTitle: '',
  invoiceDateLabel: 'Invoice Date',
  invoiceDate: '',
  invoiceDueDateLabel: 'Due Date',
  invoiceDueDate: '',
  productLineDescription: 'Item Description',
  productLineQuantity: 'Qty',
  productLineQuantityRate: 'Rate',
  productLineQuantityCGST: 'CGST',
  productLineQuantitySGST: 'SGST',
  productLineQuantityAmount: 'Amount',
  productLines: [
    {
      description: '',
      quantity: '',
      rate: '',
      HSN_SAC: '',
      CGST: '',
      SGST: ''
    },
    { ...initialProductLine },
    { ...initialProductLine },
  ],
  subTotalLabel: 'Sub Total',
  taxLabel: 'Sale Tax (10%)',
  CGSTtaxLabel: 'CGST Tax (3%)',
  SGSTtaxLabel: 'SGST Tax (3%)',


  totalLabel: 'TOTAL',
  currency: '$',
  notesLabel: 'Notes',
  notes: 'It was great doing business with you.',
  termLabel: 'Terms & Conditions',
  term: 'Please make the payment by the due date.',
}
