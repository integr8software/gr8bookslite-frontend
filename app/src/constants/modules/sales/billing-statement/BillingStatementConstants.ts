import type { BillingStatementStatus } from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";

export const BillingStatementHref = "/sales/billing-statement";

export const BillingStatementStorageKey = "gr8books.billingStatements";

export const BillingStatementTablePaginationStorageKey = "sales.billing-statement";

export const BillingStatementCurrencyOptions = ["PHP", "USD", "JPY", "EUR"] as const;

export const BillingStatementBooleanOptions = ["False", "True"] as const;

export const BillingStatementDiscountOptions = ["", "0", "5", "10", "15", "20"] as const;

export const BillingStatementTypeOptions = ["", "VATable", "Zero Rated", "Exempt"] as const;

export const BillingStatementTermsOptions = [
  "--Select Terms--",
  "COD",
  "Net 15",
  "Net 30",
  "Net 60",
] as const;

export const BillingStatementDescriptionOptions = [
  "--Select Description--",
  "Professional Services",
  "Goods Sold",
  "Rental Billing",
  "Progress Billing",
] as const;

export const BillingStatementDebitAccountOptions = [
  "--Select Debit Account--",
  "Accounts Receivable",
  "Sales Revenue",
  "Unearned Revenue",
] as const;

export const BillingStatementStatusOptions: BillingStatementStatus[] = [
  "Draft",
  "For Approval",
  "Posted",
  "Disapproved",
  "Cancelled",
];

export const BillingStatementStatuses = {
  cancelled: "Cancelled",
  disapproved: "Disapproved",
  draft: "Draft",
  forApproval: "For Approval",
  posted: "Posted",
} as const;

export const BillingStatementStatusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: BillingStatementStatuses.draft, value: BillingStatementStatuses.draft },
  {
    label: BillingStatementStatuses.forApproval,
    value: BillingStatementStatuses.forApproval,
  },
  { label: BillingStatementStatuses.posted, value: BillingStatementStatuses.posted },
  {
    label: BillingStatementStatuses.disapproved,
    value: BillingStatementStatuses.disapproved,
  },
  { label: BillingStatementStatuses.cancelled, value: BillingStatementStatuses.cancelled },
] as const;

export const BillingStatementStatusFilters = [
  "all",
  BillingStatementStatuses.draft,
  BillingStatementStatuses.forApproval,
  BillingStatementStatuses.posted,
  BillingStatementStatuses.disapproved,
  BillingStatementStatuses.cancelled,
] as const;

export const BillingStatementFormPageCopy = {
  add: {
    title: "New Billing Statement",
    description:
      "Capture customer billing details, amounts, references, and item/accounting entries.",
  },
  edit: {
    title: "Edit Billing Statement",
    description:
      "Update customer, amount, reference, and billing line details for this statement.",
  },
  view: {
    title: "Billing Statement",
    description: "Review customer billing details and transaction references.",
  },
} as const;
