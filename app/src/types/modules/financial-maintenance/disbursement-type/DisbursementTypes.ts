import type { DisbursementType } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export const DisbursementTypeStatuses = {
  active: "Active",
  inactive: "Inactive",
} as const;

export type DisbursementTypeStatus = (typeof DisbursementTypeStatuses)[keyof typeof DisbursementTypeStatuses];
export type DisbursementTypeClassification =
  | "Vendor Payment"
  | "Operating Expense"
  | "Reimbursement"
  | "Capital Expenditure"
  | "Other"
  | (string & {});
export type DisbursementTypeStatusFilter = "" | DisbursementTypeStatus;
export type DisbursementTypeClassificationFilter = "" | DisbursementTypeClassification;
export type DisbursementTypeSortKey = "name" | "type" | "status";
export type DisbursementTypeSortDirection = "asc" | "desc";

export type DisbursementTypeListParams = {
  search?: string;
  sortBy?: DisbursementTypeSortKey;
  sortDirection?: DisbursementTypeSortDirection;
  status?: DisbursementTypeStatusFilter;
  type?: DisbursementTypeClassificationFilter;
};

export type DisbursementTypeRecord = {
  id: string;
  name: DisbursementType;
  description: string;
  type: DisbursementTypeClassification;
  status: DisbursementTypeStatus;
};

export type DisbursementTypeFormValues = {
  name: string;
  description: string;
  type: DisbursementTypeClassification | "";
  status: DisbursementTypeStatus;
};

export type DisbursementTypeFormErrors = Partial<Record<keyof DisbursementTypeFormValues, string>>;
