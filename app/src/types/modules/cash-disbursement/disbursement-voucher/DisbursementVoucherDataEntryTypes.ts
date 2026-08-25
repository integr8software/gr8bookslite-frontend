import type { DefaultAccount } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
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
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export type DisbursementEntryColumnId =
  | "accountCode"
  | "atcCode"
  | "accountName"
  | "checkDate"
  | "checkNo"
  | "checkStatus"
  | "partyCode"
  | "partyName"
  | "remarks"
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
  | "totalAmountDue"
  | "partyCode"
  | "partyName"
  | "remarks"
  | "responsibilityCenter"
  | "responsibilityCenterCode"
  | "refId";

export type VoucherDataEntryProps = {
  bankAccount: DisbursementVoucherBankAccount | null;
  canAddExpenseType: boolean;
  canAddPartyName: boolean;
  canAddResponsibilityCenter: boolean;
  defaultAccounts: DefaultAccount[];
  entries: DisbursementLineEntry[];
  errors: DisbursementVoucherFormErrors;
  isReadonly: boolean;
  isMultiCheckNumber: boolean;
  onAddEntries: (count: number) => void;
  onAddExpenseType: () => void;
  onAddPartyName: () => void;
  onAddResponsibilityCenter: (entryId: string) => void;
  onClearEntries: (action: ModuleDataEntryClearAction) => void;
  onDuplicateEntry: (entryId: string) => void;
  onInsertEntry: (entryId: string, position: "above" | "below") => void;
  onMoveEntry: (fromEntryId: string, toEntryId: string) => void;
  onReplaceEntries: (entries: DisbursementLineEntry[]) => void;
  onUpdateEntry: (entryId: string, field: keyof DisbursementLineEntry, value: string | number) => void;
  onUpdateEntryFields: (entryId: string, updates: Partial<DisbursementLineEntry>) => void;
  paymentMethod: string;
  paymentTypeRecord: AppPaymentTypeRecord | null;
  partyCode: string;
  partyName: string;
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
  isReadonly: boolean;
  onAddPartyName: () => void;
  onUpdateEntry: DisbursementEntryUpdater;
  onUpdateEntryFields: DisbursementEntryFieldsUpdater;
  partyOptions: AppAdvancedDropdownOption[];
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
  onAddExpenseType: () => void;
  onAddResponsibilityCenter: (entryId: string) => void;
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
  remarks: string;
  taxDetails: DisbursementTaxDetails;
  taxRate: string;
};

export type DisbursementAccountingGridColumnId = "accountCode" | "accountName" | "remarks" | "taxRate" | "debit" | "credit";

export type DisbursementAccountingExportTheme = {
  accentColor: string;
  accentContrastColor: string;
  excelAccentArgb: string;
  excelAccentContrastArgb: string;
};
