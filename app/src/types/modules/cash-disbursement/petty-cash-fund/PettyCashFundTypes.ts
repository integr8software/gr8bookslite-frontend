import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";

export type PettyCashFundStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";
export type PettyCashFundFormStatus = "Open" | PettyCashFundStatus;
export type PettyCashFundActionMode = "add" | "edit" | "view";
export type PettyCashFundActionTab = "details" | "attachments";
export type PettyCashFundEntryTab = "items" | "accounting";
export type PettyCashFundBoolean = "False" | "True";

export type PettyCashFundItem = {
  id: string;
  date: string;
  payeeCode: string;
  payeeName: string;
  orNo: string;
  tinNo: string;
  particulars: string;
  amount: string;
  netAmount: string;
  vatAmount: string;
  type: string;
  vatType: string;
  vatable: PettyCashFundBoolean;
  vatInclusive: PettyCashFundBoolean;
  grossAmount: string;
  responsibilityCenter: string;
};

export type PettyCashFundItemColumnId = Exclude<keyof PettyCashFundItem, "id">;

export type PettyCashFundFormValues = {
  transactionNo: string;
  documentDate: string;
  status: PettyCashFundFormStatus;
  partyCode: string;
  partyName: string;
  responsibilityCenter: string;
  responsibilityCenterCode: string;
  currency: string;
  exchangeRate: string;
  accountCode: string;
  accountTitle: string;
  projectCode: string;
  projectName: string;
  remarks: string;
  items: PettyCashFundItem[];
  attachments: TransactionAttachment[];
};

export type PettyCashFundAccountingEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: string;
  credit: string;
  partyCode: string;
  partyName: string;
  particulars: string;
};

export type PettyCashFundAccountingColumnId = Exclude<keyof PettyCashFundAccountingEntry, "id">;

export type PettyCashFundRecord = {
  id: string;
  transactionNo: string;
  documentDate: string;
  partyCode: string;
  partyName: string;
  accountCode: string;
  accountTitle: string;
  amount: number;
  remarks: string;
  status: PettyCashFundStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  formValues?: PettyCashFundFormValues;
};

export type PettyCashFundFormErrors = Partial<Record<keyof PettyCashFundFormValues | "items", string>>;
export type PettyCashFundUpdateStatusHandler = (record: PettyCashFundRecord, status: PettyCashFundStatus) => void;
