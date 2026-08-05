import { calculateSalesInvoiceTotals } from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceData";
import { normalizeSalesInvoiceStatus } from "@/app/src/data/modules/sales/sales-invoice/SalesInvoiceStatusData";
import type {
  SalesInvoiceAccountEntry,
  SalesInvoiceFormValues,
  SalesInvoiceLineItem,
  SalesInvoiceRecord,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";

export function createBlankSalesInvoiceLineItem(
  overrides: Partial<SalesInvoiceLineItem> = {},
): SalesInvoiceLineItem {
  return {
    id: `si-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    amountDue: "0.00",
    barcode: "",
    discount: "0.00",
    ewtAmount: "0.00",
    ewtType: "0.00",
    itemCode: "",
    name: "",
    price: "0.0000",
    quantity: "1.0000",
    refNo: "",
    resCenter: "",
    returnQuantity: "0.0000",
    totalSales: "0.00",
    uom: "",
    vatable: "False",
    vatAmount: "0.00",
    vatInc: "False",
    vatRate: "12.00",
    vatType: "",
    withEwt: "False",
    ...overrides,
  };
}

export function createBlankSalesInvoiceAccountEntry(
  overrides: Partial<SalesInvoiceAccountEntry> = {},
): SalesInvoiceAccountEntry {
  return {
    id: `si-account-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    accountCode: "",
    accountTitle: "",
    debit: "0.00",
    credit: "0.00",
    ...overrides,
  };
}

export function createSalesInvoiceFormValues(): SalesInvoiceFormValues {
  return {
    accountEntries: [
      createBlankSalesInvoiceAccountEntry({
        accountTitle: "Accounts Receivable - Trade",
      }),
      createBlankSalesInvoiceAccountEntry({
        accountTitle: "Sales Discount",
      }),
      createBlankSalesInvoiceAccountEntry({
        accountTitle: "Output Tax",
      }),
      createBlankSalesInvoiceAccountEntry({
        accountTitle: "Sales",
      }),
    ],
    address: "",
    amountDue: "0.00",
    billToCode: "",
    billToName: "",
    branch: "",
    commAmount: "0.00",
    commRemarks: "",
    contactNo: "",
    contactPerson: "",
    currency: "PHP",
    defaultAccount: "",
    discount: "0.00",
    documentDate: "2026-07-15",
    drNo: "",
    dueDate: "",
    ewtAmount: "0.00",
    exchangeRate: "1.0000",
    grNo: "",
    icrNo: "",
    invoiceNo: "SI-2026-0005",
    poNo: "",
    projectName: "",
    projectRef: "",
    referenceNo: "",
    remarks: "",
    resCenter: "",
    salesPersonnel: "",
    sjNo: "",
    soDate: "",
    soNo: "",
    status: "Draft",
    terms: "",
    totalSales: "0.00",
    transNo: "SI-2026-0005",
    vatAmount: "0.00",
    vceCode: "",
    vceName: "",
    lineItems: [createBlankSalesInvoiceLineItem()],
  };
}

export function createSalesInvoiceFormValuesFromRecord(
  record: SalesInvoiceRecord,
): SalesInvoiceFormValues {
  if (record.formValues) {
    return {
      ...createSalesInvoiceFormValues(),
      ...record.formValues,
      lineItems: record.formValues.lineItems.map((item) => ({ ...item })),
    };
  }

  return {
    ...createSalesInvoiceFormValues(),
    amountDue: record.amount.toFixed(2),
    billToName: record.customerName,
    dueDate: record.dueDate,
    documentDate: record.invoiceDate,
    invoiceNo: record.invoiceNo,
    referenceNo: record.referenceNo,
    status: record.status,
    totalSales: record.amount.toFixed(2),
    transNo: record.invoiceNo,
    vceName: record.customerName,
    lineItems: [
      createBlankSalesInvoiceLineItem({
        amountDue: record.amount.toFixed(2),
        name: "Sales item",
        price: record.amount.toFixed(4),
        totalSales: record.amount.toFixed(2),
      }),
    ],
  };
}

export function createSalesInvoiceRecordFromForm(
  values: SalesInvoiceFormValues,
  existingRecord?: SalesInvoiceRecord,
): SalesInvoiceRecord {
  const totals = calculateSalesInvoiceTotals(values.lineItems);

  return {
    id: existingRecord?.id ?? `si-${Date.now()}`,
    amount: totals.netAmount + totals.vatAmount,
    customerName: values.vceName || values.billToName,
    dueDate: values.dueDate,
    formValues: {
      ...values,
      lineItems: values.lineItems.map((item) => ({ ...item })),
    },
    invoiceDate: values.documentDate,
    invoiceNo: values.transNo || values.invoiceNo,
    referenceNo: values.referenceNo,
    status: normalizeSalesInvoiceStatus(values.status),
  };
}
