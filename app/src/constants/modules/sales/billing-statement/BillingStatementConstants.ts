import type { BillingStatementStatus } from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";

export const BillingStatementHref = "/sales/billing-statement";

export const BillingStatementTablePaginationStorageKey = "sales.billing-statement";

export const BillingStatementCurrencyOptions = ["PHP", "USD", "JPY", "EUR"] as const;

export const BillingStatementPartyOptions = [
  {
    label: "CUST-001",
    name: "North Harbor Office Depot",
    selectedDetails: "CUST-001",
    value: "North Harbor Office Depot",
  },
  {
    label: "CUST-002",
    name: "Aster Foods Corporation",
    selectedDetails: "CUST-002",
    value: "Aster Foods Corporation",
  },
  {
    label: "CUST-003",
    name: "Bluecrest Trading",
    selectedDetails: "CUST-003",
    value: "Bluecrest Trading",
  },
  {
    label: "CUST-004",
    name: "Harborview Logistics",
    selectedDetails: "CUST-004",
    value: "Harborview Logistics",
  },
];

export const BillingStatementResponsibilityCenterOptions = [
  { name: "CC-ADM-001", value: "CC-ADM-001" },
  { name: "CC-SLS-001", value: "CC-SLS-001" },
  { name: "CC-OPS-001", value: "CC-OPS-001" },
];

export const BillingStatementSalesPersonnelOptions = [
  { name: "--Select Sales Personnel--", value: "" },
  { name: "John Doe", value: "John Doe" },
  { name: "Jane Smith", value: "Jane Smith" },
  { name: "Michael Tan", value: "Michael Tan" },
  { name: "Sarah Lee", value: "Sarah Lee" },
  { name: "Sales Team", value: "Sales Team" },
  { name: "Operations", value: "Operations" },
  { name: "Admin", value: "Admin" },
];

export const BillingStatementBooleanOptions = ["False", "True"] as const;

export const BillingStatementDiscountOptions = ["", "0", "5", "10", "15", "20"] as const;

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
