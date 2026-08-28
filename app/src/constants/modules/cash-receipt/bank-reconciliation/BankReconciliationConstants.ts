import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
  BankReconciliationStatus,
  BankReconciliationTabKey,
} from "@/app/src/types/modules/cash-receipt/bank-reconciliation/BankReconciliationTypes";

export const BankReconciliationHref = MODULE_ROUTE_MAP.BR; // "/cash-receipt/bank-reconciliation"

export const BankReconciliationTablePaginationStorageKey =
  "cash-receipt.bank-reconciliation";

export const BankReconciliationTableColumns = [
  {
    key: "brNo",
    label: "BR No.",
    className: "w-[11rem]",
  },
  {
    key: "endingDate",
    label: "BR Date",
    className: "w-[11rem]",
  },
  {
    key: "bankName",
    label: "Bank",
    className: "w-[16rem]",
  },
  {
    key: "accountCode",
    label: "Account Code",
    className: "w-[12rem]",
  },
  {
    key: "bankBalance",
    label: "Bank Balance",
    className: "w-[11rem] text-right",
  },
  {
    key: "bookBalance",
    label: "Book Balance",
    className: "w-[11rem] text-right",
  },
  {
    key: "variance",
    label: "Variance",
    className: "w-[10rem] text-right",
  },
  {
    key: "status",
    label: "Status",
    className: "w-[10rem]",
  },
  {
    label: "Actions",
    className: "w-[9rem] text-center",
  },
] as const;

export const BankReconciliationTablePreferencesStorageKey =
  "gr8booksneo:bank-reconciliation:table-preferences";
export const BankReconciliationTablePreferencesModuleKey =
  "cash-receipt:bank-reconciliation";

export const BankReconciliationDefaultColumnOrder =
  BankReconciliationTableColumns.map((column) =>
    "key" in column ? column.key : "actions",
  );

export const BankReconciliationDefaultColumnVisibility: VisibilityState = {};

export const BankReconciliationDefaultSorting: SortingState = [
  { id: "endingDate", desc: true },
];

export const BankReconciliationStatusOptions: BankReconciliationStatus[] = [
  "Open",
  "Draft",
  "For Approval",
  "Posted",
  "Disapproved",
  "Cancelled",
];

export const BankReconciliationStatusFilters = [
  "all",
  ...BankReconciliationStatusOptions,
] as const;

export const BankReconciliationStatusFilterOptions =
  BankReconciliationStatusFilters.map((status) => ({
    label: status === "all" ? "All" : status,
    value: status,
  }));

export const BankReconciliationTabs: {
  key: BankReconciliationTabKey;
  label: string;
}[] = [
  { key: "deposit-in-transit", label: "Deposit in Transit" },
  { key: "outstanding-checks", label: "Outstanding Checks" },
  {
    key: "cleared",
    label: "Cleared Deposits & Outstanding Checks",
  },
];

export const BankTemplateOptions = [
  { label: "--Select Bank Template--", value: "" },
  { label: "BDO Statement Parser (.xlsx, .xls)", value: "BDO" },
  { label: "BPI Statement Parser (.xlsx, .xls)", value: "BPI" },
  { label: "Metrobank Statement Parser (.xlsx, .xls)", value: "METROBANK" },
  { label: "UnionBank Statement Parser (.xlsx, .xls)", value: "UNIONBANK" },
  { label: "Security Bank Statement Parser (.xlsx, .xls)", value: "SECURITY_BANK" },
  { label: "Standard Generic Excel Template (.xlsx, .xls, .xlsm)", value: "GENERIC_EXCEL" },
] as const;

export const BankReconciliationActionCopy = {
  add: {
    title: "Create New Bank Reconciliation",
    description: "Reconcile cash in bank ledger against electronic bank statement records.",
  },
  edit: {
    title: "Edit Bank Reconciliation",
    description: "Update bank statement ending balances and match cleared checking transactions.",
  },
  view: {
    title: "View Bank Reconciliation",
    description: "Review bank statement reconciliation summary, cleared items, and variance.",
  },
} as const;

export function canEditBankReconciliationStatus(
  status: BankReconciliationStatus,
) {
  return status === "Open" || status === "Draft" || status === "For Approval";
}

export function canApproveBankReconciliationStatus(
  status: BankReconciliationStatus,
) {
  return status === "For Approval" || status === "Posted";
}

export function canDisapproveBankReconciliationStatus(
  status: BankReconciliationStatus,
) {
  return status === "For Approval" || status === "Disapproved";
}

export function canCancelBankReconciliationStatus(
  status: BankReconciliationStatus,
) {
  return (
    status === "Open" ||
    status === "Draft" ||
    status === "For Approval" ||
    status === "Cancelled"
  );
}
