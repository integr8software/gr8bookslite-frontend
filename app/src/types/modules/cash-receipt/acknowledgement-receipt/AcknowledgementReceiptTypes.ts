import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";

export type AcknowledgementReceiptActionMode = "add" | "edit" | "view";

export type AcknowledgementReceiptActionTab = "details" | "attachments";

export type AcknowledgementReceiptEntryView = "collection" | "accounting";

export type AcknowledgementReceiptStatus = "Active" | "Approved" | "Cancelled" | "Closed" | "Disapproved" | "Draft" | "Pending";

export type AcknowledgementReceiptRecord = {
  id: string;
  amount: number;
  collectionType: string;
  customerName: string;
  partyCode: string;
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
  partyCode: string;
  bankName: string;
  checkNo: string;
  checkDate: string;
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
  partyCode: string;
  paymentType: string;
  bankName: string;
  checkNo: string;
  checkDate: string;
  currency: string;
  exchangeRate: string;
  status: string;
  remarks: string;
  lineEntries: AcknowledgementReceiptLineEntry[];
  attachments?: TransactionAttachment[];
};

export type AcknowledgementReceiptTotals = {
  credit: number;
  debit: number;
  ewt: number;
  grossReceipt: number;
  vat: number;
  vatExempt: number;
};

export type AcknowledgementReceiptCopyFromRecord = AppCopyFromRecord & {
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
  debit?: string;
  credit?: string;
  accountCode?: string;
  accountTitle?: string;
  lineEntries?: AcknowledgementReceiptLineEntry[];
};
