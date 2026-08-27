import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { usePettyCashFundReplenishmentActionPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentActionPage";
import type { usePettyCashFundReplenishmentOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund-replenishment/usePettyCashFundReplenishmentOverviewPage";

export type PettyCashFundReplenishmentStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";
export type PettyCashFundReplenishmentFormStatus = "Open" | PettyCashFundReplenishmentStatus;
export type PettyCashFundReplenishmentActionMode = "add" | "edit" | "view";
export type PettyCashFundReplenishmentActionTab = "details" | "attachments";
export type PettyCashFundReplenishmentConfirmationAction = "save" | "draft" | "approve" | "disapprove" | "cancel";
export type PettyCashFundReplenishmentActionPageState = ReturnType<typeof usePettyCashFundReplenishmentActionPage>;
export type PettyCashFundReplenishmentOpenSupplierDrawerHandler = (rowId: string) => void;

export type PettyCashFundReplenishmentEntrySectionProps = {
  page: PettyCashFundReplenishmentActionPageState;
  onOpenSupplierDrawer?: PettyCashFundReplenishmentOpenSupplierDrawerHandler;
};
export type PettyCashFundReplenishmentDetailEntryTableProps = PettyCashFundReplenishmentEntrySectionProps;
export type PettyCashFundReplenishmentAccountingEntryTableProps = {
  page: PettyCashFundReplenishmentActionPageState;
};
export type PettyCashFundReplenishmentOverviewPageState = ReturnType<typeof usePettyCashFundReplenishmentOverviewPage>;
export type PettyCashFundReplenishmentEntryTab = "vouchers" | "accounting";

export type PettyCashFundReplenishmentEntry = {
  id: string;
  pettyCashDate: string;
  pettyCashNo: string;
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
  responsibilityCenterCode: string;
  responsibilityCenterName: string;
  remarks: string;
};

export type PettyCashFundReplenishmentEntryColumnId = Exclude<keyof PettyCashFundReplenishmentEntry, "id">;

export type PettyCashFundReplenishmentAccountingEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: string;
  credit: string;
  partyCode: string;
  partyName: string;
  remarks: string;
};

export type PettyCashFundReplenishmentAccountingColumnId = Exclude<keyof PettyCashFundReplenishmentAccountingEntry, "id">;

export type PettyCashFundReplenishmentDetailEntryColumnsParams = {
  columnLabels: Record<PettyCashFundReplenishmentEntryColumnId, string>;
  columnWidths: Record<PettyCashFundReplenishmentEntryColumnId, number>;
  page: PettyCashFundReplenishmentActionPageState;
  supplierOptions?: import("@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes").AppAdvancedDropdownOption[];
  onOpenSupplierDrawer?: PettyCashFundReplenishmentOpenSupplierDrawerHandler;
};

export type PettyCashFundReplenishmentAccountingEntryColumnsParams = {
  columnLabels: Record<PettyCashFundReplenishmentAccountingColumnId, string>;
  columnWidths: Record<PettyCashFundReplenishmentAccountingColumnId, number>;
};

export type PettyCashFundReplenishmentFormValues = {
  transactionNo: string;
  documentDate: string;
  status: PettyCashFundReplenishmentFormStatus;
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
  entries: PettyCashFundReplenishmentEntry[];
  attachments: TransactionAttachment[];
};

export type PettyCashFundReplenishmentRecord = {
  id: string;
  transactionNo: string;
  documentDate: string;
  partyCode: string;
  partyName: string;
  accountCode: string;
  accountTitle: string;
  amount: number;
  remarks: string;
  status: PettyCashFundReplenishmentStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  formValues?: PettyCashFundReplenishmentFormValues;
};

export type PettyCashFundReplenishmentFormErrors = Partial<Record<keyof PettyCashFundReplenishmentFormValues | "entries", string>>;
export type PettyCashFundReplenishmentUpdateStatusHandler = (
  record: PettyCashFundReplenishmentRecord,
  status: PettyCashFundReplenishmentStatus,
) => void;
