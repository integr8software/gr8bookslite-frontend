import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { useRevolvingFundReplenishmentActionPage } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund-replenishment/useRevolvingFundReplenishmentActionPage";
import type { useRevolvingFundReplenishmentOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund-replenishment/useRevolvingFundReplenishmentOverviewPage";

export type RevolvingFundReplenishmentStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";
export type RevolvingFundReplenishmentFormStatus = "Open" | RevolvingFundReplenishmentStatus;
export type RevolvingFundReplenishmentActionMode = "add" | "edit" | "view";
export type RevolvingFundReplenishmentActionTab = "details" | "attachments";
export type RevolvingFundReplenishmentConfirmationAction = "save" | "draft" | "approve" | "disapprove" | "cancel";
export type RevolvingFundReplenishmentActionPageState = ReturnType<typeof useRevolvingFundReplenishmentActionPage>;
export type RevolvingFundReplenishmentOverviewPageState = ReturnType<typeof useRevolvingFundReplenishmentOverviewPage>;
export type RevolvingFundReplenishmentEntryTab = "vouchers" | "accounting";

export type RevolvingFundReplenishmentEntry = {
  id: string;
  revolvingFundDate: string;
  revolvingFundNo: string;
  accountCode: string;
  accountTitle: string;
  totalAmount: string;
  netAmount: string;
  vatAmount: string;
  remarks: string;
};

export type RevolvingFundReplenishmentEntryColumnId = Exclude<keyof RevolvingFundReplenishmentEntry, "id">;

export type RevolvingFundReplenishmentAccountingEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: string;
  credit: string;
  partyCode: string;
  partyName: string;
  remarks: string;
};

export type RevolvingFundReplenishmentAccountingColumnId = Exclude<keyof RevolvingFundReplenishmentAccountingEntry, "id">;

export type RevolvingFundReplenishmentFormValues = {
  transactionNo: string;
  documentDate: string;
  status: RevolvingFundReplenishmentFormStatus;
  partyCode: string;
  partyName: string;
  responsibilityCenter: string;
  responsibilityCenterCode: string;
  projectCode: string;
  projectName: string;
  accountCode: string;
  accountTitle: string;
  currency: string;
  exchangeRate: string;
  remarks: string;
  entries: RevolvingFundReplenishmentEntry[];
  attachments: TransactionAttachment[];
};

export type RevolvingFundReplenishmentRecord = {
  id: string;
  transactionNo: string;
  documentDate: string;
  partyCode: string;
  partyName: string;
  accountCode: string;
  accountTitle: string;
  amount: number;
  remarks: string;
  status: RevolvingFundReplenishmentStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  formValues?: RevolvingFundReplenishmentFormValues;
};

export type RevolvingFundReplenishmentFormErrors = Partial<Record<keyof RevolvingFundReplenishmentFormValues | "entries", string>>;
export type RevolvingFundReplenishmentUpdateStatusHandler = (
  record: RevolvingFundReplenishmentRecord,
  status: RevolvingFundReplenishmentStatus,
) => void;
