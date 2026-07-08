export type OfficialReceiptActionMode = "add" | "edit" | "view";

export type OfficialReceiptEntryView = "collection" | "accounting";

export type OfficialReceiptStatus =
  | "Active"
  | "Approved"
  | "Cancelled"
  | "Closed"
  | "Disapproved"
  | "Draft"
  | "Pending";

export type OfficialReceiptRecord = {
  id: string;
  amount: number;
  collectionType: string;
  customerName: string;
  receiptDate: string;
  receiptNo: string;
  referenceNo: string;
  status: OfficialReceiptStatus;
};

export type OfficialReceiptLineEntry = {
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

export type OfficialReceiptFormValues = {
  receiptNo: string;
  receiptDate: string;
  referenceNo: string;
  customerName: string;
  paymentType: string;
  currency: string;
  exchangeRate: string;
  status: string;
  remarks: string;
  lineEntries: OfficialReceiptLineEntry[];
};

export type OfficialReceiptTotals = {
  credit: number;
  debit: number;
  ewt: number;
  grossReceipt: number;
  vat: number;
  vatExempt: number;
};
