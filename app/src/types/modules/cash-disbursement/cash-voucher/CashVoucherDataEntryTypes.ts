import type { ReactNode } from "react";
import type { DefaultAccount } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import type { ModuleDataEntryClearAction, ModuleDataEntryColumn } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type {
  CashVoucherLineEntry,
  CashVoucherTaxDetails,
  CashVoucherFormErrors,
  CashVoucherPartyDropdownOption,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";

export type CashVoucherEntryColumnId =
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

export type CashVoucherEntryView = "accounting" | "expense";

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
  canAddExpenseType: boolean;
  canAddPartyName: boolean;
  canAddResponsibilityCenter: boolean;
  defaultAccounts: DefaultAccount[];
  entries: CashVoucherLineEntry[];
  errors: CashVoucherFormErrors;
  isReadonly: boolean;
  onAddEntries: (count: number) => void;
  onAddExpenseType: () => void;
  onAddPartyName: () => void;
  onAddResponsibilityCenter: (entryId: string) => void;
  onClearEntries: (action: ModuleDataEntryClearAction) => void;
  onDuplicateEntry: (entryId: string) => void;
  onInsertEntry: (entryId: string, position: "above" | "below") => void;
  onMoveEntry: (fromEntryId: string, toEntryId: string) => void;
  onReplaceEntries: (entries: CashVoucherLineEntry[]) => void;
  onUpdateEntry: (entryId: string, field: keyof CashVoucherLineEntry, value: string | number) => void;
  onUpdateEntryFields: (entryId: string, updates: Partial<CashVoucherLineEntry>) => void;
  partyOptions: CashVoucherPartyDropdownOption[];
  partyCode: string;
  partyName: string;
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  totalCredit: number;
  totalDebit: number;
  onRemoveEntry: (entryId: string) => void;
};

export type CashVoucherEntryUpdater = (entryId: string, field: keyof CashVoucherLineEntry, value: string | number) => void;

export type CashVoucherEntryFieldsUpdater = (entryId: string, updates: Partial<CashVoucherLineEntry>) => void;

export type CashVoucherAccountingEntryColumnsParams = {
  canAddPartyName: boolean;
  chartAccounts: ModuleChartAccount[];
  columnLabels: Record<CashVoucherEntryColumnId, string>;
  columnWidths: Record<CashVoucherEntryColumnId, number>;
  ewtOptions?: AppAdvancedDropdownOption[];
  isReadonly: boolean;
  onAddPartyName: () => void;
  onUpdateEntry: CashVoucherEntryUpdater;
  onUpdateEntryFields: CashVoucherEntryFieldsUpdater;
  partyOptions: CashVoucherPartyDropdownOption[];
  taxCodes: AlphanumericTaxCode[];
  vatOptions?: AppAdvancedDropdownOption[];
};

export type CashVoucherExpenseEntryColumnsParams = {
  accountingColumns: Record<CashVoucherEntryColumnId, ModuleDataEntryColumn<CashVoucherLineEntry>>;
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
  updateExpenseEntryFields: CashVoucherEntryFieldsUpdater;
  vatOptions: AppAdvancedDropdownOption[];
};

export type CashVoucherAccountingEntryTableProps = {
  accountingColumns?: Record<CashVoucherEntryColumnId, ModuleDataEntryColumn<CashVoucherLineEntry>>;
  accountingRows: CashVoucherLineEntry[];
  errors: CashVoucherFormErrors;
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

export type CashVoucherDetailEntryTableProps = {
  accountingColumns: Record<CashVoucherEntryColumnId, ModuleDataEntryColumn<CashVoucherLineEntry>>;
  canAddExpenseType: boolean;
  canAddResponsibilityCenter: boolean;
  errors: CashVoucherFormErrors;
  ewtOptions: AppAdvancedDropdownOption[];
  expenseAccounts: ModuleChartAccount[];
  expenseRows: CashVoucherLineEntry[];
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
  updateExpenseEntryFields: CashVoucherEntryFieldsUpdater;
  vatOptions: AppAdvancedDropdownOption[];
};

export type EditableCashVoucherAccountingGridRow = {
  accountCode: string;
  accountName: string;
  credit: string;
  debit: string;
  id: string;
  particulars: string;
  remarks?: string;
  taxDetails: CashVoucherTaxDetails;
  taxRate: string;
};

export type CashVoucherAccountingGridColumnId = "accountCode" | "accountName" | "particulars" | "taxRate" | "debit" | "credit";

export type CashVoucherAccountingExportTheme = {
  accentColor: string;
  accentContrastColor: string;
  excelAccentArgb: string;
  excelAccentContrastArgb: string;
};

export type GeneratedAccountingAccount = {
  accountCode: string;
  accountName: string;
};

export type GeneratedAccountingAccountMap = Record<string, GeneratedAccountingAccount | undefined>;


