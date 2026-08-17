import type { PurchasingAccountingEntry } from "@/app/src/types/modules/purchasing/PurchasingAccountingTypes";

export type CashSalesInvoiceStatus = "Cancelled" | "Draft" | "Posted";
export type CashSalesInvoiceActionMode = "add" | "edit" | "view";
export type CashSalesInvoiceEntryTab = "accounting" | "inventory";

export type CashSalesInvoiceFieldUpdater<TValues> = <Key extends keyof TValues>(
  key: Key,
  value: TValues[Key],
) => void;

export type CashSalesInvoiceLineEntry = {
  id: string;
  itemCode: string;
  description: string;
  particulars: string;
  quantity: string;
  uom: string;
  unitPrice: string;
  grossAmount: string;
  vatAmount: string;
  ewtAmount: string;
  discountAmount: string;
  netAmount: string;
  responsibilityCenter: string;
};

export type CashSalesInvoiceFormValues = {
  partyCode: string;
  partyName: string;
  currency: string;
  exchangeRate: string;
  address: string;
  contactNo: string;
  remarks: string;
  terms: string;
  dueDate: string;
  responsibilityCenter: string;
  grossAmount: string;
  vatAmount: string;
  ewtAmount: string;
  discountAmount: string;
  netAmount: string;
  warehouse: string;
  defaultAccount: string;
  transNo: string;
  documentDate: string;
  sjNo: string;
  status: CashSalesInvoiceStatus;
  lineEntries: CashSalesInvoiceLineEntry[];
  accountingEntries: CashSalesInvoiceAccountingEntry[];
};

export type CashSalesInvoiceRecord = {
  id: string;
  amount: number;
  customerCode: string;
  customerName: string;
  documentDate: string;
  sjNo: string;
  status: CashSalesInvoiceStatus;
  transactionNo: string;
  formValues?: CashSalesInvoiceFormValues;
};

export type CashSalesInvoiceAccountingEntry = PurchasingAccountingEntry;
