export type AcknowledgementReceiptActionMode = "add" | "edit" | "view";

export type AcknowledgementReceiptEntryView = "collection" | "accounting";

export type AcknowledgementReceiptStatus =
  | "Active"
  | "Approved"
  | "Cancelled"
  | "Closed"
  | "Disapproved"
  | "Draft"
  | "Pending";

export type AcknowledgementReceiptRecord = {
  id: string;
  amount: number;
  collectionType: string;
  customerName: string;
  formValues?: AcknowledgementReceiptFormValues;
  receiptDate: string;
  receiptNo: string;
  referenceNo: string;
  status: AcknowledgementReceiptStatus;
};

export type AcknowledgementReceiptLineEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  collectionType: string;
  customerName: string;
  grossReceipt: string;
  vatExempt: string;
  vat: string;
  ewt: string;
  debit: string;
  credit: string;
  referenceNo: string;
};

export type AcknowledgementReceiptFormValues = {
  receiptNo: string;
  receiptDate: string;
  referenceNo: string;
  customerName: string;
  paymentType: string;
  currency: string;
  exchangeRate: string;
  status: string;
  remarks: string;
  lineEntries: AcknowledgementReceiptLineEntry[];
};

export type AcknowledgementReceiptTotals = {
  credit: number;
  debit: number;
  ewt: number;
  grossReceipt: number;
  vat: number;
  vatExempt: number;
};
