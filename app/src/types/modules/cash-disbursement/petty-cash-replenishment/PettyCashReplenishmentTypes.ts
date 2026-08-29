import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { usePettyCashReplenishmentActionPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentActionPage";
import type { usePettyCashReplenishmentOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-replenishment/usePettyCashReplenishmentOverviewPage";

export type PettyCashReplenishmentStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";
export type PettyCashReplenishmentFormStatus = "Open" | PettyCashReplenishmentStatus;
export type PettyCashReplenishmentActionMode = "add" | "edit" | "view";
export type PettyCashReplenishmentActionTab = "details" | "attachments";
export type PettyCashReplenishmentConfirmationAction = "save" | "draft" | "approve" | "disapprove" | "cancel";
export type PettyCashReplenishmentActionPageState = ReturnType<typeof usePettyCashReplenishmentActionPage>;
export type PettyCashReplenishmentOpenSupplierDrawerHandler = (rowId: string) => void;

export type PettyCashReplenishmentEntrySectionProps = {
  page: PettyCashReplenishmentActionPageState;
  onOpenSupplierDrawer?: PettyCashReplenishmentOpenSupplierDrawerHandler;
};
export type PettyCashReplenishmentDetailEntryTableProps = PettyCashReplenishmentEntrySectionProps;
export type PettyCashReplenishmentAccountingEntryTableProps = {
  page: PettyCashReplenishmentActionPageState;
};
export type PettyCashReplenishmentOverviewPageState = ReturnType<typeof usePettyCashReplenishmentOverviewPage>;
export type PettyCashReplenishmentEntryTab = "vouchers" | "accounting";

export type PettyCashReplenishmentEntry = {
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
  disburseAmount: string;
  responsibilityCenterCode: string;
  responsibilityCenterName: string;
  particulars: string;
  remarks?: string;
};

export type PettyCashReplenishmentEntryColumnId = Exclude<keyof PettyCashReplenishmentEntry, "id" | "remarks">;

export type PettyCashReplenishmentAccountingEntry = {
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

export type PettyCashReplenishmentAccountingColumnId = Exclude<keyof PettyCashReplenishmentAccountingEntry, "id" | "remarks">;

export type PettyCashReplenishmentDetailEntryColumnsParams = {
  columnLabels: Record<PettyCashReplenishmentEntryColumnId, string>;
  columnWidths: Record<PettyCashReplenishmentEntryColumnId, number>;
  page: PettyCashReplenishmentActionPageState;
  supplierOptions?: import("@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes").AppAdvancedDropdownOption[];
  onOpenSupplierDrawer?: PettyCashReplenishmentOpenSupplierDrawerHandler;
};

export type PettyCashReplenishmentAccountingEntryColumnsParams = {
  columnLabels: Record<PettyCashReplenishmentAccountingColumnId, string>;
  columnWidths: Record<PettyCashReplenishmentAccountingColumnId, number>;
};

export type PettyCashReplenishmentFormValues = {
  transactionNo: string;
  documentDate: string;
  status: PettyCashReplenishmentFormStatus;
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
  entries: PettyCashReplenishmentEntry[];
  attachments: TransactionAttachment[];
};

export type PettyCashReplenishmentRecord = {
  id: string;
  transactionNo: string;
  documentDate: string;
  partyCode: string;
  partyName: string;
  accountCode: string;
  accountTitle: string;
  currency?: string;
  exchangeRate?: string;
  amount: number;
  remarks: string;
  status: PettyCashReplenishmentStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  formValues?: PettyCashReplenishmentFormValues;
};

export type PettyCashReplenishmentFormErrors = Partial<Record<keyof PettyCashReplenishmentFormValues | "entries", string>>;
export type PettyCashReplenishmentUpdateStatusHandler = (
  record: PettyCashReplenishmentRecord,
  status: PettyCashReplenishmentStatus,
) => void;
