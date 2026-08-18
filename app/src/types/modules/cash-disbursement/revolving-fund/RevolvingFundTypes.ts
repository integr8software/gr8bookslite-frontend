import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { useRevolvingFundActionPage } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund/useRevolvingFundActionPage";
import type { useRevolvingFundOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund/useRevolvingFundOverviewPage";

export type RevolvingFundStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";
export type RevolvingFundFormStatus = "Open" | RevolvingFundStatus;
export type RevolvingFundActionMode = "add" | "edit" | "view";
export type RevolvingFundActionTab = "details" | "attachments";
export type RevolvingFundConfirmationAction = "save" | "draft" | "approve" | "disapprove" | "cancel";
export type RevolvingFundActionPageState = ReturnType<typeof useRevolvingFundActionPage>;
export type RevolvingFundOverviewPageState = ReturnType<typeof useRevolvingFundOverviewPage>;
export type RevolvingFundEntryTab = "items" | "accounting";
export type RevolvingFundBoolean = "False" | "True";

export type RevolvingFundItem = {
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
  vatable: RevolvingFundBoolean;
  vatInclusive: RevolvingFundBoolean;
  grossAmount: string;
  responsibilityCenter: string;
};

export type RevolvingFundItemColumnId = Exclude<keyof RevolvingFundItem, "id">;

export type RevolvingFundFormValues = {
  transactionNo: string;
  documentDate: string;
  status: RevolvingFundFormStatus;
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
  items: RevolvingFundItem[];
  attachments: TransactionAttachment[];
};

export type RevolvingFundAccountingEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: string;
  credit: string;
  partyCode: string;
  partyName: string;
  particulars: string;
};

export type RevolvingFundAccountingColumnId = Exclude<keyof RevolvingFundAccountingEntry, "id">;

export type RevolvingFundRecord = {
  id: string;
  transactionNo: string;
  documentDate: string;
  partyCode: string;
  partyName: string;
  accountCode: string;
  accountTitle: string;
  amount: number;
  remarks: string;
  status: RevolvingFundStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  formValues?: RevolvingFundFormValues;
};

export type RevolvingFundFormErrors = Partial<Record<keyof RevolvingFundFormValues | "items", string>>;
export type RevolvingFundUpdateStatusHandler = (record: RevolvingFundRecord, status: RevolvingFundStatus) => void;
