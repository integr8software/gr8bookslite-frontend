import type { AppTaxRateDialogValue } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";

export type CashAdvanceActionMode = "add" | "edit" | "view";

export type CashAdvanceStatus =
  | "Approved"
  | "Cancelled"
  | "Pending Review"
  | "Draft"
  | "Rejected";

export type CashAdvanceRecord = {
  accountCode: string;
  amount: number;
  costCenter: string;
  documentDate: string;
  formValues?: CashAdvanceFormValues;
  id: string;
  remarks: string;
  status: CashAdvanceStatus;
  partyCode: string;
  partyName: string;
  transNo: string;
};

export type CashAdvanceReferenceField = keyof CashAdvanceReferenceFields;

export type CashAdvanceReferenceFields = {
  containerNo: string;
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
