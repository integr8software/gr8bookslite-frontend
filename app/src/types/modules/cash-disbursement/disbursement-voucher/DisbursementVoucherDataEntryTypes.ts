import type { ReactNode } from "react";
import type { DefaultAccountOptionResponseDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type { PaymentTypeRecord as AppPaymentTypeRecord } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import type { ModuleDataEntryClearAction, ModuleDataEntryColumn } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type {
  DisbursementLineEntry,
  DisbursementTaxDetails,
  DisbursementVoucherBankAccount,
  DisbursementVoucherFormErrors,
  DisbursementVoucherPartyDropdownOption,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { DefaultAccount } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";

export type DisbursementEntryColumnId =
  | "accountCode"
  | "ewtCode"
  | "accountName"
  | "checkDate"
  | "checkNo"
  | "checkStatus"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "refId"
  | "responsibilityCenter"
  | "responsibilityCenterCode"
  | "vatType"
  | "debit"
  | "credit";

export type DisbursementEntryView = "accounting" | "expense";

export type ExpenseEntryColumnId =
  | "disbursementCode"
  | "expenseType"
  | "amount"
  | "checkDate"
  | "checkNo"
  | "checkStatus"
  | "netAmount"
  | "vatCode"
  | "vatPercent"
  | "vatAmount"
  | "ewtCode"
  | "ewtPercent"
  | "ewtAmount"
  | "disburseAmount"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "responsibilityCenter"
  | "responsibilityCenterCode"
  | "refId";

export type VoucherDataEntryProps = {
  bankAccount?: DisbursementVoucherBankAccount | null;
  canAddExpenseType: boolean;
  canAddPartyName: boolean;
  canAddResponsibilityCenter: boolean;
  chartAccountOptions?: AppAdvancedDropdownOption[];
  defaultAccounts: DefaultAccount[] | DefaultAccountOptionResponseDto[];
  entries: DisbursementLineEntry[];
  errors: DisbursementVoucherFormErrors;
  isReadonly: boolean;
  isMultiCheckNumber?: boolean;
  onAddEntries: (count: number) => void;
  onAddExpenseType: () => void;
  onAddPartyName: () => void;
  onAddResponsibilityCenter: (entryId: string) => void;
  onClearEntries: (action: ModuleDataEntryClearAction) => void;
  onDuplicateEntry: (entryId: string) => void;
  onInsertEntry: (entryId: string, position: "above" | "below") => void;
  onMoveEntry: (fromEntryId: string, toEntryId: string) => void;
  onReplaceEntries?: (entries: DisbursementLineEntry[]) => void;
  onUpdateEntry: (entryId: string, field: keyof DisbursementLineEntry, value: string | number) => void;
  onUpdateEntryFields: (entryId: string, updates: Partial<DisbursementLineEntry>) => void;
  paymentMethod?: string;
  paymentTypeRecord?: AppPaymentTypeRecord | null;
  partyOptions: DisbursementVoucherPartyDropdownOption[];
  partyCode: string;
  partyName: string;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  totalCredit: number;
  totalDebit: number;
  onRemoveEntry: (entryId: string) => void;
};

export type DisbursementEntryUpdater = (entryId: string, field: keyof DisbursementLineEntry, value: string | number) => void;

export type DisbursementEntryFieldsUpdater = (entryId: string, updates: Partial<DisbursementLineEntry>) => void;

export type DisbursementAccountingEntryColumnsParams = {
  canAddPartyName: boolean;
  chartAccounts: ModuleChartAccount[];
  columnLabels: Record<DisbursementEntryColumnId, string>;
  columnWidths: Record<DisbursementEntryColumnId, number>;
  ewtOptions?: AppAdvancedDropdownOption[];
  isReadonly: boolean;
  onAddPartyName: () => void;
  onUpdateEntry: DisbursementEntryUpdater;
  onUpdateEntryFields: DisbursementEntryFieldsUpdater;
  partyOptions: DisbursementVoucherPartyDropdownOption[];
  taxCodes: AlphanumericTaxCode[];
  vatOptions?: AppAdvancedDropdownOption[];
};

export type DisbursementExpenseEntryColumnsParams = {
  accountingColumns: Record<DisbursementEntryColumnId, ModuleDataEntryColumn<DisbursementLineEntry>>;
  canAddExpenseType: boolean;
  canAddResponsibilityCenter: boolean;
  ewtOptions: AppAdvancedDropdownOption[];
  expenseAccounts: ModuleChartAccount[];
  expenseColumnLabels: Record<ExpenseEntryColumnId, string>;
  expenseColumnWidths: Record<ExpenseEntryColumnId, number>;
  isReadonly: boolean;
  lineErrors?: Record<string, Partial<Record<string, string>>>;
  onAddExpenseType: () => void;
  onAddResponsibilityCenter: (entryId: string) => void;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  taxCodes: AlphanumericTaxCode[];
  updateExpenseEntryFields: DisbursementEntryFieldsUpdater;
  vatOptions: AppAdvancedDropdownOption[];
};

export type DisbursementVoucherAccountingEntryTableProps = {
  accountingColumns?: Record<DisbursementEntryColumnId, ModuleDataEntryColumn<DisbursementLineEntry>>;
  accountingRows: DisbursementLineEntry[];
  errors: DisbursementVoucherFormErrors;
  isReadonly: boolean;
  title?: ReactNode;
  onAddEntries?: (count: number) => void;
  onClearEntries?: VoucherDataEntryProps["onClearEntries"];
  onDuplicateEntry?: (entryId: string) => void;
  onInsertEntry?: (targetEntryId: string, position: "above" | "below") => void;
  onMoveEntry?: (sourceEntryId: string, targetEntryId: string) => void;
  onRemoveEntry?: (entryId: string) => void;
  totalCredit?: number;
  totalDebit?: number;
  variance?: number;
};

export type DisbursementVoucherDetailEntryTableProps = {
  accountingColumns: Record<DisbursementEntryColumnId, ModuleDataEntryColumn<DisbursementLineEntry>>;
  canAddExpenseType: boolean;
  canAddResponsibilityCenter: boolean;
  errors: DisbursementVoucherFormErrors;
  ewtOptions: AppAdvancedDropdownOption[];
  expenseAccounts: ModuleChartAccount[];
  expenseRows: DisbursementLineEntry[];
  isReadonly: boolean;
  lineErrors?: Record<string, Partial<Record<string, string>>>;
  title?: ReactNode;
  onAddEntries: (count: number) => void;
  onAddExpenseType: () => void;
  onAddResponsibilityCenter: (entryId: string) => void;
  onClearEntries: VoucherDataEntryProps["onClearEntries"];
  onDuplicateEntry: (entryId: string) => void;
  onInsertEntry: (targetEntryId: string, position: "above" | "below") => void;
  onMoveEntry: (sourceEntryId: string, targetEntryId: string) => void;
  onRemoveEntry: (entryId: string) => void;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  taxCodes: AlphanumericTaxCode[];
  updateExpenseEntryFields: DisbursementEntryFieldsUpdater;
  vatOptions: AppAdvancedDropdownOption[];
};

export type EditableDisbursementAccountingGridRow = {
  accountCode: string;
  accountName: string;
  credit: string;
  debit: string;
  id: string;
  particulars: string;
  remarks?: string;
  taxDetails: DisbursementTaxDetails;
  taxRate: string;
};

export type DisbursementAccountingGridColumnId = "accountCode" | "accountName" | "particulars" | "taxRate" | "debit" | "credit";

export type DisbursementAccountingExportTheme = {
  accentColor: string;
  accentContrastColor: string;
  excelAccentArgb: string;
  excelAccentContrastArgb: string;
};
