import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { DisbursementAttachment } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export type CashAdvanceMultipleEntryActionMode = "add" | "edit" | "view";

export type CashAdvanceMultipleEntryTab = "items" | "accounting";

export type CashAdvanceMultipleEntryDetailsTab = "details" | "attachment";

export type CashAdvanceMultipleEntryItem = {
  id: string;
  partyCode: string;
  partyName: string;
  particulars: string;
  amount: string;
  responsibilityCenter: string;
};

export type CashAdvanceMultipleEntryAccountingEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: string;
  credit: string;
  partyCode: string;
  partyName: string;
  particulars: string;
  responsibilityCenter: string;
  refNo: string;
};

export type CashAdvanceMultipleEntryFormValues = {
  accountCode: string;
  accountTitle: string;
  attachments: DisbursementAttachment[];
  costCenter: string;
  documentDate: string;
  items: CashAdvanceMultipleEntryItem[];
  accountingEntries: CashAdvanceMultipleEntryAccountingEntry[];
  partyCode: string;
  partyName: string;
  projectRef: string;
  contractNo: string;
  remarks: string;
  status: CashAdvanceStatus;
  totalAmount: string;
  transNo: string;
};

export type CashAdvanceMultipleEntryRecord = {
  id: string;
  transNo: string;
  documentDate: string;
  partyCode: string;
  partyName: string;
  accountCode: string;
  accountTitle: string;
  costCenter: string;
  amount: number;
  remarks: string;
  status: CashAdvanceStatus;
  formValues?: CashAdvanceMultipleEntryFormValues;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};
