import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { usePettyCashVoucherActionPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherActionPage";
import type { usePettyCashVoucherOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherOverviewPage";

export type PettyCashVoucherStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled" | "Closed";
export type PettyCashVoucherFormStatus = "Open" | PettyCashVoucherStatus;
export type PettyCashVoucherActionMode = "add" | "edit" | "view";
export type PettyCashVoucherActionTab = "details" | "attachments";
export type PettyCashVoucherConfirmationAction = "save" | "draft" | "approve" | "disapprove" | "cancel";
export type PettyCashVoucherActionPageState = ReturnType<typeof usePettyCashVoucherActionPage>;

export type PettyCashVoucherOpenResponsibilityCenterDrawerHandler = (rowId: string) => void;
export type PettyCashVoucherOpenSupplierDrawerHandler = (rowId: string) => void;
export type PettyCashVoucherEntrySectionProps = {
  page: PettyCashVoucherActionPageState;
  onOpenResponsibilityCenterDrawer?: PettyCashVoucherOpenResponsibilityCenterDrawerHandler;
  onOpenSupplierDrawer?: PettyCashVoucherOpenSupplierDrawerHandler;
};
export type PettyCashVoucherDetailEntryTableProps = PettyCashVoucherEntrySectionProps;
export type PettyCashVoucherAccountingEntryTableProps = { page: PettyCashVoucherActionPageState };
export type PettyCashVoucherOverviewPageState = ReturnType<typeof usePettyCashVoucherOverviewPage>;
export type PettyCashVoucherEntryTab = "items" | "accounting";

export type PettyCashVoucherItem = {
  id: string;
  date: string;
  supplierCode: string;
  supplierName: string;
  orNo: string;
  tinNo: string;
  particulars: string;
  remarks?: string;
  amount: string;
  netAmount: string;
  vatPercent: string;
  vatAmount: string;
  ewtCode: string;
  ewtPercent: string;
  ewtAmount: string;
  disburseAmount: string;
  type: string;
  vatType: string;
  grossAmount: string;
  responsibilityCenterCode: string;
  responsibilityCenterName: string;
};

export type PettyCashVoucherItemColumnId = Exclude<keyof PettyCashVoucherItem, "id" | "remarks">;

export type PettyCashVoucherFormValues = {
  transactionNo: string;
  documentDate: string;
  status: PettyCashVoucherFormStatus;
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
  items: PettyCashVoucherItem[];
  attachments: TransactionAttachment[];
};

export type PettyCashVoucherAccountingEntry = {
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

export type PettyCashVoucherAccountingColumnId = Exclude<keyof PettyCashVoucherAccountingEntry, "id" | "remarks">;

export type PettyCashVoucherRecord = {
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
  status: PettyCashVoucherStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  items?: PettyCashVoucherItem[];
  attachments?: TransactionAttachment[];
  formValues?: PettyCashVoucherFormValues;
};

export type PettyCashVoucherFormErrors = Partial<Record<keyof PettyCashVoucherFormValues | "items", string>>;
export type PettyCashVoucherUpdateStatusHandler = (record: PettyCashVoucherRecord, status: PettyCashVoucherStatus) => void;
