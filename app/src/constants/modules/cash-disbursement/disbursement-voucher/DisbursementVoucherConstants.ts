export const DisbursementVoucherHref =
  "/cash-disbursement/disbursement-voucher";

export const DisbursementVoucherTablePaginationStorageKey =
  "cash-disbursement-disbursement-voucher";

export const DisbursementVoucherWorkflowSteps = [
  {
    id: "details",
    title: "Voucher Details",
    description: "Select the transaction and define core payment information.",
  },
  {
    id: "entries",
    title: "Line Entries",
    description: "Capture the debit and credit lines for the disbursement.",
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm the summary before saving the voucher.",
  },
] as const;

export const DisbursementVoucherStatusFilters = [
  "all",
  "Active",
  "Draft",
  "Pending",
  "Approved",
  "Disapproved",
  "Cancelled",
  "Completed",
] as const;

export const DisbursementVoucherStatusFilterOptions = [
  { label: "All Statuses", value: "all" },
  ...DisbursementVoucherStatusFilters.filter((status) => status !== "all").map(
    (status) => ({
      label: status,
      value: status,
    }),
  ),
];

