import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { useRevolvingFundReplenishmentActionPage } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund-replenishment/useRevolvingFundReplenishmentActionPage";
import type { useRevolvingFundReplenishmentOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund-replenishment/useRevolvingFundReplenishmentOverviewPage";

export type RevolvingFundReplenishmentStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";
export type RevolvingFundReplenishmentFormStatus = "Open" | RevolvingFundReplenishmentStatus;
export type RevolvingFundReplenishmentActionMode = "add" | "edit" | "view";
export type RevolvingFundReplenishmentActionTab = "details" | "attachments";
export type RevolvingFundReplenishmentConfirmationAction = "save" | "draft" | "approve" | "disapprove" | "cancel";
export type RevolvingFundReplenishmentActionPageState = ReturnType<typeof useRevolvingFundReplenishmentActionPage>;
export type RevolvingFundReplenishmentOpenSupplierDrawerHandler = (rowId: string) => void;

export type RevolvingFundReplenishmentEntrySectionProps = {
  page: RevolvingFundReplenishmentActionPageState;
  onOpenSupplierDrawer?: RevolvingFundReplenishmentOpenSupplierDrawerHandler;
};
export type RevolvingFundReplenishmentDetailEntryTableProps = RevolvingFundReplenishmentEntrySectionProps;
export type RevolvingFundReplenishmentAccountingEntryTableProps = {
  page: RevolvingFundReplenishmentActionPageState;
};
export type RevolvingFundReplenishmentOverviewPageState = ReturnType<typeof useRevolvingFundReplenishmentOverviewPage>;
export type RevolvingFundReplenishmentEntryTab = "vouchers" | "accounting";

export type RevolvingFundReplenishmentEntry = {
  id: string;
  revolvingFundDate: string;
  revolvingFundNo: string;
  supplierCode: string;
  supplierName: string;
  amount: string;
  netAmount: string;
  vatType: string;
  vatPercent: string;
  vatAmount: string;
  ewtCode: string;
  ewtPercent: string;
  ewtAmount: string;
  disburseAmount: string;
  responsibilityCenterCode: string;
  responsibilityCenterName: string;
  particulars: string;
  remarks?: string;
};

export type RevolvingFundReplenishmentEntryColumnId = Exclude<keyof RevolvingFundReplenishmentEntry, "id" | "remarks">;

export type RevolvingFundReplenishmentAccountingEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: string;
  credit: string;
  partyCode: string;
  partyName: string;
  particulars: string;
  remarks?: string;
};

export type RevolvingFundReplenishmentAccountingColumnId = Exclude<keyof RevolvingFundReplenishmentAccountingEntry, "id" | "remarks">;

export type RevolvingFundReplenishmentDetailEntryColumnsParams = {
  columnLabels: Record<RevolvingFundReplenishmentEntryColumnId, string>;
  columnWidths: Record<RevolvingFundReplenishmentEntryColumnId, number>;
  page: RevolvingFundReplenishmentActionPageState;
  supplierOptions?: import("@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes").AppAdvancedDropdownOption[];
  vatOptions?: import("@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes").AppAdvancedDropdownOption[];
  ewtOptions?: import("@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes").AppAdvancedDropdownOption[];
  responsibilityCenterOptions?: import("@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes").AppAdvancedDropdownOption[];
  onOpenSupplierDrawer?: RevolvingFundReplenishmentOpenSupplierDrawerHandler;
};

export type RevolvingFundReplenishmentAccountingEntryColumnsParams = {
  columnLabels: Record<RevolvingFundReplenishmentAccountingColumnId, string>;
  columnWidths: Record<RevolvingFundReplenishmentAccountingColumnId, number>;
};

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
  responsibilityCenter?: string;
  responsibilityCenterCode?: string;
  projectCode?: string;
  projectName?: string;
  currency?: string;
  exchangeRate?: string;
  amount: number;
  disburseAmount: number;
  remarks: string;
  status: RevolvingFundReplenishmentStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  entries?: RevolvingFundReplenishmentEntry[];
  attachments?: TransactionAttachment[];
  formValues?: RevolvingFundReplenishmentFormValues;
};

export type RevolvingFundReplenishmentFormErrors = Partial<Record<keyof RevolvingFundReplenishmentFormValues | "entries", string>>;
export type RevolvingFundReplenishmentUpdateStatusHandler = (
  record: RevolvingFundReplenishmentRecord,
  status: RevolvingFundReplenishmentStatus,
) => void;
