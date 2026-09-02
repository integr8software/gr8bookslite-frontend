import type { DisbursementType } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { DisbursementTypeStatuses } from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypes";
import type {
  DisbursementTypeClassification,
  DisbursementTypeFormValues,
  DisbursementTypeRecord,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypes";

export const DisbursementTypeOptions: DisbursementTypeClassification[] = [
  "Vendor Payment",
  "Operating Expense",
  "Reimbursement",
  "Capital Expenditure",
  "Other",
];

export const DisbursementTypeInitialFormValues: DisbursementTypeFormValues = {
  name: "",
  description: "",
  type: "",
  status: DisbursementTypeStatuses.active,
};

export const InitialAppDisbursementTypeRecords: DisbursementTypeRecord[] = [
  {
    id: "disbursement-type-vendor-payment",
    name: "Vendor Payment",
    description: "Payment to suppliers and trade vendors.",
    type: "Vendor Payment",
    status: DisbursementTypeStatuses.active,
  },
  {
    id: "disbursement-type-operating-expense",
    name: "Operating Expense",
    description: "Regular operating expense settlement.",
    type: "Operating Expense",
    status: DisbursementTypeStatuses.active,
  },
  {
    id: "disbursement-type-reimbursement",
    name: "Reimbursement",
    description: "Employee or party reimbursement.",
    type: "Reimbursement",
    status: DisbursementTypeStatuses.active,
  },
  {
    id: "disbursement-type-capital-expenditure",
    name: "Capital Expenditure",
    description: "Asset and capital project disbursement.",
    type: "Capital Expenditure",
    status: DisbursementTypeStatuses.active,
  },
];

export function createDisbursementTypeFormValues(record?: DisbursementTypeRecord): DisbursementTypeFormValues {
  if (!record) {
    return DisbursementTypeInitialFormValues;
  }

  return {
    name: record.name,
    description: record.description,
    type: record.type,
    status: record.status,
  };
}

export function createDisbursementTypeFromForm(values: DisbursementTypeFormValues): DisbursementTypeRecord {
  return {
    id: `disbursement-type-${Date.now()}`,
    name: values.name.trim() as DisbursementType,
    description: values.description.trim(),
    type: values.type as DisbursementTypeClassification,
    status: values.status,
  };
}

export function updateDisbursementTypeFromForm(
  record: DisbursementTypeRecord,
  values: DisbursementTypeFormValues,
): DisbursementTypeRecord {
  return {
    ...record,
    name: values.name.trim() as DisbursementType,
    description: values.description.trim(),
    type: values.type as DisbursementTypeClassification,
    status: values.status,
  };
}

export function normalizeDisbursementTypeRecord(record: DisbursementTypeRecord): DisbursementTypeRecord {
  return {
    ...record,
    name: record.name ?? (record.description as DisbursementType),
    description: record.description ?? "",
    type: record.type ?? (record.name as DisbursementTypeClassification),
    status: record.status ?? DisbursementTypeStatuses.active,
  };
}
