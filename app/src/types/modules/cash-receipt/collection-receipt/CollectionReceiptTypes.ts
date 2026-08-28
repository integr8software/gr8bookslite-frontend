import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";

export type CollectionReceiptActionMode = "add" | "edit" | "view";

export type CollectionReceiptActionTab = "details" | "attachments";

export type CollectionReceiptEntryView = "collection" | "accounting";

export type CollectionReceiptStatus = "Cancelled" | "Disapproved" | "Draft" | "For Approval" | "Posted";

export type CollectionReceiptRecord = {
  id: string;
  amount: number;
  collectionType: string;
  customerName: string;
  partyCode: string;
  formValues?: CollectionReceiptFormValues;
  receiptDate: string;
  receiptNo: string;
  referenceNo: string;
  status: CollectionReceiptStatus;
};

export type CollectionReceiptLineEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  collectionType: string;
  customerName: string;
  partyCode: string;
  partyName: string;
  bankName: string;
  checkNo: string;
  checkDate: string;
  grossReceipt: string;
  vatType: string;
  vatPercent: string;
  cwtCode: string;
  cwtPercent: string;
  particulars: string;
  responsibilityCenter: string;
  vatExempt: string;
  vat: string;
  ewt: string;
  debit: string;
  credit: string;
  referenceNo: string;
};

export type CollectionReceiptFormValues = {
  receiptNo: string;
  receiptDate: string;
  referenceNo: string;
  customerName: string;
  partyCode: string;
  paymentType: string;
  paymentId: string;
  bankName: string;
  checkNo: string;
  checkDate: string;
  currency: string;
  exchangeRate: string;
  status: string;
  remarks: string;
  lineEntries: CollectionReceiptLineEntry[];
  attachments?: TransactionAttachment[];
};

export type CollectionReceiptTotals = {
  credit: number;
  debit: number;
  ewt: number;
  grossReceipt: number;
  vat: number;
  vatExempt: number;
};

export type CollectionReceiptCopyFromRecord = AppCopyFromRecord & {
  customerName?: string;
  partyCode?: string;
  paymentType?: string;
  bankName?: string;
  checkNo?: string;
  checkDate?: string;
  currency?: string;
  exchangeRate?: string;
  collectionType?: string;
  grossReceipt?: string;
  vatExempt?: string;
  vat?: string;
  ewt?: string;
  vatType?: string;
  vatPercent?: string;
  cwtCode?: string;
  cwtPercent?: string;
  particulars?: string;
  responsibilityCenter?: string;
  debit?: string;
  credit?: string;
  accountCode?: string;
  accountTitle?: string;
  lineEntries?: CollectionReceiptLineEntry[];
};
