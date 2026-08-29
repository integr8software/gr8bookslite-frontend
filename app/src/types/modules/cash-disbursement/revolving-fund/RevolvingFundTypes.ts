import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { useRevolvingFundActionPage } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund/useRevolvingFundActionPage";
import type { useRevolvingFundOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/revolving-fund/useRevolvingFundOverviewPage";

export type RevolvingFundStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";
export type RevolvingFundFormStatus = "Open" | RevolvingFundStatus;
export type RevolvingFundActionMode = "add" | "edit" | "view";
export type RevolvingFundActionTab = "details" | "attachments";
export type RevolvingFundConfirmationAction = "save" | "draft" | "approve" | "disapprove" | "cancel";
export type RevolvingFundActionPageState = ReturnType<typeof useRevolvingFundActionPage>;

export type RevolvingFundOpenResponsibilityCenterDrawerHandler = (rowId: string) => void;
export type RevolvingFundOpenSupplierDrawerHandler = (rowId: string) => void;
export type RevolvingFundEntrySectionProps = {
  page: RevolvingFundActionPageState;
  onOpenResponsibilityCenterDrawer?: RevolvingFundOpenResponsibilityCenterDrawerHandler;
  onOpenSupplierDrawer?: RevolvingFundOpenSupplierDrawerHandler;
};
export type RevolvingFundDetailEntryTableProps = RevolvingFundEntrySectionProps;
export type RevolvingFundAccountingEntryTableProps = { page: RevolvingFundActionPageState };
export type RevolvingFundOverviewPageState = ReturnType<typeof useRevolvingFundOverviewPage>;
export type RevolvingFundEntryTab = "items" | "accounting";

export type RevolvingFundItem = {
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

export type RevolvingFundItemColumnId = Exclude<keyof RevolvingFundItem, "id" | "remarks">;

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
  remarks?: string;
};

export type RevolvingFundAccountingColumnId = Exclude<keyof RevolvingFundAccountingEntry, "id" | "remarks">;

export type RevolvingFundRecord = {
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
  status: RevolvingFundStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  formValues?: RevolvingFundFormValues;
};

export type RevolvingFundFormErrors = Partial<Record<keyof RevolvingFundFormValues | "items", string>>;
export type RevolvingFundUpdateStatusHandler = (record: RevolvingFundRecord, status: RevolvingFundStatus) => void;
