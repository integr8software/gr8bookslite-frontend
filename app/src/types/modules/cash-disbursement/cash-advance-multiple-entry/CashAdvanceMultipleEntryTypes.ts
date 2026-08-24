import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { DisbursementAttachment } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type {
  useCashAdvanceMultipleEntryActionForm,
  useCashAdvanceMultipleEntryTable,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance-multiple-entry/useCashAdvanceMultipleEntry";

export type CashAdvanceMultipleEntryActionMode = "add" | "edit" | "view";
export type CashAdvanceMultipleEntrySubmitConfirmationAction = "save" | "draft";
export type CashAdvanceMultipleEntryFormController = ReturnType<typeof useCashAdvanceMultipleEntryActionForm>;
export type CashAdvanceMultipleEntryTableState = ReturnType<typeof useCashAdvanceMultipleEntryTable>;

export type CashAdvanceMultipleEntryReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf?: () => void;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  values: CashAdvanceMultipleEntryFormValues;
};

export type CashAdvanceMultipleEntryTab = "items" | "accounting";

export type CashAdvanceMultipleEntryDetailsTab = "details" | "attachment";

export type CashAdvanceMultipleEntryItem = {
  id: string;
  partyCode: string;
  partyName: string;
  cashAdvanceBalance: string;
  remarks: string;
  amount: string;
  responsibilityCenter: string;
};

export type CashAdvanceMultipleEntryAccountingEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: string;
  credit: string;
  partyCode: string;
  partyName: string;
  remarks: string;
  responsibilityCenter: string;
};

export type CashAdvanceMultipleEntryFormValues = {
  accountCode: string;
  accountTitle: string;
  attachments: DisbursementAttachment[];
  costCenter: string;
  currency: string;
  documentDate: string;
  exchangeRate: string;
  items: CashAdvanceMultipleEntryItem[];
  accountingEntries: CashAdvanceMultipleEntryAccountingEntry[];
  partyCode: string;
  partyName: string;
  projectCode: string;
  projectRef: string;
  contractNo: string;
  remarks: string;
  status: CashAdvanceStatus;
  totalAmount: string;
  transNo: string;
};

export type CashAdvanceMultipleEntryRecord = {
  id: string;
  transNo: string;
  documentDate: string;
  partyCode: string;
  partyName: string;
  projectCode?: string;
  accountCode: string;
  accountTitle: string;
  costCenter: string;
  amount: number;
  remarks: string;
  status: CashAdvanceStatus;
  formValues?: CashAdvanceMultipleEntryFormValues;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type CashAdvanceMultipleEntryStoreState = {
  entries: CashAdvanceMultipleEntryRecord[];
  isLoading: boolean;
  lastSyncedAt: number;
  refreshRecords: () => void;
  updateEntryStatus: (record: CashAdvanceMultipleEntryRecord, status: CashAdvanceStatus) => void;
};
