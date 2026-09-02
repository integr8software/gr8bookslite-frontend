import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";
import type { useAdvancesToSuppliersActionPage } from "@/app/src/hooks/modules/cash-disbursement/advances-to-suppliers/useAdvancesToSuppliersActionPage";
import type { useAdvancesToSuppliersOverviewPage } from "@/app/src/hooks/modules/cash-disbursement/advances-to-suppliers/useAdvancesToSuppliersOverviewPage";

export type AdvancesToSuppliersStatus = "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled";
export type AdvancesToSuppliersFormStatus = "Open" | AdvancesToSuppliersStatus;
export type AdvancesToSuppliersActionMode = "add" | "edit" | "view";
export type AdvancesToSuppliersActionTab = "details" | "attachments";
export type AdvancesToSuppliersConfirmationAction = "save" | "draft" | "approve" | "disapprove" | "cancel";
export type AdvancesToSuppliersActionPageState = ReturnType<typeof useAdvancesToSuppliersActionPage>;
export type AdvancesToSuppliersOverviewPageState = ReturnType<typeof useAdvancesToSuppliersOverviewPage>;

export type AdvancesToSuppliersPaymentType = "Percentage" | "Fixed Amount";

export type AdvancesToSuppliersFormValues = {
  transactionNo: string;
  documentDate: string;
  status: AdvancesToSuppliersFormStatus;
  partyId?: string;
  partyCode: string;
  partyName: string;
  accountId?: string;
  responsibilityCenter: string;
  responsibilityCenterCode: string;
  projectCode: string;
  projectName: string;
  accountCode: string;
  accountTitle: string;
  currency: string;
  exchangeRate: string;
  poReference: string;
  totalPoAmount: string;
  advancePaymentType: AdvancesToSuppliersPaymentType;
  advancePaymentPercentage: string;
  advancePaymentAmount: string;
  remarks: string;
  attachments: TransactionAttachment[];
};

export type AdvancesToSuppliersRecord = {
  id: string;
  transactionNo: string;
  documentDate: string;
  partyId?: string;
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
  poReference: string;
  totalPoAmount: number;
  advancePaymentType?: AdvancesToSuppliersPaymentType;
  advancePaymentPercentage: number;
  amount: number;
  remarks: string;
  status: AdvancesToSuppliersStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  formValues?: AdvancesToSuppliersFormValues;
};

export type AdvancesToSuppliersFormErrors = Partial<Record<keyof AdvancesToSuppliersFormValues, string>>;
export type AdvancesToSuppliersUpdateStatusHandler = (record: AdvancesToSuppliersRecord, status: AdvancesToSuppliersStatus) => void;
