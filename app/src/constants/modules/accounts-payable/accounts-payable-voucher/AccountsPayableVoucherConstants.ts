import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
  AccountsPayableVoucherPayableType,
  AccountsPayableVoucherStatus,
} from "@/app/src/types/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherTypes";

export const AccountsPayableVoucherHref = MODULE_ROUTE_MAP.APV;

export const AccountsPayableVoucherTablePaginationStorageKey =
  "accounts-payable.accounts-payable-voucher";

export const AccountsPayableVoucherStatusOptions: AccountsPayableVoucherStatus[] =
  ["Draft", "Approved", "Disapproved", "Closed", "Cancelled"];

export const AccountsPayableVoucherStatusFilters = [
  "all",
  ...AccountsPayableVoucherStatusOptions,
] as const;

export const AccountsPayableVoucherStatusFilterOptions =
  AccountsPayableVoucherStatusFilters.map((status) => ({
    label: status === "all" ? "All" : status,
    value: status,
  }));

export function canEditAccountsPayableVoucherStatus(
  status: AccountsPayableVoucherStatus,
) {
  return status === "Draft";
}

export function canApproveAccountsPayableVoucherStatus(
  status: AccountsPayableVoucherStatus,
) {
  return status === "Draft" || status === "Approved";
}

export function canDisapproveAccountsPayableVoucherStatus(
  status: AccountsPayableVoucherStatus,
) {
  return status === "Draft" || status === "Disapproved";
}

export function canCancelAccountsPayableVoucherStatus(
  status: AccountsPayableVoucherStatus,
) {
  return status === "Draft" || status === "Cancelled";
}

export const AccountsPayableVoucherCurrencyOptions = [
  "PHP",
  "USD",
  "EUR",
  "JPY",
] as const;

export const AccountsPayableVoucherPayableTypeOptions: AccountsPayableVoucherPayableType[] =
  [
    "Trade Payable",
    "Non-Trade Payable",
    "Employee Payable",
    "Tax Payable",
    "Accrued Payable",
  ];

export const AccountsPayableVoucherVatTypeOptions = [
  "VATable",
  "VAT Exempt",
  "Zero Rated",
  "Non-VAT",
] as const;

export const AccountsPayableVoucherActionCopy = {
  add: {
    title: "Create New Accounts Payable Voucher",
    description:
      "Record a supplier payable voucher with expense and accounting entries.",
  },
  edit: {
    title: "Edit Accounts Payable Voucher",
    description:
      "Update the supplier, payable details, expenses, and accounting entries.",
  },
  view: {
    title: "View Accounts Payable Voucher",
    description:
      "Review payable voucher header details, expenses, and accounting entries.",
  },
} as const;

export const AccountsPayableVoucherExpenseColumnIds = [
  "expenseType",
  "amount",
  "netAmount",
  "vat",
  "vatPercent",
  "vatAmount",
  "ewt",
  "ewtPercent",
  "ewtAmount",
  "totalAmountDue",
  "partyCode",
  "partyName",
  "particulars",
  "responsibilityCenter",
  "referenceNo",
] as const;

export type AccountsPayableVoucherExpenseColumnId =
  (typeof AccountsPayableVoucherExpenseColumnIds)[number];

export const AccountsPayableVoucherExpenseProtectedColumnIds =
  new Set<AccountsPayableVoucherExpenseColumnId>([
    "expenseType",
    "amount",
  ]);

export const AccountsPayableVoucherExpenseDefaultVisibleColumnIds =
  AccountsPayableVoucherExpenseColumnIds.filter(
    (columnId) => columnId !== "partyCode",
  );

export const AccountsPayableVoucherExpenseColumnLabels: Record<
  AccountsPayableVoucherExpenseColumnId,
  string
> = {
  expenseType: "Payable Type",
  particulars: "Particulars",
  amount: "Gross Amount",
  vatAmount: "VAT Amount",
  netAmount: "Net Amount",
  ewtAmount: "EWT Amount",
  totalAmountDue: "Total Amount Due",
  partyCode: "Party Code",
  partyName: "Party Name",
  vat: "VAT Type",
  vatPercent: "VAT %",
  ewt: "EWT Code",
  ewtPercent: "EWT %",
  responsibilityCenter: "Responsibility Center",
  referenceNo: "Reference No",
};

export const AccountsPayableVoucherExpenseColumnWidths: Record<
  AccountsPayableVoucherExpenseColumnId,
  number
> = {
  expenseType: 235,
  particulars: 320,
  amount: 155,
  vatAmount: 135,
  netAmount: 145,
  ewtAmount: 135,
  totalAmountDue: 165,
  partyCode: 150,
  partyName: 260,
  vat: 190,
  vatPercent: 105,
  ewt: 210,
  ewtPercent: 105,
  responsibilityCenter: 220,
  referenceNo: 180,
};

export const AccountsPayableVoucherAccountingColumnIds = [
  "accountCode",
  "accountTitle",
  "debit",
  "credit",
  "partyCode",
  "partyName",
  "particulars",
  "vatType",
  "atcCode",
  "responsibilityCenter",
  "refNo",
] as const;

export type AccountsPayableVoucherAccountingColumnId =
  (typeof AccountsPayableVoucherAccountingColumnIds)[number];

export const AccountsPayableVoucherAccountingProtectedColumnIds =
  new Set<AccountsPayableVoucherAccountingColumnId>([
    "accountTitle",
    "debit",
    "credit",
  ]);

export const AccountsPayableVoucherAccountingDefaultVisibleColumnIds = [
  "accountTitle",
  "debit",
  "credit",
  "particulars",
] as const satisfies readonly AccountsPayableVoucherAccountingColumnId[];

export const AccountsPayableVoucherAccountingColumnLabels: Record<
  AccountsPayableVoucherAccountingColumnId,
  string
> = {
  accountCode: "Account Code",
  accountTitle: "Account Title",
  particulars: "Particulars",
  debit: "Debit",
  credit: "Credit",
  vatType: "VAT Type",
  atcCode: "EWT Code",
  partyCode: "Party Code",
  partyName: "Party Name",
  responsibilityCenter: "Responsibility Center",
  refNo: "Reference No",
};

export const AccountsPayableVoucherAccountingColumnWidths: Record<
  AccountsPayableVoucherAccountingColumnId,
  number
> = {
  accountCode: 160,
  accountTitle: 260,
  particulars: 320,
  debit: 160,
  credit: 160,
  vatType: 150,
  atcCode: 140,
  partyCode: 150,
  partyName: 220,
  responsibilityCenter: 220,
  refNo: 160,
};
