import type { DefaultAccount } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import type { ModuleDataEntryClearAction, ModuleDataEntryColumn } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { AlphanumericTaxCode } from "@/app/src/types/shared/tax/AlphanumericTaxCodeTypes";
import type {
  CashVoucherLineEntry,
  CashVoucherTaxDetails,
  CashVoucherFormErrors,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";

export type CashVoucherEntryColumnId =
  | "accountCode"
  | "atcCode"
  | "accountName"
  | "checkDate"
  | "checkNo"
  | "checkStatus"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "refId"
  | "responsibilityCenter"
  | "vatType"
  | "debit"
  | "credit";

export type CashVoucherEntryView = "accounting" | "expense";

export type ExpenseEntryColumnId =
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
  | "totalAmountDue"
  | "partyCode"
  | "partyName"
  | "particulars"
  | "responsibilityCenter"
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
  partyCode: string;
  partyName: string;
  totalCredit: number;
  totalDebit: number;
  onRemoveEntry: (entryId: string) => void;
};

export type CashVoucherEntryUpdater = (entryId: string, field: keyof CashVoucherLineEntry, value: string | number) => void;

export type CashVoucherEntryFieldsUpdater = (entryId: string, updates: Partial<CashVoucherLineEntry>) => void;

export type CashVoucherAccountingEntryColumnsParams = {
  canAddPartyName: boolean;
  canAddResponsibilityCenter: boolean;
  chartAccounts: ModuleChartAccount[];
  columnLabels: Record<CashVoucherEntryColumnId, string>;
  columnWidths: Record<CashVoucherEntryColumnId, number>;
  ewtOptions: AppAdvancedDropdownOption[];
  isReadonly: boolean;
  onAddPartyName: () => void;
  onAddResponsibilityCenter: (entryId: string) => void;
  onUpdateEntry: CashVoucherEntryUpdater;
  onUpdateEntryFields: CashVoucherEntryFieldsUpdater;
  partyOptions: AppAdvancedDropdownOption[];
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  vatOptions: AppAdvancedDropdownOption[];
};

export type CashVoucherExpenseEntryColumnsParams = {
  accountingColumns: Record<CashVoucherEntryColumnId, ModuleDataEntryColumn<CashVoucherLineEntry>>;
  canAddExpenseType: boolean;
  ewtOptions: AppAdvancedDropdownOption[];
  expenseAccounts: ModuleChartAccount[];
  expenseColumnLabels: Record<ExpenseEntryColumnId, string>;
  expenseColumnWidths: Record<ExpenseEntryColumnId, number>;
  isReadonly: boolean;
  onAddExpenseType: () => void;
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


