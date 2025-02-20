import { FC, useState, useEffect } from 'react'
import { Invoice, ProductLine } from '../data/types'
import { initialInvoice, initialProductLine } from '../data/initialData'
import EditableInput from './EditableInput'
import EditableSelect from './EditableSelect'
import EditableTextarea from './EditableTextarea'
import EditableCalendarInput from './EditableCalendarInput'
import EditableFileImage from './EditableFileImage'
import countryList from '../data/countryList'
import Document from './Document'
import Page from './Page'
import View from './View'
import Text from './Text'
import { Font } from '@react-pdf/renderer'
import Download from './DownloadPDF'
import { format } from 'date-fns/format'

Font.register({
  family: 'Nunito',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf' },
    {
      src: 'https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf',
      fontWeight: 900,
    },
  ],
})

interface Props {
  data?: Invoice
  pdfMode?: boolean
  onChange?: (invoice: Invoice) => void
}

const InvoicePage: FC<Props> = ({ data, pdfMode, onChange }) => {
  const [invoice, setInvoice] = useState<Invoice>(data ? { ...data } : { ...initialInvoice })
  const [subTotal, setSubTotal] = useState<number>()
  const [saleTax, setSaleTax] = useState<number>()
  const [cgst, setCgst] = useState<number>(0);
  const [sgst, setSgst] = useState<number>(0);





  const dateFormat = 'MMM dd, yyyy'
  const invoiceDate = invoice.invoiceDate !== '' ? new Date(invoice.invoiceDate) : new Date()
  const invoiceDueDate =
    invoice.invoiceDueDate !== ''
      ? new Date(invoice.invoiceDueDate)
      : new Date(invoiceDate.valueOf())

  if (invoice.invoiceDueDate === '') {
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 30)
  }

  const handleChange = (name: keyof Invoice, value: string | number) => {
    console.log(name, "from on change")
    if (name !== 'productLines') {
      const newInvoice = { ...invoice }

      if (name === 'logoWidth' && typeof value === 'number') {
        newInvoice[name] = value
      } else if (name !== 'logoWidth' && typeof value === 'string') {
        newInvoice[name] = value
      }

      setInvoice(newInvoice)
    }
  }

  const handleProductLineChange = (index: number, name: keyof ProductLine, value: string) => {
    const productLines = invoice.productLines.map((productLine, i) => {
      if (i === index) {
        const newProductLine = { ...productLine }

        if (name === 'description') {
          newProductLine[name] = value
        } else {
          if (
            value[value.length - 1] === '.' ||
            (value[value.length - 1] === '0' && value.includes('.'))
          ) {
            newProductLine[name] = value
          } else {
            const n = parseFloat(value)

            newProductLine[name] = (n ? n : 0).toString()
          }
        }

        return newProductLine
      }

      return { ...productLine }
    })

    setInvoice({ ...invoice, productLines })
  }

  const handleRemove = (i: number) => {
    const productLines = invoice.productLines.filter((_, index) => index !== i)

    setInvoice({ ...invoice, productLines })
  }

  const handleAdd = () => {
    const productLines = [...invoice.productLines, { ...initialProductLine }]
    setInvoice({ ...invoice, productLines })
  }

  const calculateAmount = (quantity: string, rate: string, cgst: string, sgst: string) => {
    const quantityNumber = parseFloat(quantity);
    const rateNumber = parseFloat(rate);
    const cgstPercentage = parseFloat(cgst) || 0; // Default to 0 if empty or invalid
    const sgstPercentage = parseFloat(sgst) || 0; // Default to 0 if empty or invalid

    if (isNaN(quantityNumber) || isNaN(rateNumber)) {
      return "0.00";
    }

    const tamount = quantityNumber * rateNumber;
    const cgstAmount = (tamount * cgstPercentage) / 100;
    const sgstAmount = (tamount * sgstPercentage) / 100;
    const amount = tamount + cgstAmount + sgstAmount;

    return amount.toFixed(2);
  };

  useEffect(() => {
    let subTotalAmount = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    invoice.productLines.forEach((productLine: ProductLine) => {
      const quantityNumber: number = parseFloat(productLine.quantity) || 0;
      const rateNumber: number = parseFloat(productLine.rate) || 0;
      const cgstPercentage: number = parseFloat(productLine.CGST) || 0;
      const sgstPercentage: number = parseFloat(productLine.SGST) || 0;

      const itemTotal: number = quantityNumber * rateNumber;
      const cgstAmount: number = (itemTotal * cgstPercentage) / 100;
      const sgstAmount: number = (itemTotal * sgstPercentage) / 100;

      subTotalAmount += itemTotal;
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;
    });

    setSubTotal(subTotalAmount);
    setCgst(totalCgst);
    setSgst(totalSgst);
  }, [invoice.productLines]);


  useEffect(() => {
    const match: RegExpMatchArray | null = invoice.taxLabel.match(/(\d+)%/);
    const taxRate: number = match ? parseFloat(match[1]) : 0;
    const totalTax: number = subTotal ? (subTotal * taxRate) / 100 : 0;

    setSaleTax(totalTax);
  }, [subTotal, invoice.taxLabel]);

  useEffect(() => {
    if (onChange) {
      onChange(invoice)
      setInvoice(invoice)
    }
  }, [onChange, invoice])

  return (
    <Document pdfMode={pdfMode}>
      {!pdfMode && <Download data={invoice} setData={(d) => setInvoice(d)} />}
      <Page className="invoice-wrapper" pdfMode={pdfMode}>

        <div className="flex justify-start items-start gap-4">
          {/* Logo Section */}
          <div className="w-60 flex-shrink-0">
            <EditableFileImage
              className="logo"
              placeholder="Your Logo"
              value={invoice.logo}
              width={invoice.logoWidth}
              pdfMode={pdfMode}
              onChangeImage={(value) => handleChange('logo', value)}
              onChangeWidth={(value) => handleChange('logoWidth', value)}
            />
          </div>

          {/* Company Details Section */}
          <div className="w-3/4 mr-60 text-left">
            <EditableInput
              className="text-xl font-bold"
              placeholder="Your Company"
              value={invoice.companyName}
              onChange={(value) => handleChange('companyName', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Your Name"
              value={invoice.name}
              onChange={(value) => handleChange('name', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Company's Address"
              value={invoice.companyAddress}
              onChange={(value) => handleChange('companyAddress', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="Company's Address1"
              value={invoice.companyAddress2}
              onChange={(value) => handleChange('companyAddress2', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="City, State Zip"
              value={invoice.companyAddress3}
              onChange={(value) => handleChange('companyAddress3', value)}
              pdfMode={pdfMode}
            />
            <EditableSelect
              placeholder="Select Country"
              options={countryList}
              value={invoice.companyCountry}
              onChange={(value) => handleChange('companyCountry', value)}
              pdfMode={pdfMode}
            />
            <EditableInput
              placeholder="GSTNO"
              value={invoice.GSTNO}
              onChange={(value) => handleChange('GSTNO', value)}
              pdfMode={pdfMode}
            />
          </div>

          {/* Invoice Title Section */}
          <div className="w-full text-right">
            <EditableInput
              className="text-4xl font-bold"
              placeholder="Invoice"
              value={invoice.title}
              onChange={(value) => handleChange('title', value)}
              pdfMode={pdfMode}
            />
          </div>
        </div>

        <div className='flex col-2'>
          <View className="flex flex-col mt-40 space-y-6" pdfMode={pdfMode}>
            <View className="w-55" pdfMode={pdfMode}>
              <EditableInput
                className="bold dark mb-5"
                value={invoice.billTo}
                onChange={(value) => handleChange('billTo', value)}
                pdfMode={pdfMode}
              />
              <EditableInput
                placeholder="Your Client's Name"
                value={invoice.clientName}
                onChange={(value) => handleChange('clientName', value)}
                pdfMode={pdfMode}
              />
              <EditableInput
                placeholder="Client's Address"
                value={invoice.clientAddress}
                onChange={(value) => handleChange('clientAddress', value)}
                pdfMode={pdfMode}
              />
              <EditableInput
                placeholder="City, State Zip"
                value={invoice.clientAddress2}
                onChange={(value) => handleChange('clientAddress2', value)}
                pdfMode={pdfMode}
              />
              <EditableSelect
                options={countryList}
                value={invoice.clientCountry}
                onChange={(value) => handleChange('clientCountry', value)}
                pdfMode={pdfMode}
              />
            </View>
          </View>
          <div className=''>
            <div className="mt-2">
              <View className="w-50" pdfMode={pdfMode}>
                <View className="flex mb-5" pdfMode={pdfMode}>
                  <View className="w-45" pdfMode={pdfMode}>
                    <EditableInput
                      className="bold"
                      value={invoice.invoiceTitleLabel}
                      onChange={(value) => handleChange('invoiceTitleLabel', value)}
                      pdfMode={pdfMode}
                    />
                    <View className="w-60" pdfMode={pdfMode}>
                      <EditableInput
                        placeholder={`INV-${invoice?.invoiceTitle || 1}`} // Dynamic placeholder
                        value={invoice.invoiceTitle}
                        onChange={(value) => handleChange('invoiceTitle', value)}
                        pdfMode={pdfMode}
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <EditableInput
                    className="bold"
                    value={invoice.invoiceDateLabel}
                    onChange={(value) => handleChange('invoiceDateLabel', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-60" pdfMode={pdfMode}>
                  <EditableCalendarInput
                    value={format(invoiceDate, dateFormat)}
                    selected={invoiceDate}
                    onChange={(date) =>
                      handleChange(
                        'invoiceDate',
                        date && !Array.isArray(date) ? format(date, dateFormat) : '',
                      )
                    }
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <EditableInput
                    className="bold"
                    value={invoice.invoiceDueDateLabel}
                    onChange={(value) => handleChange('invoiceDueDateLabel', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-60" pdfMode={pdfMode}>
                  <EditableCalendarInput
                    value={format(invoiceDueDate, dateFormat)}
                    selected={invoiceDueDate}
                    onChange={(date) =>
                      handleChange(
                        'invoiceDueDate',
                        date ? (!Array.isArray(date) ? format(date, dateFormat) : '') : '',
                      )
                    }
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
            </div>
          </div>
        </div>
        <View className="mt-30 bg-dark flex" pdfMode={pdfMode}>
          <View className="w-30 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold"
              value={invoice.productLineDescription}
              onChange={(value) => handleChange('productLineDescription', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantity}
              onChange={(value) => handleChange('productLineQuantity', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityCGST}
              onChange={(value) => handleChange('productLineQuantityCGST', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantitySGST}
              onChange={(value) => handleChange('productLineQuantitySGST', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityRate}
              onChange={(value) => handleChange('productLineQuantityRate', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-18 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityAmount}
              onChange={(value) => handleChange('productLineQuantityAmount', value)}
              pdfMode={pdfMode}
            />
          </View>
        </View>

        {invoice.productLines.map((productLine, i) => {
          return pdfMode && productLine.description === '' ? (
            <Text key={i}></Text>
          ) : (
            <View key={i} className="row flex" pdfMode={pdfMode}>
              <View className="w-30 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableTextarea
                  className="dark"
                  rows={2}
                  placeholder="Enter item name/description"
                  value={productLine.description}
                  onChange={(value) => handleProductLineChange(i, 'description', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.quantity}
                  onChange={(value) => handleProductLineChange(i, 'quantity', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.CGST}
                  onChange={(value) => handleProductLineChange(i, 'CGST', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.SGST}
                  onChange={(value) => handleProductLineChange(i, 'SGST', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.rate}
                  onChange={(value) => handleProductLineChange(i, 'rate', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-18 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark right" pdfMode={pdfMode}>
                  {calculateAmount(productLine.quantity, productLine.rate, productLine.CGST, productLine.SGST)}
                </Text>
              </View>
              {!pdfMode && (
                <button
                  className="link row__remove"
                  aria-label="Remove Row"
                  title="Remove Row"
                  onClick={() => handleRemove(i)}
                >
                  <span className="icon icon-remove bg-red"></span>
                </button>
              )}
            </View>
          )
        })}

        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50 mt-10" pdfMode={pdfMode}>
            {!pdfMode && (
              <button className="link" onClick={handleAdd}>
                <span className="icon icon-add bg-green mr-10"></span>
                Add Line Item
              </button>
            )}
          </View>
          <View className="w-50 mt-20" pdfMode={pdfMode}>
            {/* Subtotal */}
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.subTotalLabel}
                  onChange={(value) => handleChange('subTotalLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {subTotal?.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* SGST */}
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.SGSTtaxLabel}
                  onChange={(value) => handleChange('SGSTtaxLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {sgst.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* CGST */}
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.CGSTtaxLabel}
                  onChange={(value) => handleChange('CGSTtaxLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {cgst.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Sales Tax */}
            {/* <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.taxLabel}
                  onChange={(value) => handleChange('taxLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {saleTax?.toFixed(2)}
                </Text>
              </View>
            </View> */}

            {/* Total */}
            <View className="flex bg-gray p-5" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.totalLabel}
                  onChange={(value) => handleChange('totalLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                <EditableInput
                  className="dark bold right ml-30"
                  value={invoice.currency}
                  onChange={(value) => handleChange('currency', value)}
                  pdfMode={pdfMode}
                />
                <Text className="right bold dark w-auto" pdfMode={pdfMode}>
                  {(typeof subTotal !== 'undefined'
                    ? subTotal + cgst + sgst
                    : 0
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.notesLabel}
            onChange={(value) => handleChange('notesLabel', value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            value={invoice.notes}
            onChange={(value) => handleChange('notes', value)}
            pdfMode={pdfMode}
          />
        </View>
        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.termLabel}
            onChange={(value) => handleChange('termLabel', value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            value={invoice.term}
            onChange={(value) => handleChange('term', value)}
            pdfMode={pdfMode}
          />
        </View>
      </Page>
    </Document>
  )
}

export default InvoicePage
