import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  SalesInvoiceFormValues,
  SalesInvoiceLineItem,
  SalesInvoiceRecord,
  SalesInvoiceStatus,
  SalesInvoiceTotals,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";

export const SalesInvoiceStorageKey = "gr8books.sales-invoice.invoices";

export const SalesInvoiceCustomerOptions = [
  { name: "Aster Foods Corporation", value: "Aster Foods Corporation" },
  { name: "Northline Retail Group", value: "Northline Retail Group" },
  { name: "Bluecrest Trading", value: "Bluecrest Trading" },
  { name: "Harborview Logistics", value: "Harborview Logistics" },
];

export const SalesInvoiceCurrencyOptions = [
  { name: "PHP", value: "PHP" },
  { name: "USD", value: "USD" },
];

export const SalesInvoiceTermOptions = [
  { name: "Due on receipt", value: "Due on receipt" },
  { name: "Net 15", value: "Net 15" },
  { name: "Net 30", value: "Net 30" },
  { name: "Net 45", value: "Net 45" },
];

export const SalesInvoiceBranchOptions = [
  { name: "Main Branch", value: "Main Branch" },
  { name: "Cebu Branch", value: "Cebu Branch" },
  { name: "Davao Branch", value: "Davao Branch" },
];

export const SalesInvoiceDefaultAccountOptions = [
  { name: "1100 - Accounts Receivable", value: "1100 - Accounts Receivable" },
  { name: "4100 - Sales Revenue", value: "4100 - Sales Revenue" },
];

export const SalesInvoiceResCenterOptions = [
  { name: "--Select Res. Center--", value: "" },
  { name: "Sales Department", value: "Sales Department" },
  { name: "Distribution", value: "Distribution" },
];

export const SalesInvoiceUomOptions = [
  { name: "PCS", value: "PCS" },
  { name: "BOX", value: "BOX" },
  { name: "LOT", value: "LOT" },
];

export const SalesInvoiceBooleanOptions = [
  { name: "False", value: "False" },
  { name: "True", value: "True" },
];

export const SalesInvoiceVatTypeOptions = [
  { name: "VATable", value: "VATable" },
  { name: "VAT Exempt", value: "VAT Exempt" },
  { name: "Zero Rated", value: "Zero Rated" },
];

export const SalesInvoiceEwtTypeOptions = [
  { name: "0.00", value: "0.00" },
  { name: "1.00", value: "1.00" },
  { name: "2.00", value: "2.00" },
];

export const MockSalesInvoices: SalesInvoiceRecord[] = [
  {
    id: "si-001",
    amount: 184500,
    customerName: "Aster Foods Corporation",
    dueDate: "2026-08-02",
    invoiceDate: "2026-07-03",
    invoiceNo: "SI-2026-0001",
    referenceNo: "SO-2026-0188",
    status: "Approved",
  },
  {
    id: "si-002",
    amount: 76250,
    customerName: "Northline Retail Group",
    dueDate: "2026-08-04",
    invoiceDate: "2026-07-05",
    invoiceNo: "SI-2026-0002",
    referenceNo: "DR-2026-0042",
    status: "Pending",
  },
  {
    id: "si-003",
    amount: 52000,
    customerName: "Bluecrest Trading",
    dueDate: "2026-07-24",
    invoiceDate: "2026-07-09",
    invoiceNo: "SI-2026-0003",
    referenceNo: "SO-2026-0196",
    status: "Active",
  },
  {
    id: "si-004",
    amount: 128900,
    customerName: "Harborview Logistics",
    dueDate: "2026-08-12",
    invoiceDate: "2026-07-13",
    invoiceNo: "SI-2026-0004",
    referenceNo: "DR-2026-0061",
    status: "Draft",
  },
];

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

export function createSalesInvoiceFormValues(): SalesInvoiceFormValues {
  return {
    address: "",
    amountDue: "0.00",
    billToCode: "",
    billToName: "",
    branch: "",
    commAmount: "0.00",
    commRemarks: "",
    contactNo: "",
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
    projectRef: "",
    referenceNo: "",
    remarks: "",
    resCenter: "",
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

export function calculateSalesInvoiceTotals(
  lineItems: SalesInvoiceLineItem[],
): SalesInvoiceTotals {
  return lineItems.reduce(
    (summary, item) => {
      const quantity = parseMoneyNumberInput(item.quantity);
      const returnQuantity = parseMoneyNumberInput(item.returnQuantity);
      const unitPrice = parseMoneyNumberInput(item.price);
      const discount = parseMoneyNumberInput(item.discount);
      const vatRate =
        item.vatable === "True" || item.vatType === "VATable"
          ? parseMoneyNumberInput(item.vatRate) / 100
          : 0;
      const grossAmount =
        parseMoneyNumberInput(item.totalSales) ||
        Math.max(quantity - returnQuantity, 0) * unitPrice;
      const netAmount = Math.max(grossAmount - discount, 0);
      const vatAmount = parseMoneyNumberInput(item.vatAmount) || netAmount * vatRate;

      return {
        discount: summary.discount + discount,
        grossAmount: summary.grossAmount + grossAmount,
        netAmount: summary.netAmount + netAmount,
        vatAmount: summary.vatAmount + vatAmount,
      };
    },
    {
      discount: 0,
      grossAmount: 0,
      netAmount: 0,
      vatAmount: 0,
    },
  );
}

export function getInitialSalesInvoices() {
  return readStoredSalesInvoices() ?? MockSalesInvoices;
}

export function readStoredSalesInvoices() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedInvoices = window.localStorage.getItem(SalesInvoiceStorageKey);

  if (!storedInvoices) {
    return null;
  }

  try {
    const parsedInvoices = JSON.parse(storedInvoices) as SalesInvoiceRecord[];

    return Array.isArray(parsedInvoices) ? parsedInvoices : null;
  } catch {
    return null;
  }
}

export function writeStoredSalesInvoices(invoices: SalesInvoiceRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SalesInvoiceStorageKey, JSON.stringify(invoices));
}

export function formatSalesInvoiceCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(amount);
}

export function formatSalesInvoiceDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatSalesInvoicePercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function countSalesInvoicesByStatus(
  invoices: SalesInvoiceRecord[],
  status: SalesInvoiceStatus,
) {
  return invoices.filter((invoice) => invoice.status === status).length;
}

export function isSalesInvoiceActiveStatus(status: SalesInvoiceStatus) {
  return status === "Active" || status === "Approved";
}

export function salesInvoiceLineHasData(item: SalesInvoiceLineItem) {
  return (
    item.amountDue.trim() !== "" ||
    item.barcode.trim() !== "" ||
    item.discount.trim() !== "" ||
    item.ewtAmount.trim() !== "" ||
    item.itemCode.trim() !== "" ||
    item.name.trim() !== "" ||
    item.price.trim() !== "" ||
    item.quantity.trim() !== "" ||
    item.refNo.trim() !== "" ||
    item.resCenter.trim() !== "" ||
    item.returnQuantity.trim() !== "" ||
    item.totalSales.trim() !== "" ||
    item.uom.trim() !== "" ||
    item.vatAmount.trim() !== ""
  );
}

export function salesInvoiceLineIsComplete(item: SalesInvoiceLineItem) {
  return (
    item.name.trim() !== "" &&
    parseMoneyNumberInput(item.quantity) > 0 &&
    parseMoneyNumberInput(item.price) > 0
  );
}

function normalizeSalesInvoiceStatus(value: string): SalesInvoiceStatus {
  const statuses: SalesInvoiceStatus[] = [
    "Active",
    "Approved",
    "Cancelled",
    "Closed",
    "Draft",
    "Pending",
  ];

  return statuses.includes(value as SalesInvoiceStatus)
    ? (value as SalesInvoiceStatus)
    : "Draft";
}
