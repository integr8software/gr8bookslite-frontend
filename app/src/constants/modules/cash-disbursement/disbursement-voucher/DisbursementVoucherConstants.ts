import type { DisbursementVoucherStatus } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

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
  "Closed",
] as const;

export const DisbursementVoucherStatusFilterOptions = [
  { label: "All", value: "all" },
  ...DisbursementVoucherStatusFilters.filter((status) => status !== "all").map(
    (status) => ({
      label: status,
      value: status,
    }),
  ),
];

export function canEditDisbursementVoucherStatus(
  status: DisbursementVoucherStatus,
) {
  return status === "Draft" || status === "Active";
}

export function canApproveDisbursementVoucherStatus(
  status: DisbursementVoucherStatus,
) {
  return status === "Active" || status === "Pending" || status === "Approved";
}

export function canDisapproveDisbursementVoucherStatus(
  status: DisbursementVoucherStatus,
) {
  return (
    status === "Active" || status === "Pending" || status === "Disapproved"
  );
}

export function canCancelDisbursementVoucherStatus(
  status: DisbursementVoucherStatus,
) {
  return (
    status === "Draft" ||
    status === "Active" ||
    status === "Pending" ||
    status === "Cancelled"
  );
}

