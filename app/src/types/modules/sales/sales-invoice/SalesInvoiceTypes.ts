export type SalesInvoiceActionMode = "add" | "edit" | "view";

export type SalesInvoiceStatus =
  | "Active"
  | "Approved"
  | "Cancelled"
  | "Closed"
  | "Draft"
  | "Pending";

export type SalesInvoiceLineItem = {
  id: string;
  amountDue: string;
  barcode: string;
  discount: string;
  ewtAmount: string;
  ewtType: string;
  itemCode: string;
  name: string;
  price: string;
  quantity: string;
  refNo: string;
  resCenter: string;
  returnQuantity: string;
  totalSales: string;
  uom: string;
  vatable: string;
  vatAmount: string;
  vatInc: string;
  vatRate: string;
  vatType: string;
  withEwt: string;
};

export type SalesInvoiceAccountEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: string;
  credit: string;
};

export type SalesInvoiceFormValues = {
  accountEntries: SalesInvoiceAccountEntry[];
  address: string;
  amountDue: string;
  billToCode: string;
  billToName: string;
  branch: string;
  commAmount: string;
  commRemarks: string;
  contactNo: string;
  contactPerson: string;
  currency: string;
  defaultAccount: string;
  discount: string;
  documentDate: string;
  drNo: string;
  dueDate: string;
  ewtAmount: string;
  exchangeRate: string;
  grNo: string;
  icrNo: string;
  invoiceNo: string;
  poNo: string;
  projectName: string;
  projectRef: string;
  referenceNo: string;
  remarks: string;
  resCenter: string;
  salesPersonnel: string;
  sjNo: string;
  soDate: string;
  soNo: string;
  status: string;
  terms: string;
  totalSales: string;
  transNo: string;
  vatAmount: string;
  vceCode: string;
  vceName: string;
  lineItems: SalesInvoiceLineItem[];
};

export type SalesInvoiceRecord = {
  id: string;
  amount: number;
  customerName: string;
  dueDate: string;
  formValues?: SalesInvoiceFormValues;
  invoiceDate: string;
  invoiceNo: string;
  referenceNo: string;
  status: SalesInvoiceStatus;
};

export type SalesInvoiceTotals = {
  discount: number;
  grossAmount: number;
  netAmount: number;
  vatAmount: number;
};
