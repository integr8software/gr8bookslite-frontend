import {
  createTaxDetails,
  syncTaxDetailsAmount,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import {
  formatMoneyNumberDisplayValue,
  parseMoneyNumberInput,
} from "@/app/src/data/shared/money/MoneyNumberData";
import { CashAdvanceStatuses } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import type {
  CashAdvanceFormValues,
  CashAdvanceRecord,
  CashAdvanceStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

export const CashAdvanceStorageKey = "gr8books.cash-advance.records";
const CashAdvanceTransNoPrefix = "CA-";
const CashAdvanceTransNoPadding = 6;
const LegacyMockCashAdvanceTransNoById: Record<string, string> = {
  "ca-001": "CA-000005",
  "ca-002": "CA-000004",
  "ca-003": "CA-000003",
  "ca-004": "CA-000002",
  "ca-005": "CA-000001",
};

export const MockCashAdvanceRecords: CashAdvanceRecord[] = [
  {
    accountCode: "1130-CA",
    amount: 12500,
    costCenter: "Operations",
    createdAt: "2026-06-11T08:15:00.000Z",
    createdBy: "Maria Santos",
    documentDate: "2026-06-11",
    id: "ca-001",
    remarks: "Project site travel and meal allowance.",
    status: CashAdvanceStatuses.draft,
    partyCode: "EMP-0017",
    partyName: "Maria Santos",
    transNo: "CA-000005",
    updatedAt: "2026-06-11T08:15:00.000Z",
    updatedBy: "Maria Santos",
  },
  {
    accountCode: "1130-CA",
    amount: 8200,
    costCenter: "Admin",
    createdAt: "2026-06-10T10:05:00.000Z",
    createdBy: "Jose Ramirez",
    documentDate: "2026-06-10",
    id: "ca-002",
    remarks: "Office supplies purchase advance.",
    status: CashAdvanceStatuses.draft,
    partyCode: "EMP-0042",
    partyName: "Jose Ramirez",
    transNo: "CA-000004",
    updatedAt: "2026-06-10T10:05:00.000Z",
    updatedBy: "Jose Ramirez",
  },
  {
    accountCode: "1135-OA",
    amount: 30000,
    costCenter: "Sales",
    createdAt: "2026-06-08T09:30:00.000Z",
    createdBy: "Angela Cruz",
    documentDate: "2026-06-08",
    id: "ca-003",
    remarks: "Client visit representation budget.",
    status: CashAdvanceStatuses.forApproval,
    partyCode: "EMP-0025",
    partyName: "Angela Cruz",
    transNo: "CA-000003",
    updatedAt: "2026-06-09T11:20:00.000Z",
    updatedBy: "Finance Reviewer",
  },
  {
    accountCode: "1130-CA",
    amount: 25000,
    costCenter: "Corporate Affairs",
    createdAt: "2026-06-03T13:20:00.000Z",
    createdBy: "Santos and Velasco Legal",
    documentDate: "2026-06-03",
    id: "ca-004",
    remarks: "Retainer and filing advance for corporate documents.",
    status: CashAdvanceStatuses.posted,
    partyCode: "EMP-0031",
    partyName: "Santos and Velasco Legal",
    transNo: "CA-000002",
    updatedAt: "2026-06-04T15:45:00.000Z",
    updatedBy: "Finance Reviewer",
  },
  {
    accountCode: "1135-OA",
    amount: 4875,
    costCenter: "Supply Chain",
    createdAt: "2026-04-28T11:45:00.000Z",
    createdBy: "Global Freight Movers",
    documentDate: "2026-04-28",
    id: "ca-005",
    remarks: "Freight coordination and local transport advance.",
    status: CashAdvanceStatuses.disapproved,
    partyCode: "EMP-0058",
    partyName: "Global Freight Movers",
    transNo: "CA-000001",
    updatedAt: "2026-04-29T16:10:00.000Z",
    updatedBy: "Finance Reviewer",
  },
];

export function createCashAdvanceFormValues(): CashAdvanceFormValues {
  const today = new Date().toISOString().slice(0, 10);

  return {
    accountCode: "",
    amount: "",
    attachments: [],
    costCenter: "",
    currency: "PHP",
    documentDate: today,
    fxRate: "1.00",
    partyCode: "",
    partyName: "",
    referenceFields: {
      accountCode: "",
      costCenterCode: "",
      partyCode: "",
      projectCode: "",
      refNo: "",
      projectRef: "",
      importationRefNo: "",
    },
    remarks: "",
    status: CashAdvanceStatuses.open,
    taxValue: {
      taxDetails: createTaxDetails(0, "0%"),
      taxRate: "0%",
    },
    transNo: createNextCashAdvanceTransNo(),
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
      transNo: record.formValues.transNo || record.transNo,
    };
  }

  return {
    ...createCashAdvanceFormValues(),
    accountCode: record.accountCode,
    amount: formatMoneyNumberDisplayValue(record.amount || ""),
    costCenter: record.costCenter,
    currency: "PHP",
    documentDate: record.documentDate,
    fxRate: "1.00",
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
  const amount = parseMoneyNumberInput(values.amount);
  const now = new Date().toISOString();
  const actor = "Current User";
  const transNo = createCashAdvanceTransNo(values.transNo, existingRecord);

  return {
    accountCode: values.accountCode,
    amount,
    costCenter: values.costCenter,
    createdAt: existingRecord?.createdAt ?? now,
    createdBy: existingRecord?.createdBy ?? actor,
    documentDate: values.documentDate,
    formValues: {
      ...values,
      attachments: values.attachments.map((attachment) => ({ ...attachment })),
      taxValue: {
        ...values.taxValue,
        taxDetails: { ...values.taxValue.taxDetails },
      },
      transNo,
    },
    id: existingRecord?.id ?? `ca-${Date.now()}`,
    remarks: values.remarks,
    status: normalizeCashAdvanceStatus(values.status),
    partyCode: values.partyCode,
    partyName: values.partyName,
    transNo,
    updatedAt: now,
    updatedBy: actor,
  };
}

export function getInitialCashAdvances() {
  return readStoredCashAdvances() ?? MockCashAdvanceRecords;
}

function createCashAdvanceTransNo(
  value: string,
  existingRecord?: CashAdvanceRecord,
) {
  const normalizedValue = value.trim();

  if (normalizedValue && normalizedValue !== "Auto-generated on save") {
    return normalizedValue;
  }

  return createNextCashAdvanceTransNo(existingRecord?.id);
}

function createNextCashAdvanceTransNo(excludedRecordId?: string) {
  const existingNumbers = getInitialCashAdvances()
    .filter((record) => record.id !== excludedRecordId)
    .map((record) => parseCashAdvanceTransNoSequence(record.transNo))
    .filter((sequence): sequence is number => sequence !== null);
  const nextSequence = Math.max(0, ...existingNumbers) + 1;

  return formatCashAdvanceTransNo(nextSequence);
}

function parseCashAdvanceTransNoSequence(value: string) {
  const match = value.trim().match(/^CA-(\d+)$/);

  return match ? Number(match[1]) : null;
}

function formatCashAdvanceTransNo(sequence: number) {
  return `${CashAdvanceTransNoPrefix}${String(sequence).padStart(
    CashAdvanceTransNoPadding,
    "0",
  )}`;
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
  return status;
}

function normalizeCashAdvanceStatus(value: string): CashAdvanceStatus {
  if (value === "Open") {
    return CashAdvanceStatuses.draft;
  }

  if (value === "Approved") {
    return CashAdvanceStatuses.posted;
  }

  if (value === "Pending Review") {
    return CashAdvanceStatuses.forApproval;
  }

  if (value === "Rejected") {
    return CashAdvanceStatuses.disapproved;
  }

  const statuses: CashAdvanceStatus[] = [
    CashAdvanceStatuses.cancelled,
    CashAdvanceStatuses.disapproved,
    CashAdvanceStatuses.draft,
    CashAdvanceStatuses.forApproval,
    CashAdvanceStatuses.posted,
  ];

  return statuses.includes(value as CashAdvanceStatus)
    ? (value as CashAdvanceStatus)
    : CashAdvanceStatuses.draft;
}

function normalizeStoredCashAdvanceRecord(
  record: CashAdvanceRecord,
): CashAdvanceRecord {
  const status = normalizeCashAdvanceStatus(record.status);
  const transNo = getNormalizedStoredCashAdvanceTransNo(record);

  return {
    ...record,
    createdAt: record.createdAt ?? record.documentDate,
    createdBy: record.createdBy ?? record.partyName,
    formValues: record.formValues
      ? {
          ...record.formValues,
          attachments: record.formValues.attachments ?? [],
          status: normalizeCashAdvanceStatus(record.formValues.status),
          transNo,
        }
      : record.formValues,
    status,
    transNo,
    updatedAt: record.updatedAt ?? record.createdAt ?? record.documentDate,
    updatedBy: record.updatedBy ?? record.createdBy ?? record.partyName,
  };
}

function getNormalizedStoredCashAdvanceTransNo(record: CashAdvanceRecord) {
  const mockTransNo = LegacyMockCashAdvanceTransNoById[record.id];

  if (mockTransNo && /^CA-\d{4}-\d{4}$/.test(record.transNo)) {
    return mockTransNo;
  }

  return record.transNo;
}
