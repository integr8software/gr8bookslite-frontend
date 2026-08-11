import { CashAdvanceMultipleEntryStatuses } from "@/app/src/constants/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryConstants";
import type {
  CashAdvanceMultipleEntryAccountingEntry,
  CashAdvanceMultipleEntryFormValues,
  CashAdvanceMultipleEntryItem,
  CashAdvanceMultipleEntryRecord,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";

export const CashAdvanceMultipleEntryStorageKey =
  "gr8books.cash-advance-multiple-entry.records";

const TransNoPrefix = "CAME-";
const TransNoPadding = 6;

export const CashAdvanceMultipleEntryPartyOptions = [
  { label: "EMP-0017", name: "Maria Santos", value: "EMP-0017" },
  { label: "EMP-0042", name: "Jose Ramirez", value: "EMP-0042" },
  { label: "EMP-0025", name: "Angela Cruz", value: "EMP-0025" },
  { label: "V000099", name: "ARJAY CAPILI", value: "V000099" },
  { label: "00002", name: "Archipelago Phil Seafarers Training Institute", value: "00002" },
];

export const CashAdvanceMultipleEntryResponsibilityCenterOptions = [
  { label: "Operations", name: "Operations", value: "Operations" },
  { label: "Admin", name: "Admin", value: "Admin" },
  { label: "Sales", name: "Sales", value: "Sales" },
  { label: "1", name: "1", value: "1" },
];

export const MockCashAdvanceMultipleEntryRecords: CashAdvanceMultipleEntryRecord[] = [
  {
    accountCode: "1130-CA",
    accountTitle: "Cash Advance",
    amount: 100,
    costCenter: "1",
    createdAt: "2026-01-22T08:00:00.000Z",
    createdBy: "Current User",
    documentDate: "2026-01-22",
    id: "came-001",
    partyCode: "00002",
    partyName: "Archipelago Phil Seafarers Training Institute",
    remarks: "",
    status: CashAdvanceMultipleEntryStatuses.forApproval,
    transNo: "CAME-000001",
    updatedAt: "2026-01-22T08:00:00.000Z",
    updatedBy: "Current User",
  },
];

export function createBlankCashAdvanceMultipleEntryItem(
  values: Partial<CashAdvanceMultipleEntryItem> = {},
): CashAdvanceMultipleEntryItem {
  return {
    amount: "",
    id: `came-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    particulars: "",
    partyCode: "",
    partyName: "",
    responsibilityCenter: "",
    ...values,
  };
}

export function createBlankCashAdvanceMultipleEntryAccountingEntry(
  values: Partial<CashAdvanceMultipleEntryAccountingEntry> = {},
): CashAdvanceMultipleEntryAccountingEntry {
  return {
    accountCode: "",
    accountTitle: "",
    credit: "",
    debit: "",
    id: `came-accounting-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    particulars: "",
    partyCode: "",
    partyName: "",
    refNo: "",
    responsibilityCenter: "",
    ...values,
  };
}

export function createCashAdvanceMultipleEntryFormValues(): CashAdvanceMultipleEntryFormValues {
  const today = new Date().toISOString().slice(0, 10);

  return {
    accountCode: "",
    accountTitle: "",
    accountingEntries: [createBlankCashAdvanceMultipleEntryAccountingEntry()],
    attachments: [],
    contractNo: "",
    costCenter: "",
    documentDate: today,
    items: [createBlankCashAdvanceMultipleEntryItem()],
    partyCode: "",
    partyName: "",
    projectRef: "",
    remarks: "",
    status: CashAdvanceMultipleEntryStatuses.draft,
    totalAmount: "",
    transNo: createNextCashAdvanceMultipleEntryTransNo(),
  };
}

export function createCashAdvanceMultipleEntryFormValuesFromRecord(
  record: CashAdvanceMultipleEntryRecord,
): CashAdvanceMultipleEntryFormValues {
  if (record.formValues) {
    return {
      ...createCashAdvanceMultipleEntryFormValues(),
      ...record.formValues,
      status: normalizeCashAdvanceMultipleEntryStatus(record.formValues.status),
      transNo: record.formValues.transNo || record.transNo,
    };
  }

  return {
    ...createCashAdvanceMultipleEntryFormValues(),
    accountCode: record.accountCode,
    accountTitle: record.accountTitle,
    costCenter: record.costCenter,
    documentDate: record.documentDate,
    partyCode: record.partyCode,
    partyName: record.partyName,
    remarks: record.remarks,
    status: normalizeCashAdvanceMultipleEntryStatus(record.status),
    totalAmount: String(record.amount || ""),
    transNo: record.transNo,
  };
}

export function createCashAdvanceMultipleEntryRecordFromForm(
  values: CashAdvanceMultipleEntryFormValues,
  existingRecord?: CashAdvanceMultipleEntryRecord,
): CashAdvanceMultipleEntryRecord {
  const now = new Date().toISOString();
  const actor = "Current User";
  const transNo = createCashAdvanceMultipleEntryTransNo(values.transNo, existingRecord);
  const amount = calculateCashAdvanceMultipleEntryTotal(values.items);

  return {
    accountCode: values.accountCode,
    accountTitle: values.accountTitle,
    amount,
    costCenter: values.costCenter,
    createdAt: existingRecord?.createdAt ?? now,
    createdBy: existingRecord?.createdBy ?? actor,
    documentDate: values.documentDate,
    formValues: {
      ...values,
      attachments: values.attachments.map((attachment) => ({ ...attachment })),
      transNo,
      totalAmount: formatCashAdvanceMultipleEntryAmount(amount),
    },
    id: existingRecord?.id ?? `came-${Date.now()}`,
    partyCode: values.partyCode,
    partyName: values.partyName,
    remarks: values.remarks,
    status: normalizeCashAdvanceMultipleEntryStatus(values.status),
    transNo,
    updatedAt: now,
    updatedBy: actor,
  };
}

export function calculateCashAdvanceMultipleEntryTotal(
  rows: CashAdvanceMultipleEntryItem[],
) {
  return rows.reduce((total, row) => total + Number(row.amount || 0), 0);
}

export function formatCashAdvanceMultipleEntryAmount(value: number) {
  return value.toFixed(2);
}

export function getInitialCashAdvanceMultipleEntries() {
  return readStoredCashAdvanceMultipleEntries() ?? MockCashAdvanceMultipleEntryRecords;
}

export function readStoredCashAdvanceMultipleEntries() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedRecords = window.localStorage.getItem(CashAdvanceMultipleEntryStorageKey);

  if (!storedRecords) {
    return null;
  }

  try {
    const parsedRecords = JSON.parse(storedRecords) as CashAdvanceMultipleEntryRecord[];

    return Array.isArray(parsedRecords)
      ? parsedRecords.map(normalizeStoredCashAdvanceMultipleEntryRecord)
      : null;
  } catch {
    return null;
  }
}

export function writeStoredCashAdvanceMultipleEntries(records: CashAdvanceMultipleEntryRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CashAdvanceMultipleEntryStorageKey, JSON.stringify(records));
}

export function countCashAdvanceMultipleEntriesByStatus(
  records: CashAdvanceMultipleEntryRecord[],
  status: CashAdvanceStatus,
) {
  return records.filter((record) => record.status === status).length;
}

export function formatCashAdvanceMultipleEntryPercentage(value: number, total: number) {
  if (total === 0) {
    return "0.00% of total";
  }

  return `${((value / total) * 100).toFixed(2)}% of total`;
}

function createCashAdvanceMultipleEntryTransNo(
  value: string,
  existingRecord?: CashAdvanceMultipleEntryRecord,
) {
  const normalizedValue = value.trim();

  if (normalizedValue) {
    return normalizedValue;
  }

  return createNextCashAdvanceMultipleEntryTransNo(existingRecord?.id);
}

function createNextCashAdvanceMultipleEntryTransNo(excludedRecordId?: string) {
  const existingNumbers = getInitialCashAdvanceMultipleEntries()
    .filter((record) => record.id !== excludedRecordId)
    .map((record) => parseCashAdvanceMultipleEntryTransNoSequence(record.transNo))
    .filter((sequence): sequence is number => sequence !== null);
  const nextSequence = Math.max(0, ...existingNumbers) + 1;

  return `${TransNoPrefix}${String(nextSequence).padStart(TransNoPadding, "0")}`;
}

function parseCashAdvanceMultipleEntryTransNoSequence(value: string) {
  const match = value.trim().match(/^CAME-(\d+)$/);

  return match ? Number(match[1]) : null;
}

function normalizeStoredCashAdvanceMultipleEntryRecord(
  record: CashAdvanceMultipleEntryRecord,
): CashAdvanceMultipleEntryRecord {
  return {
    ...record,
    createdAt: record.createdAt ?? record.documentDate,
    createdBy: record.createdBy ?? record.partyName,
    formValues: record.formValues
      ? {
          ...record.formValues,
          attachments: record.formValues.attachments ?? [],
          status: normalizeCashAdvanceMultipleEntryStatus(record.formValues.status),
        }
      : record.formValues,
    status: normalizeCashAdvanceMultipleEntryStatus(record.status),
    updatedAt: record.updatedAt ?? record.createdAt ?? record.documentDate,
    updatedBy: record.updatedBy ?? record.createdBy ?? record.partyName,
  };
}

function normalizeCashAdvanceMultipleEntryStatus(value: string): CashAdvanceStatus {
  if (value === "Open") {
    return CashAdvanceMultipleEntryStatuses.forApproval;
  }

  const statuses: CashAdvanceStatus[] = [
    CashAdvanceMultipleEntryStatuses.cancelled,
    CashAdvanceMultipleEntryStatuses.disapproved,
    CashAdvanceMultipleEntryStatuses.draft,
    CashAdvanceMultipleEntryStatuses.forApproval,
    CashAdvanceMultipleEntryStatuses.posted,
  ];

  return statuses.includes(value as CashAdvanceStatus)
    ? (value as CashAdvanceStatus)
    : CashAdvanceMultipleEntryStatuses.forApproval;
}
