import {
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  CashAdvanceFormValues,
  CashAdvanceRecord,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

export const CashAdvanceStorageKey = "gr8books.cash-advance.records";

export const MockCashAdvanceRecords: CashAdvanceRecord[] = [
  {
    accountCode: "1130-CA",
    amount: 12500,
    costCenter: "Operations",
    documentDate: "2026-06-11",
    id: "ca-001",
    remarks: "Project site travel and meal allowance.",
    status: "Draft",
    partyCode: "EMP-0017",
    partyName: "Maria Santos",
    transNo: "CA-2026-0104",
  },
  {
    accountCode: "1130-CA",
    amount: 8200,
    costCenter: "Admin",
    documentDate: "2026-06-10",
    id: "ca-002",
    remarks: "Office supplies purchase advance.",
    status: "Draft",
    partyCode: "EMP-0042",
    partyName: "Jose Ramirez",
    transNo: "CA-2026-0103",
  },
  {
    accountCode: "1135-OA",
    amount: 30000,
    costCenter: "Sales",
    documentDate: "2026-06-08",
    id: "ca-003",
    remarks: "Client visit representation budget.",
    status: "Pending Review",
    partyCode: "EMP-0025",
    partyName: "Angela Cruz",
    transNo: "CA-2026-0102",
  },
  {
    accountCode: "1130-CA",
    amount: 25000,
    costCenter: "Corporate Affairs",
    documentDate: "2026-06-03",
    id: "ca-004",
    remarks: "Retainer and filing advance for corporate documents.",
    status: "Approved",
    partyCode: "EMP-0031",
    partyName: "Santos and Velasco Legal",
    transNo: "CA-2026-0101",
  },
  {
    accountCode: "1135-OA",
    amount: 4875,
    costCenter: "Supply Chain",
    documentDate: "2026-04-28",
    id: "ca-005",
    remarks: "Freight coordination and local transport advance.",
    status: "Rejected",
    partyCode: "EMP-0058",
    partyName: "Global Freight Movers",
    transNo: "CA-2026-0100",
  },
];

export function createCashAdvanceFormValues(): CashAdvanceFormValues {
  const today = new Date().toISOString().slice(0, 10);

  return {
    accountCode: "",
    amount: "",
    costCenter: "",
    currency: "PHP",
    documentDate: today,
    fxRate: "1.00",
    partyCode: "",
    partyName: "",
    referenceFields: {
      containerNo: "",
      refNo: "",
      projectRef: "",
      importationRefNo: "",
    },
    remarks: "",
    status: "Draft",
    taxValue: {
      taxDetails: createTaxDetails(0, "0%"),
      taxRate: "0%",
    },
    transNo: "Auto-generated on save",
  };
}

export function createCashAdvanceFormValuesFromRecord(
  record: CashAdvanceRecord,
): CashAdvanceFormValues {
  if (record.formValues) {
    return {
      ...createCashAdvanceFormValues(),
      ...record.formValues,
      status: normalizeCashAdvanceStatus(record.formValues.status),
    };
  }

  return {
    ...createCashAdvanceFormValues(),
    accountCode: record.accountCode,
    amount: String(record.amount || ""),
    costCenter: record.costCenter,
    currency: record.formValues?.currency ?? "PHP",
    documentDate: record.documentDate,
    fxRate: record.formValues?.fxRate ?? "1.00",
    partyCode: record.partyCode,
    partyName: record.partyName,
    remarks: record.remarks,
    status: normalizeCashAdvanceStatus(record.status),
    taxValue: {
      taxDetails: syncTaxDetailsAmount(createTaxDetails(0, "0%"), record.amount, "0%"),
      taxRate: "0%",
    },
    transNo: record.transNo,
  };
}

export function createCashAdvanceRecordFromForm(
  values: CashAdvanceFormValues,
  existingRecord?: CashAdvanceRecord,
): CashAdvanceRecord {
  const amount = Number(values.amount || 0);

  return {
    accountCode: values.accountCode,
    amount,
    costCenter: values.costCenter,
    documentDate: values.documentDate,
    formValues: {
      ...values,
      taxValue: {
        ...values.taxValue,
        taxDetails: { ...values.taxValue.taxDetails },
      },
    },
    id: existingRecord?.id ?? `ca-${Date.now()}`,
    remarks: values.remarks,
    status: normalizeCashAdvanceStatus(values.status),
    partyCode: values.partyCode,
    partyName: values.partyName,
    transNo:
      values.transNo === "Auto-generated on save"
        ? `CA-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
        : values.transNo,
  };
}

export function getInitialCashAdvances() {
  return readStoredCashAdvances() ?? MockCashAdvanceRecords;
}

export function readStoredCashAdvances() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedRecords = window.localStorage.getItem(CashAdvanceStorageKey);

  if (!storedRecords) {
    return null;
  }

  try {
    const parsedRecords = JSON.parse(storedRecords) as CashAdvanceRecord[];

    return Array.isArray(parsedRecords)
      ? parsedRecords.map(normalizeStoredCashAdvanceRecord)
      : null;
  } catch {
    return null;
  }
}

export function writeStoredCashAdvances(records: CashAdvanceRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CashAdvanceStorageKey, JSON.stringify(records));
}

export function countCashAdvancesByStatus(
  records: CashAdvanceRecord[],
  status: CashAdvanceStatus,
) {
  return records.filter((record) => record.status === status).length;
}

export function formatCashAdvanceCurrency(value: number) {
  return value.toLocaleString("en-US", {
    currency: "PHP",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  });
}

export function formatCashAdvanceDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatCashAdvancePercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function getCashAdvanceStatusLabel(status: CashAdvanceStatus) {
  if (status === "Pending Review") {
    return "Pending";
  }

  if (status === "Rejected") {
    return "Disapproved";
  }

  return status;
}

function normalizeCashAdvanceStatus(value: string): CashAdvanceStatus {
  const statuses: CashAdvanceStatus[] = [
    "Approved",
    "Cancelled",
    "Draft",
    "Pending Review",
    "Rejected",
  ];

  return statuses.includes(value as CashAdvanceStatus)
    ? (value as CashAdvanceStatus)
    : "Draft";
}

function normalizeStoredCashAdvanceRecord(
  record: CashAdvanceRecord,
): CashAdvanceRecord {
  const status = normalizeCashAdvanceStatus(record.status);

  return {
    ...record,
    formValues: record.formValues
      ? {
          ...record.formValues,
          status: normalizeCashAdvanceStatus(record.formValues.status),
        }
      : record.formValues,
    status,
  };
}
