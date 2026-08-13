import type { AppTaxRateDialogValue } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import type { DisbursementAttachment } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export type CashAdvanceActionMode = "add" | "edit" | "view";

export type CashAdvanceStatus =
  | "Cancelled"
  | "Disapproved"
  | "Draft"
  | "For Approval"
  | "Open"
  | "Posted";

export type CashAdvanceRecord = {
  accountCode: string;
  amount: number;
  costCenter: string;
  createdAt?: string;
  createdBy?: string;
  documentDate: string;
  formValues?: CashAdvanceFormValues;
  id: string;
  remarks: string;
  status: CashAdvanceStatus;
  partyCode: string;
  partyName: string;
  transNo: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type CashAdvanceReferenceField = keyof CashAdvanceReferenceFields;

export type CashAdvanceReferenceFields = {
  accountCode: string;
  costCenterCode: string;
  partyCode: string;
  projectCode: string;
  refNo: string;
  projectRef: string;
  importationRefNo: string;
};

export type CashAdvanceVisibleReferenceFields = Record<
  CashAdvanceReferenceField,
  boolean
>;

export type CashAdvanceFormValues = {
  accountCode: string;
  amount: string;
  attachments: DisbursementAttachment[];
  costCenter: string;
  currency: string;
  documentDate: string;
  fxRate: string;
  partyCode: string;
  partyName: string;
  referenceFields: CashAdvanceReferenceFields;
  remarks: string;
  status: CashAdvanceStatus;
  taxValue: AppTaxRateDialogValue;
  transNo: string;
};

export type CashAdvanceReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf: () => void;
  values: CashAdvanceFormValues;
};
