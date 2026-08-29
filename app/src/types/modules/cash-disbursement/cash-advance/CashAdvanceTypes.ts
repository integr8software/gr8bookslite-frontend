import type { AppTaxRateDialogValue } from "@/app/src/ui/shared/transaction-setup/AppTaxRateDialog";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { DisbursementAttachment } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { useCashAdvanceActionForm, useCashAdvanceTable } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";

export type CashAdvanceActionMode = "add" | "edit" | "view";
export type CashAdvanceSubmitConfirmationAction = "save" | "draft";

export type CashAdvanceDetailsSection = "advance" | "attachment";

export type CashAdvanceFormController = ReturnType<typeof useCashAdvanceActionForm>;
export type CashAdvanceTableState = ReturnType<typeof useCashAdvanceTable>;

export type CashAdvancePartyDropdownOption = AppAdvancedDropdownOption & {
  availableCashAdvance?: string;
  partyId?: string;
  partyCode?: string;
  partyName?: string;
  cashAdvanceLimit?: string;
  totalCashAdvance?: string;
};

export type CashAdvanceAccountDropdownOption = AppAdvancedDropdownOption & {
  accountId?: string;
  accountCode?: string;
  accountTitle?: string;
};

export type CashAdvanceResponsibilityCenterDropdownOption = AppAdvancedDropdownOption & {
  id?: string;
  code?: string;
  name?: string;
  category?: string;
  financialType?: string;
  typeName?: string;
};

export type CashAdvanceStatus = "Cancelled" | "Disapproved" | "Draft" | "For Approval" | "Open" | "Posted";

export type CashAdvanceRecord = {
  accountCode: string;
  accountTitle?: string;
  amount: number;
  costCenter: string;
  costCenterCode?: string;
  createdAt?: string;
  createdBy?: string;
  currency?: string | null;
  documentDate: string;
  dueDate?: string | null;
  formValues?: CashAdvanceFormValues;
  fxRate?: string | number | null;
  id: string;
  partyId?: string | null;
  partyCode: string;
  partyName: string;
  projectCode?: string | null;
  projectName?: string | null;
  projectRef?: string | null;
  remarks: string;
  status: CashAdvanceStatus;
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
  projectName: string;
  refNo: string;
  projectRef?: string;
  importationRefNo: string;
};

export type CashAdvanceVisibleReferenceFields = Record<CashAdvanceReferenceField, boolean>;

export type CashAdvanceFormValues = {
  accountId?: string;
  accountCode: string;
  accountTitle?: string;
  amount: string;
  attachments: DisbursementAttachment[];
  costCenterId?: string;
  costCenter: string;
  availableCashAdvance: string;
  cashAdvanceLimit: string;
  currency: string;
  documentDate: string;
  fxRate: string;
  partyId?: string;
  partyCode: string;
  partyName: string;
  projectId?: string;
  referenceFields: CashAdvanceReferenceFields;
  remarks: string;
  status: CashAdvanceStatus;
  taxValue: AppTaxRateDialogValue;
  transNo: string;
};

export type CashAdvanceFormErrors = Partial<
  Record<"accountCode" | "accountTitle" | "amount" | "documentDate" | "partyCode" | "partyName" | "transNo", string>
>;

export type CashAdvanceStoreState = {
  advances: CashAdvanceRecord[];
  isLoading: boolean;
  lastSyncedAt: number;
  refreshRecords: () => void;
  updateAdvanceStatus: (record: CashAdvanceRecord, status: CashAdvanceStatus) => void;
};

export type CashAdvanceEmployeeOption = {
  cashAdvanceBalance: string;
  cashAdvanceLimit: string;
  partyCode: string;
  partyName: string;
};

export type CashAdvanceReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf: () => void;
  values: CashAdvanceFormValues;
};
