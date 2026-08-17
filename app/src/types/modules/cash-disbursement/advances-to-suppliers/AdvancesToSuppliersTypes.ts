import type { TransactionAttachment } from "@/app/src/types/shared/transaction-setup/TransactionAttachmentTypes";

export type AdvancesToSuppliersStatus =
  | "Draft"
  | "For Approval"
  | "Posted"
  | "Disapproved"
  | "Cancelled";
export type AdvancesToSuppliersFormStatus = "Open" | AdvancesToSuppliersStatus;
export type AdvancesToSuppliersActionMode = "add" | "edit" | "view";
export type AdvancesToSuppliersActionTab = "details" | "attachments";

export type AdvancesToSuppliersFormValues = {
  transactionNo: string;
  documentDate: string;
  status: AdvancesToSuppliersFormStatus;
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
  poReference: string;
  totalPoAmount: string;
  advancePaymentPercentage: string;
  advancePaymentAmount: string;
  remarks: string;
  attachments: TransactionAttachment[];
};

export type AdvancesToSuppliersRecord = {
  id: string;
  transactionNo: string;
  documentDate: string;
  partyCode: string;
  partyName: string;
  accountCode: string;
  accountTitle: string;
  poReference: string;
  totalPoAmount: number;
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

export type AdvancesToSuppliersFormErrors = Partial<
  Record<keyof AdvancesToSuppliersFormValues, string>
>;
export type AdvancesToSuppliersUpdateStatusHandler = (
  record: AdvancesToSuppliersRecord,
  status: AdvancesToSuppliersStatus,
) => void;
