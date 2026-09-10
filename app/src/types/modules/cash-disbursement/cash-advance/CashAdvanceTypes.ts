import type { DisbursementAttachment } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type {
  useCashAdvanceActionForm,
  useCashAdvanceTable,
} from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";

export type CashAdvanceActionMode = "add" | "edit" | "view";
export type CashAdvanceSubmitConfirmationAction = "save" | "draft";

export type CashAdvanceStatus = "Open" | "Draft" | "For Approval" | "Posted" | "Disapproved" | "Cancelled" | "Closed";

export type CashAdvanceEmployeeOption = {
  cashAdvanceBalance: string;
  cashAdvanceLimit: string;
  partyCode: string;
  partyName: string;
};

export type CashAdvanceItem = {
  id: string;
  partyCode: string;
  partyName: string;
  cashAdvanceBalance: string;
  cashAdvanceLimit: string;
  particulars: string;
  remarks?: string;
  amount: string;
  responsibilityCenter: string;
};

export type CashAdvanceAccountingEntry = {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: string;
  credit: string;
  partyCode: string;
  partyName: string;
  particulars: string;
  remarks?: string;
  responsibilityCenter: string;
};

export type CashAdvanceFormValues = {
  accountCode: string;
  accountTitle: string;
  attachments: DisbursementAttachment[];
  costCenter: string;
  currency: string;
  documentDate: string;
  exchangeRate: string;
  items: CashAdvanceItem[];
  accountingEntries: CashAdvanceAccountingEntry[];
  partyCode: string;
  partyName: string;
  projectCode: string;
  projectName: string;
  projectRef?: string;
  contractNo: string;
  remarks: string;
  status: CashAdvanceStatus;
  totalAmount: string;
  transNo: string;
};

export type CashAdvanceRecord = {
  id: string;
  transNo: string;
  documentDate: string;
  partyCode: string;
  partyName: string;
  projectCode?: string;
  projectName?: string;
  projectRef?: string;
  accountCode: string;
  accountTitle: string;
  costCenter: string;
  currency?: string;
  exchangeRate?: string | number;
  amount: number;
  remarks: string;
  status: CashAdvanceStatus;
  formValues?: CashAdvanceFormValues;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type CashAdvanceFormErrors = Partial<Record<keyof CashAdvanceFormValues | "items", string>>;
export type CashAdvanceFormController = ReturnType<typeof useCashAdvanceActionForm>;
export type CashAdvanceTableState = ReturnType<typeof useCashAdvanceTable>;

export type CashAdvanceReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf?: () => void;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  values: CashAdvanceFormValues;
};

export type CashAdvanceTab = "items" | "accounting";
export type CashAdvanceDetailsTab = "details" | "attachment";

export type CashAdvanceStoreState = {
  entries: CashAdvanceRecord[];
  isLoading: boolean;
  lastSyncedAt: number;
  refreshRecords: () => void;
  updateEntryStatus: (record: CashAdvanceRecord, status: CashAdvanceStatus) => void;
};

export type CashAdvanceEntrySectionProps = {
  accountingRows?: CashAdvanceAccountingEntry[];
  isReadonly: boolean;
  rows: CashAdvanceItem[];
  onAccountingRowsChange?: (rows: CashAdvanceAccountingEntry[]) => void;
  onAddAccountingRows?: (count: number) => void;
  onAddRows: (count: number) => void;
  onOpenAccountingPartyDrawer?: (rowId: string) => void;
  onOpenAccountingResponsibilityCenterDrawer?: (rowId: string) => void;
  onOpenItemResponsibilityCenterDrawer: (rowId: string) => void;
  onOpenItemPartyDrawer: (rowId: string) => void;
  responsibilityCenterOptions?: AppAdvancedDropdownOption[];
  onRowsChange: (rows: CashAdvanceItem[]) => void;
};

export type CashAdvanceDetailEntryTableProps = {
  employeeOptions: CashAdvanceEmployeeOption[];
  isReadonly: boolean;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  rows: CashAdvanceItem[];
  onAddRows: (count: number) => void;
  onOpenPartyDrawer: (rowId: string) => void;
  onOpenResponsibilityCenterDrawer: (rowId: string) => void;
  onRowsChange: (rows: CashAdvanceItem[]) => void;
};

export type CashAdvanceAccountingEntryTableProps = {
  employeeOptions: CashAdvanceEmployeeOption[];
  isReadonly: boolean;
  rows: CashAdvanceAccountingEntry[];
  onAddRows: (count: number) => void;
  onOpenPartyDrawer: (rowId: string) => void;
  onOpenResponsibilityCenterDrawer: (rowId: string) => void;
  onRowsChange: (rows: CashAdvanceAccountingEntry[]) => void;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
};

export type CashAdvanceItemColumnsParams = {
  employeeOptions: CashAdvanceEmployeeOption[];
  isReadonly: boolean;
  onOpenItemPartyDrawer: (rowId: string) => void;
  onOpenItemResponsibilityCenterDrawer: (rowId: string) => void;
  onUpdateEntry: (rowId: string, updates: Partial<CashAdvanceItem>) => void;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  rows: CashAdvanceItem[];
};

export type CashAdvanceAccountingColumnsParams = {
  employeeOptions: CashAdvanceEmployeeOption[];
  isReadonly: boolean;
  onOpenAccountingPartyDrawer: (rowId: string) => void;
  onOpenAccountingResponsibilityCenterDrawer: (rowId: string) => void;
  onUpdateEntry: (rowId: string, updates: Partial<CashAdvanceAccountingEntry>) => void;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
};
