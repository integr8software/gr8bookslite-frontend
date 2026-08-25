import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";
import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";

export type OfficialReceiptActionMode = "add" | "edit" | "view";

export type OfficialReceiptActionTab = "details" | "attachments";

export type OfficialReceiptEntryView = "collection" | "accounting";

export type OfficialReceiptStatus = "Cancelled" | "Disapproved" | "Draft" | "For Approval" | "Posted";

export type OfficialReceiptRecord = {
  id: string;
  amount: number;
  collectionType: string;
  customerName: string;
  partyCode: string;
  formValues?: OfficialReceiptFormValues;
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

export type OfficialReceiptFormValues = {
  receiptNo: string;
  receiptDate: string;
  referenceNo: string;
  customerName: string;
  partyCode: string;
  paymentType: string;
  currency: string;
  exchangeRate: string;
  status: string;
  remarks: string;
  lineEntries: OfficialReceiptLineEntry[];
  attachments?: TransactionAttachment[];
};

export type OfficialReceiptTotals = {
  credit: number;
  debit: number;
  ewt: number;
  grossReceipt: number;
  vat: number;
  vatExempt: number;
};

export type OfficialReceiptCopyFromRecord = AppCopyFromRecord & {
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
  lineEntries?: OfficialReceiptLineEntry[];
};
